"""
Supabase database client for FloatChat application.
Handles all database operations including table sampling and filtering.
"""

from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from ..config.settings import config


class SupabaseClient:
    """Client for interacting with Supabase database."""

    def __init__(self):
        """Initialize Supabase client."""
        config.validate()
        self.client: Client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

    def sample_table_rows(self, table: str, limit: int = None) -> List[Dict[str, Any]]:
        """
        Sample rows from a table.

        Args:
            table: Table name to sample from
            limit: Maximum number of rows to return (default from config)

        Returns:
            List of sampled rows
        """
        if limit is None:
            limit = config.SAMPLE_PER_TABLE

        try:
            result = self.client.table(table).select("*").limit(limit).execute()

            # Handle different response formats
            if isinstance(result, dict):
                return result.get("data", [])
            return getattr(result, "data", []) or []

        except Exception as e:
            print(f"Error sampling table {table}: {e}")
            return []

    def apply_filters_to_table(
        self,
        table: str,
        filters: List[Dict[str, Any]],
        limit: int = 200
    ) -> List[Dict[str, Any]]:
        """
        Apply filters to a table and return results.

        Args:
            table: Table name to query
            filters: List of filter dictionaries with column, op, value keys
            limit: Maximum number of rows to return

        Returns:
            List of filtered rows
        """
        try:
            query = self.client.table(table).select("*")

            # Apply each filter
            for filter_dict in filters:
                column = filter_dict.get("column")
                operation = filter_dict.get("op")
                value = filter_dict.get("value")

                if not column or not operation or value is None:
                    continue

                # Apply different filter operations
                if operation == "between" and isinstance(value, list) and len(value) == 2:
                    query = query.gte(column, value[0]).lte(column, value[1])
                elif operation == "eq":
                    query = query.eq(column, value)
                elif operation == "in" and isinstance(value, list):
                    query = query.in_(column, value)
                elif operation == "gte":
                    query = query.gte(column, value)
                elif operation == "lte":
                    query = query.lte(column, value)
                elif operation == "gt":
                    query = query.gt(column, value)
                elif operation == "lt":
                    query = query.lt(column, value)
                elif operation == "neq":
                    query = query.neq(column, value)
                elif operation == "like":
                    query = query.like(column, value)
                elif operation == "ilike":
                    query = query.ilike(column, value)

            # Apply limit and execute
            query = query.limit(limit)
            result = query.execute()

            # Handle different response formats
            if isinstance(result, dict):
                return result.get("data", [])
            return getattr(result, "data", []) or []

        except Exception as e:
            print(f"Error filtering table {table}: {e}")
            return []

    def get_table_schema(self, table: str) -> Dict[str, Any]:
        """
        Get schema information for a table.

        Args:
            table: Table name

        Returns:
            Dictionary with schema information
        """
        try:
            # Get a single row to infer schema
            result = self.client.table(table).select("*").limit(1).execute()

            if isinstance(result, dict):
                data = result.get("data", [])
            else:
                data = getattr(result, "data", []) or []

            if data:
                return {
                    "columns": list(data[0].keys()),
                    "sample_row": data[0]
                }
            else:
                return {"columns": [], "sample_row": {}}

        except Exception as e:
            print(f"Error getting schema for table {table}: {e}")
            return {"columns": [], "sample_row": {}}

    def list_tables(self) -> List[str]:
        """
        Get list of available tables from configuration.

        Returns:
            List of table names
        """
        return config.get_table_list()

    def test_connection(self) -> bool:
        """
        Test the database connection.

        Returns:
            True if connection is successful
        """
        try:
            # Try to get tables from config and test one
            tables = self.list_tables()
            if tables:
                self.sample_table_rows(tables[0], limit=1)
            return True
        except Exception as e:
            print(f"Database connection test failed: {e}")
            return False


# Global database client instance
db_client = SupabaseClient()