"""
SQL Query Builder for Layer 2 Direct Database Search
Builds dynamic SQL queries for Supabase based on extracted parameters
"""

import json
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import numpy as np

from ..database.supabase_client import db_client
from ..config.settings import config
from .parameter_extractor import ExtractedParameters

@dataclass
class SQLQueryResult:
    """Container for SQL query results"""
    success: bool
    tables_queried: List[str]
    total_rows: int
    data: Dict[str, List[Dict[str, Any]]]
    query_details: Dict[str, Any]
    error_message: Optional[str] = None

class AdvancedSQLQueryBuilder:
    """Builds and executes advanced SQL queries for BGC Argo data"""

    def __init__(self):
        """Initialize SQL query builder"""
        self.tables = config.get_table_list()

        # Cache table schemas for efficient querying
        self.table_schemas = {}
        self._cache_schemas()

    def _cache_schemas(self):
        """Cache table schemas to optimize query building"""
        print("Caching table schemas for SQL optimization...")
        sample_count = min(5, len(self.tables))
        for table in self.tables[:sample_count]:
            try:
                schema = db_client.get_table_schema(table)
                if schema and schema.get("columns"):
                    self.table_schemas[table] = schema["columns"]
            except Exception as e:
                print(f"Could not cache schema for {table}: {e}")

        # Use first successful schema as template for others
        if self.table_schemas:
            template_columns = list(self.table_schemas.values())[0]
            for table in self.tables:
                if table not in self.table_schemas:
                    self.table_schemas[table] = template_columns

    def execute_layer2_search(self, params: ExtractedParameters, limit_per_table: int = 50) -> SQLQueryResult:
        """
        Execute Layer 2 direct database search using extracted parameters

        Args:
            params: Extracted parameters from query
            limit_per_table: Maximum rows per table

        Returns:
            SQLQueryResult with matching data
        """
        if not params.has_parameters():
            return SQLQueryResult(
                success=False,
                tables_queried=[],
                total_rows=0,
                data={},
                query_details={},
                error_message="No parameters extracted for SQL search"
            )

        # Build filters from parameters
        filters = self._build_filters_from_params(params)

        # Search across tables
        all_results = {}
        tables_with_data = []
        total_rows = 0

        # Prioritize tables based on parameters
        prioritized_tables = self._prioritize_tables(params)

        for table in prioritized_tables[:20]:  # Limit to top 20 tables for performance
            try:
                # Apply filters to table
                rows = db_client.apply_filters_to_table(table, filters, limit=limit_per_table)

                if rows:
                    # Additional filtering for complex conditions
                    filtered_rows = self._apply_complex_filters(rows, params)

                    if filtered_rows:
                        all_results[table] = filtered_rows
                        tables_with_data.append(table)
                        total_rows += len(filtered_rows)

            except Exception as e:
                print(f"Error querying {table}: {e}")
                continue

        # Calculate aggregate statistics if data found
        aggregates = {}
        if all_results:
            aggregates = self._calculate_aggregates(all_results, params)

        return SQLQueryResult(
            success=bool(all_results),
            tables_queried=tables_with_data,
            total_rows=total_rows,
            data=all_results,
            query_details={
                "filters_applied": filters,
                "parameters": self._params_to_dict(params),
                "aggregates": aggregates
            }
        )

    def _build_filters_from_params(self, params: ExtractedParameters) -> List[Dict[str, Any]]:
        """Convert extracted parameters to Supabase filter format"""
        filters = []

        # Oxygen filters
        if params.oxygen_conditions:
            if "min" in params.oxygen_conditions and "max" in params.oxygen_conditions:
                filters.append({
                    "column": "doxy",
                    "op": "between",
                    "value": [params.oxygen_conditions["min"], params.oxygen_conditions["max"]]
                })
            elif "min" in params.oxygen_conditions:
                filters.append({
                    "column": "doxy",
                    "op": "gte",
                    "value": params.oxygen_conditions["min"]
                })
            elif "max" in params.oxygen_conditions:
                filters.append({
                    "column": "doxy",
                    "op": "lte",
                    "value": params.oxygen_conditions["max"]
                })

        # Chlorophyll filters
        if params.chlorophyll_conditions:
            if "min" in params.chlorophyll_conditions:
                filters.append({
                    "column": "chla",
                    "op": "gte",
                    "value": params.chlorophyll_conditions["min"]
                })
            if "max" in params.chlorophyll_conditions:
                filters.append({
                    "column": "chla",
                    "op": "lte",
                    "value": params.chlorophyll_conditions["max"]
                })

        # pH filters
        if params.ph_conditions:
            if "max" in params.ph_conditions:
                filters.append({
                    "column": "ph_in_situ_total",
                    "op": "lte",
                    "value": params.ph_conditions["max"]
                })

        # Nitrate filters
        if params.nitrate_conditions:
            if "min" in params.nitrate_conditions:
                filters.append({
                    "column": "nitrate",
                    "op": "gte",
                    "value": params.nitrate_conditions["min"]
                })
            if "max" in params.nitrate_conditions:
                filters.append({
                    "column": "nitrate",
                    "op": "lte",
                    "value": params.nitrate_conditions["max"]
                })

        # Geographic filters
        if params.latitude_range:
            filters.append({
                "column": "latitude",
                "op": "between",
                "value": [params.latitude_range[0], params.latitude_range[1]]
            })

        if params.longitude_range:
            filters.append({
                "column": "longitude",
                "op": "between",
                "value": [params.longitude_range[0], params.longitude_range[1]]
            })

        # Platform type filter
        if params.platform_types:
            filters.append({
                "column": "platform_type",
                "op": "in",
                "value": params.platform_types
            })

        # Project filter
        if params.projects:
            filters.append({
                "column": "project_name",
                "op": "in",
                "value": params.projects
            })

        return filters

    def _apply_complex_filters(self, rows: List[Dict[str, Any]], params: ExtractedParameters) -> List[Dict[str, Any]]:
        """Apply complex filters that can't be handled by simple SQL"""
        filtered_rows = rows

        # Filter for array-based columns (e.g., doxy, chla might be arrays)
        if params.oxygen_conditions:
            filtered_rows = self._filter_array_column(
                filtered_rows, "doxy", params.oxygen_conditions
            )

        if params.chlorophyll_conditions:
            filtered_rows = self._filter_array_column(
                filtered_rows, "chla", params.chlorophyll_conditions
            )

        # Filter for mobility (requires calculation)
        if params.mobility_threshold:
            filtered_rows = self._filter_by_mobility(filtered_rows, params.mobility_threshold)

        return filtered_rows

    def _filter_array_column(self, rows: List[Dict[str, Any]], column: str, conditions: Dict[str, float]) -> List[Dict[str, Any]]:
        """Filter rows where column might contain array values"""
        filtered = []

        for row in rows:
            if column not in row or row[column] is None:
                continue

            values = row[column]

            # Handle both single values and arrays
            if not isinstance(values, list):
                values = [values]

            # Check if any value in array meets conditions
            meets_condition = False

            if "min" in conditions and "max" in conditions:
                meets_condition = any(
                    conditions["min"] <= v <= conditions["max"]
                    for v in values if v is not None
                )
            elif "min" in conditions:
                meets_condition = any(
                    v >= conditions["min"]
                    for v in values if v is not None
                )
            elif "max" in conditions:
                meets_condition = any(
                    v <= conditions["max"]
                    for v in values if v is not None
                )

            if meets_condition:
                filtered.append(row)

        return filtered

    def _filter_by_mobility(self, rows: List[Dict[str, Any]], threshold: float) -> List[Dict[str, Any]]:
        """Filter rows based on geographic mobility"""
        if len(rows) < 2:
            return rows

        # Calculate mobility range
        lats = [r.get("latitude") for r in rows if r.get("latitude") is not None]
        lons = [r.get("longitude") for r in rows if r.get("longitude") is not None]

        if lats and lons:
            lat_range = max(lats) - min(lats)
            lon_range = max(lons) - min(lons)

            # Check if mobility exceeds threshold
            if lat_range >= threshold or lon_range >= threshold:
                return rows

        return []

    def _prioritize_tables(self, params: ExtractedParameters) -> List[str]:
        """Prioritize tables based on query parameters"""
        prioritized = []

        # If specific regions mentioned, prioritize tables in those regions
        if params.regions:
            # Load metadata to check regions
            try:
                with open(config.METADATA_PATH, 'r') as f:
                    metadata = json.load(f)

                for meta in metadata:
                    table_name = meta.get("table")
                    summary = meta.get("summary", "").lower()

                    for region in params.regions:
                        if region in summary:
                            prioritized.append(table_name)
                            break
            except Exception:
                pass

        # Add remaining tables
        for table in self.tables:
            if table not in prioritized:
                prioritized.append(table)

        return prioritized

    def _calculate_aggregates(self, results: Dict[str, List[Dict[str, Any]]], params: ExtractedParameters) -> Dict[str, Any]:
        """Calculate aggregate statistics from results"""
        aggregates = {}

        # Collect all values for aggregation
        all_oxygen = []
        all_chlorophyll = []
        all_ph = []
        all_nitrate = []

        for table, rows in results.items():
            for row in rows:
                # Extract oxygen values
                if "doxy" in row and row["doxy"] is not None:
                    if isinstance(row["doxy"], list):
                        all_oxygen.extend([v for v in row["doxy"] if v is not None])
                    else:
                        all_oxygen.append(row["doxy"])

                # Extract chlorophyll values
                if "chla" in row and row["chla"] is not None:
                    if isinstance(row["chla"], list):
                        all_chlorophyll.extend([v for v in row["chla"] if v is not None])
                    else:
                        all_chlorophyll.append(row["chla"])

                # Extract pH values
                if "ph_in_situ_total" in row and row["ph_in_situ_total"] is not None:
                    if isinstance(row["ph_in_situ_total"], list):
                        all_ph.extend([v for v in row["ph_in_situ_total"] if v is not None])
                    else:
                        all_ph.append(row["ph_in_situ_total"])

                # Extract nitrate values
                if "nitrate" in row and row["nitrate"] is not None:
                    if isinstance(row["nitrate"], list):
                        all_nitrate.extend([v for v in row["nitrate"] if v is not None])
                    else:
                        all_nitrate.append(row["nitrate"])

        # Calculate statistics
        if all_oxygen:
            aggregates["oxygen"] = {
                "mean": float(np.mean(all_oxygen)),
                "min": float(np.min(all_oxygen)),
                "max": float(np.max(all_oxygen)),
                "count": len(all_oxygen)
            }

        if all_chlorophyll:
            aggregates["chlorophyll"] = {
                "mean": float(np.mean(all_chlorophyll)),
                "min": float(np.min(all_chlorophyll)),
                "max": float(np.max(all_chlorophyll)),
                "count": len(all_chlorophyll)
            }

        if all_ph:
            aggregates["pH"] = {
                "mean": float(np.mean(all_ph)),
                "min": float(np.min(all_ph)),
                "max": float(np.max(all_ph)),
                "count": len(all_ph)
            }

        if all_nitrate:
            aggregates["nitrate"] = {
                "mean": float(np.mean(all_nitrate)),
                "min": float(np.min(all_nitrate)),
                "max": float(np.max(all_nitrate)),
                "count": len(all_nitrate)
            }

        return aggregates

    def _params_to_dict(self, params: ExtractedParameters) -> Dict[str, Any]:
        """Convert ExtractedParameters to dictionary for serialization"""
        return {
            "oxygen_conditions": params.oxygen_conditions,
            "chlorophyll_conditions": params.chlorophyll_conditions,
            "ph_conditions": params.ph_conditions,
            "nitrate_conditions": params.nitrate_conditions,
            "latitude_range": params.latitude_range,
            "longitude_range": params.longitude_range,
            "depth_range": params.depth_range,
            "platform_types": params.platform_types,
            "projects": params.projects,
            "regions": params.regions,
            "profile_count": params.profile_count,
            "mobility_threshold": params.mobility_threshold
        }