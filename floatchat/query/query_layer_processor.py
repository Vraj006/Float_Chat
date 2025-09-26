"""
Query Layer Processor - Orchestrates Three-Layer Query Architecture
Manages the flow through Layer 1 (Semantic), Layer 2 (SQL), and Layer 3 (Synthetic)
"""

import time
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from .parameter_extractor import QueryParameterExtractor, ExtractedParameters
from .sql_query_builder import AdvancedSQLQueryBuilder, SQLQueryResult
from .synthetic_response_generator import SyntheticResponseGenerator
from .query_expander import SemanticQueryExpander
from ..embeddings.faiss_index import faiss_manager
from ..llm.openrouter_client import llm_client
from ..llm.explainable_llm_client import ExplainableLLMClient
from ..visualization.plots import plotter
from ..database.supabase_client import db_client

# Set up logging
logger = logging.getLogger(__name__)

class QueryLayer(Enum):
    """Query processing layers"""
    SEMANTIC = 1      # FAISS similarity search
    DIRECT_SQL = 2    # Direct database parameter matching
    SYNTHETIC = 3     # Generate realistic responses

@dataclass
class LayerResult:
    """Result from a query layer"""
    layer: QueryLayer
    success: bool
    has_data: bool
    data: Dict[str, Any]
    execution_time: float
    details: Dict[str, Any]

@dataclass
class QueryProcessingResult:
    """Complete query processing result"""
    final_layer_used: QueryLayer
    layers_attempted: List[QueryLayer]
    total_execution_time: float
    response: Dict[str, Any]
    layer_results: List[LayerResult]

class ThreeLayerQueryProcessor:
    """Orchestrates query processing through three layers"""

    def __init__(self):
        """Initialize the three-layer processor"""
        self.parameter_extractor = QueryParameterExtractor()
        self.sql_builder = AdvancedSQLQueryBuilder()
        self.synthetic_generator = SyntheticResponseGenerator()
        self.query_expander = SemanticQueryExpander()
        self.explainable_llm = ExplainableLLMClient()

        # Enhanced configuration for better Layer 1 performance
        self.layer1_min_data_threshold = 1       # More lenient threshold for Layer 1
        self.layer1_min_relevance_score = 0.3    # Minimum relevance score for Layer 1
        self.layer2_min_data_threshold = 5       # Minimum rows for Layer 2
        self.enable_layer_progression = True     # Whether to progress through layers
        self.enable_query_expansion = True       # Whether to use query expansion
        self.enable_explainable_ai = True        # Whether to use explainable AI

    def process_query(
        self,
        query: str,
        k: int = 5,
        force_layer: Optional[int] = None
    ) -> QueryProcessingResult:
        """
        Process query through three layers

        Args:
            query: User's natural language query
            k: Number of candidate tables for Layer 1
            force_layer: Force specific layer (1, 2, or 3)

        Returns:
            Complete processing result
        """
        start_time = time.time()
        layer_results = []
        layers_attempted = []

        logger.info(f"Processing query: {query[:100]}...")

        # Extract parameters first (needed for all layers)
        params = self.parameter_extractor.extract_all_parameters(query)
        logger.info(f"Extracted parameters: {params.has_parameters()}")

        # Determine which layers to attempt
        if force_layer:
            layers_to_try = [QueryLayer(force_layer)]
        else:
            layers_to_try = [QueryLayer.SEMANTIC, QueryLayer.DIRECT_SQL, QueryLayer.SYNTHETIC]

        final_response = None
        final_layer = None

        # Process through layers
        for layer in layers_to_try:
            layers_attempted.append(layer)

            try:
                if layer == QueryLayer.SEMANTIC:
                    result = self._process_layer1_semantic(query, k)
                elif layer == QueryLayer.DIRECT_SQL:
                    result = self._process_layer2_sql(query, params)
                elif layer == QueryLayer.SYNTHETIC:
                    result = self._process_layer3_synthetic(query, params, layers_attempted)

                layer_results.append(result)

                # Check if this layer provided sufficient data
                if self._is_layer_result_sufficient(result, layer):
                    final_response = result.data
                    final_layer = layer
                    logger.info(f"Query satisfied by Layer {layer.value}")
                    break

            except Exception as e:
                logger.error(f"Layer {layer.value} failed: {e}")
                error_result = LayerResult(
                    layer=layer,
                    success=False,
                    has_data=False,
                    data={},
                    execution_time=0,
                    details={"error": str(e)}
                )
                layer_results.append(error_result)

        # If no layer succeeded, force Layer 3 as fallback
        if final_response is None:
            logger.warning("All layers failed, forcing Layer 3 synthetic response")
            try:
                result = self._process_layer3_synthetic(query, params, layers_attempted)
                layer_results.append(result)
                final_response = result.data
                final_layer = QueryLayer.SYNTHETIC
            except Exception as e:
                logger.error(f"Even Layer 3 failed: {e}")
                final_response = self._create_error_response(query, str(e))
                final_layer = None

        total_time = time.time() - start_time

        return QueryProcessingResult(
            final_layer_used=final_layer,
            layers_attempted=layers_attempted,
            total_execution_time=total_time,
            response=final_response,
            layer_results=layer_results
        )

    def _process_layer1_semantic(self, query: str, k: int) -> LayerResult:
        """Process query through Layer 1: Enhanced semantic FAISS search with query expansion"""
        start_time = time.time()

        try:
            # Step 1: Expand query for better semantic matching
            expansion_result = None
            search_query = query

            if self.enable_query_expansion:
                expansion_result = self.query_expander.expand_query_for_semantic_search(
                    query, reasoning_mode=self.enable_explainable_ai
                )
                search_query = expansion_result["expanded_query"]
                logger.info(f"Query expanded for semantic search (confidence: {expansion_result['expansion_confidence']:.2f})")

            # Step 2: Get candidate tables using enhanced FAISS search
            candidates = faiss_manager.retrieve_table_candidates(search_query, k=k*2)  # Get more candidates

            if not candidates:
                # Try with original query as fallback
                candidates = faiss_manager.retrieve_table_candidates(query, k=k)

            if not candidates:
                return LayerResult(
                    layer=QueryLayer.SEMANTIC,
                    success=False,
                    has_data=False,
                    data={},
                    execution_time=time.time() - start_time,
                    details={
                        "reason": "No candidate tables found even after query expansion",
                        "expansion_used": bool(expansion_result),
                        "original_query": query,
                        "expanded_query": search_query if expansion_result else None
                    }
                )

            # Step 3: Filter candidates by relevance score
            high_relevance_candidates = [
                c for c in candidates
                if c.get("relevance_score", 0) >= self.layer1_min_relevance_score
            ]

            if not high_relevance_candidates:
                # Use top candidates even if below threshold
                high_relevance_candidates = candidates[:k]

            logger.info(f"Found {len(high_relevance_candidates)} high-relevance candidates")

            # Step 4: Generate filters with enhanced reasoning
            if self.enable_explainable_ai:
                filter_response = self.explainable_llm.generate_filters_with_reasoning(
                    user_query=query,
                    expanded_query=search_query,
                    table_candidates=high_relevance_candidates,
                    query_expansion_reasoning=expansion_result.get("reasoning_steps") if expansion_result else None
                )
            else:
                filter_response = llm_client.generate_filters(query, high_relevance_candidates)

            table_candidates = filter_response.get("table_candidates", [])

            if not table_candidates:
                return LayerResult(
                    layer=QueryLayer.SEMANTIC,
                    success=False,
                    has_data=False,
                    data={},
                    execution_time=time.time() - start_time,
                    details={
                        "reason": "No table candidates generated from filters",
                        "candidates_found": len(candidates),
                        "high_relevance_candidates": len(high_relevance_candidates),
                        "expansion_used": bool(expansion_result)
                    }
                )

            # Query database and create response (similar to original simple endpoint)
            evidence_data = {}
            plots = []
            table_summaries = []

            for candidate in table_candidates:
                table_name = candidate.get("table")
                filters = candidate.get("filters", [])
                visualizations = candidate.get("visualizations", [])

                if not table_name:
                    continue

                # Query database
                rows = db_client.apply_filters_to_table(table_name, filters, limit=200)
                evidence_data[table_name] = rows[:30]  # Limit for response size

                # Create visualizations
                if rows and visualizations:
                    table_plots = plotter.create_multiple_plots(
                        rows=rows,
                        plot_types=visualizations,
                        table_name=table_name
                    )
                    plots.extend(table_plots)

                # Create summary
                table_summaries.append({
                    "table": table_name,
                    "row_count": len(rows),
                    "columns": list(rows[0].keys()) if rows else [],
                    "explanation": candidate.get("explanation", "")
                })

            # Step 5: Generate final answer with reasoning
            if self.enable_explainable_ai:
                answer_result = self.explainable_llm.generate_final_answer_with_reasoning(
                    user_query=query,
                    evidence_data=evidence_data,
                    table_candidates=table_summaries,
                    processing_reasoning=filter_response
                )
                final_answer = answer_result.get("answer", "Analysis completed")
                reasoning_info = answer_result
            else:
                final_answer = llm_client.generate_final_answer(
                    user_query=query,
                    evidence_data=evidence_data,
                    table_candidates=table_summaries
                )
                reasoning_info = None

            total_rows = sum(s.get("row_count", 0) for s in table_summaries)

            response_data = {
                "status": "completed",
                "answer": final_answer,
                "used_tables": [s["table"] for s in table_summaries if s.get("row_count", 0) > 0],
                "table_summaries": table_summaries,
                "plots": plots,
                "candidates": high_relevance_candidates,  # Use filtered candidates
                "raw_filter_response": filter_response,
                "layer_info": {
                    "layer_used": 1,
                    "method": "Enhanced semantic search with query expansion",
                    "query_expansion_used": bool(expansion_result),
                    "explainable_ai_used": self.enable_explainable_ai,
                    "expansion_confidence": expansion_result.get("expansion_confidence") if expansion_result else None
                }
            }

            # Add reasoning information if explainable AI is enabled
            if reasoning_info and self.enable_explainable_ai:
                response_data["reasoning"] = reasoning_info
                response_data["query_expansion"] = expansion_result

            return LayerResult(
                layer=QueryLayer.SEMANTIC,
                success=True,
                has_data=total_rows > 0,
                data=response_data,
                execution_time=time.time() - start_time,
                details={
                    "candidates_found": len(candidates),
                    "table_candidates": len(table_candidates),
                    "total_rows": total_rows
                }
            )

        except Exception as e:
            return LayerResult(
                layer=QueryLayer.SEMANTIC,
                success=False,
                has_data=False,
                data={},
                execution_time=time.time() - start_time,
                details={"error": str(e)}
            )

    def _process_layer2_sql(self, query: str, params: ExtractedParameters) -> LayerResult:
        """Process query through Layer 2: Direct SQL parameter matching"""
        start_time = time.time()

        try:
            # Execute SQL-based search
            sql_result = self.sql_builder.execute_layer2_search(params)

            if not sql_result.success:
                return LayerResult(
                    layer=QueryLayer.DIRECT_SQL,
                    success=False,
                    has_data=False,
                    data={},
                    execution_time=time.time() - start_time,
                    details={"reason": sql_result.error_message or "No matching data found"}
                )

            # Create visualizations for SQL results
            plots = []
            for table_name, rows in sql_result.data.items():
                if rows:
                    # Determine appropriate visualizations based on parameters
                    plot_types = self._determine_plot_types(params)
                    table_plots = plotter.create_multiple_plots(
                        rows=rows,
                        plot_types=plot_types,
                        table_name=table_name
                    )
                    plots.extend(table_plots)

            # Generate detailed LLM-based answer with reasoning
            if self.enable_explainable_ai:
                answer_result = self.explainable_llm.generate_final_answer_with_reasoning(
                    user_query=query,
                    evidence_data=sql_result.data,
                    table_candidates=[],  # Will be populated from sql_result
                    processing_reasoning={
                        "layer": "SQL Parameter Matching",
                        "method": "Direct database parameter extraction and querying",
                        "parameters_extracted": self._params_to_dict(params),
                        "sql_details": sql_result.query_details
                    }
                )
                answer = answer_result.get("answer", "Analysis completed")
                layer2_reasoning = answer_result
            else:
                answer = self._generate_enhanced_sql_answer(query, sql_result, params)
                layer2_reasoning = None

            # Create table summaries
            table_summaries = []
            for table_name, rows in sql_result.data.items():
                table_summaries.append({
                    "table": table_name,
                    "row_count": len(rows),
                    "columns": list(rows[0].keys()) if rows else [],
                    "explanation": f"Direct parameter match in {table_name}"
                })

            response_data = {
                "status": "completed",
                "answer": answer,
                "used_tables": list(sql_result.data.keys()),
                "table_summaries": table_summaries,
                "plots": plots,
                "sql_query_details": sql_result.query_details,
                "layer_info": {
                    "layer_used": 2,
                    "method": "Enhanced SQL parameter matching with LLM response generation",
                    "tables_queried": sql_result.tables_queried,
                    "total_rows_found": sql_result.total_rows,
                    "parameters_extracted": self._params_to_dict(params),
                    "explainable_ai_used": self.enable_explainable_ai
                }
            }

            # Add reasoning information if explainable AI is enabled
            if layer2_reasoning and self.enable_explainable_ai:
                response_data["reasoning"] = layer2_reasoning
                response_data["parameter_extraction_details"] = {
                    "extracted_parameters": self._params_to_dict(params),
                    "sql_filters_applied": sql_result.query_details.get("filters_applied", []),
                    "aggregates_computed": sql_result.query_details.get("aggregates", {})
                }

            return LayerResult(
                layer=QueryLayer.DIRECT_SQL,
                success=True,
                has_data=sql_result.total_rows > 0,
                data=response_data,
                execution_time=time.time() - start_time,
                details={
                    "tables_queried": len(sql_result.tables_queried),
                    "total_rows": sql_result.total_rows,
                    "aggregates": sql_result.query_details.get("aggregates", {})
                }
            )

        except Exception as e:
            return LayerResult(
                layer=QueryLayer.DIRECT_SQL,
                success=False,
                has_data=False,
                data={},
                execution_time=time.time() - start_time,
                details={"error": str(e)}
            )

    def _process_layer3_synthetic(
        self,
        query: str,
        params: ExtractedParameters,
        layers_attempted: List[QueryLayer]
    ) -> LayerResult:
        """Process query through Layer 3: Synthetic response generation"""
        start_time = time.time()

        try:
            # Generate synthetic response with reasoning
            response_data = self.synthetic_generator.generate_synthetic_response(
                query=query,
                params=params,
                layer1_attempted=QueryLayer.SEMANTIC in layers_attempted,
                layer2_attempted=QueryLayer.DIRECT_SQL in layers_attempted
            )

            # Add explainable AI reasoning for synthetic responses if enabled
            if self.enable_explainable_ai:
                synthetic_reasoning = {
                    "reasoning_steps": [
                        {
                            "step": "Fallback Analysis",
                            "thought": f"Previous layers could not find sufficient real data. Layer 1 attempted: {QueryLayer.SEMANTIC in layers_attempted}, Layer 2 attempted: {QueryLayer.DIRECT_SQL in layers_attempted}",
                            "decision": "Generating scientifically accurate synthetic response based on oceanographic knowledge"
                        },
                        {
                            "step": "Knowledge Base Application",
                            "thought": "Using established oceanographic parameters and regional characteristics to create realistic data",
                            "knowledge_sources": ["Regional ocean characteristics", "BGC parameter ranges", "Platform specifications"]
                        },
                        {
                            "step": "Response Synthesis",
                            "thought": "Combining extracted query parameters with oceanographic knowledge to generate coherent analysis",
                            "confidence_level": "medium (synthetic data with realistic ranges)"
                        }
                    ],
                    "synthetic_data_notice": "This response uses synthetic data generated from oceanographic knowledge base",
                    "confidence_assessment": {
                        "overall_confidence": 0.6,
                        "uncertainty_factors": ["Synthetic data used", "No real measurements available"],
                        "reliability_note": "Values are oceanographically realistic but not from actual measurements"
                    }
                }
                response_data["reasoning"] = synthetic_reasoning

            return LayerResult(
                layer=QueryLayer.SYNTHETIC,
                success=True,
                has_data=True,  # Synthetic always has data
                data=response_data,
                execution_time=time.time() - start_time,
                details={
                    "synthetic_floats": len(response_data.get("table_summaries", [])),
                    "parameters_addressed": len([k for k in response_data.get("synthetic_data", {}) if k != "data_generated"])
                }
            )

        except Exception as e:
            return LayerResult(
                layer=QueryLayer.SYNTHETIC,
                success=False,
                has_data=False,
                data={},
                execution_time=time.time() - start_time,
                details={"error": str(e)}
            )

    def _is_layer_result_sufficient(self, result: LayerResult, layer: QueryLayer) -> bool:
        """
        Enhanced layer sufficiency check with strict stopping logic

        Key principle: If a layer finds ANY valid data, it should be sufficient
        to prevent unnecessary progression to fallback layers.
        """
        if not result.success:
            return False

        if layer == QueryLayer.SEMANTIC:
            # Layer 1 is sufficient if it found ANY relevant data
            total_rows = result.details.get("total_rows", 0)
            has_answer = bool(result.data.get("answer", "").strip())
            has_tables = len(result.data.get("used_tables", [])) > 0

            # More lenient criteria - if we have data OR a good answer, stop here
            is_sufficient = (
                total_rows >= self.layer1_min_data_threshold or  # Found enough data
                (has_answer and has_tables) or                   # Has answer with tables
                (total_rows > 0 and has_answer)                  # Any data with answer
            )

            if is_sufficient:
                logger.info(f"Layer 1 sufficient: {total_rows} rows, answer={has_answer}, tables={has_tables}")

            return is_sufficient

        elif layer == QueryLayer.DIRECT_SQL:
            # Layer 2 is sufficient if it found data through parameter matching
            total_rows = result.details.get("total_rows", 0)
            has_aggregates = bool(result.details.get("aggregates"))

            is_sufficient = (
                total_rows >= self.layer2_min_data_threshold or  # Found enough data
                (total_rows > 0 and has_aggregates)             # Some data with statistics
            )

            if is_sufficient:
                logger.info(f"Layer 2 sufficient: {total_rows} rows, aggregates={has_aggregates}")

            return is_sufficient

        elif layer == QueryLayer.SYNTHETIC:
            # Layer 3 always succeeds (it's the fallback)
            return True

        return False

    def _determine_plot_types(self, params: ExtractedParameters) -> List[str]:
        """Determine appropriate plot types based on extracted parameters"""
        plot_types = []

        if params.oxygen_conditions:
            plot_types.append("oxygen_profile")

        if params.chlorophyll_conditions:
            plot_types.append("chlorophyll_profile")

        if params.latitude_range or params.longitude_range:
            plot_types.append("geographic")

        # Default plots if none specified
        if not plot_types:
            plot_types = ["salinity_profile", "temperature_profile"]

        return plot_types

    def _generate_enhanced_sql_answer(
        self,
        query: str,
        sql_result: SQLQueryResult,
        params: ExtractedParameters
    ) -> str:
        """Generate enhanced answer using LLM for Layer 2 results"""

        # Prepare structured evidence for LLM
        evidence_summary = self._create_sql_evidence_summary(sql_result, params)

        system_message = {
            "role": "system",
            "content": """You are an expert oceanographer analyzing BGC Argo float data. You have just completed a direct parameter search that matched specific conditions in the database.

Your task is to provide a comprehensive, natural language response about the findings. Do not use templated phrases like "Direct parameter search identified..." Instead, write as if you are a scientist explaining results to a colleague.

Focus on:
1. What the data reveals about the oceanographic conditions
2. The scientific significance of the measurements
3. Geographic or temporal patterns if evident
4. Implications for marine ecosystem health
5. Quality and extent of the dataset

Be natural, informative, and scientifically accurate. Use specific numerical values when available."""
        }

        user_message = {
            "role": "user",
            "content": f"""
User query: "{query}"

Analysis results from direct parameter matching:
{evidence_summary}

Please provide a comprehensive oceanographic analysis of these results. Explain what these measurements tell us about the marine environment and their scientific significance. Write in a natural, informative style as if explaining to a fellow oceanographer."""
        }

        try:
            response = llm_client.create_completion([system_message, user_message], temperature=0.2)
            return response.strip()
        except Exception as e:
            # Fallback to basic summary
            return self._fallback_sql_answer(sql_result, params)

    def _create_sql_evidence_summary(self, sql_result: SQLQueryResult, params: ExtractedParameters) -> str:
        """Create structured evidence summary for SQL results"""
        summary_parts = []

        # Basic statistics
        tables_found = len(sql_result.tables_queried)
        total_rows = sql_result.total_rows
        summary_parts.append(f"Database search across {tables_found} BGC float tables yielded {total_rows} matching oceanographic profiles.")

        # Parameter-specific findings
        aggregates = sql_result.query_details.get("aggregates", {})

        if "oxygen" in aggregates:
            oxy = aggregates["oxygen"]
            summary_parts.append(f"Dissolved oxygen measurements: {oxy['min']:.1f} to {oxy['max']:.1f} μmol/kg (mean: {oxy['mean']:.1f}, n={oxy['count']})")

        if "chlorophyll" in aggregates:
            chl = aggregates["chlorophyll"]
            summary_parts.append(f"Chlorophyll-a concentrations: {chl['min']:.3f} to {chl['max']:.3f} mg/m³ (mean: {chl['mean']:.3f}, n={chl['count']})")

        if "pH" in aggregates:
            ph = aggregates["pH"]
            summary_parts.append(f"pH measurements: {ph['min']:.3f} to {ph['max']:.3f} (mean: {ph['mean']:.3f}, n={ph['count']})")

        if "nitrate" in aggregates:
            nit = aggregates["nitrate"]
            summary_parts.append(f"Nitrate concentrations: {nit['min']:.1f} to {nit['max']:.1f} μmol/kg (mean: {nit['mean']:.1f}, n={nit['count']})")

        # Add parameter extraction context
        extracted_params = []
        if params.oxygen_conditions:
            extracted_params.append(f"Oxygen conditions: {params.oxygen_conditions}")
        if params.chlorophyll_conditions:
            extracted_params.append(f"Chlorophyll conditions: {params.chlorophyll_conditions}")
        if params.ph_conditions:
            extracted_params.append(f"pH conditions: {params.ph_conditions}")
        if params.latitude_range or params.longitude_range:
            extracted_params.append(f"Geographic constraints applied")

        if extracted_params:
            summary_parts.append(f"Query parameters extracted: {'; '.join(extracted_params)}")

        # Table information
        if sql_result.tables_queried:
            summary_parts.append(f"Data sources: {', '.join(sql_result.tables_queried[:5])}")

        return "\n".join(summary_parts)

    def _fallback_sql_answer(self, sql_result: SQLQueryResult, params: ExtractedParameters) -> str:
        """Fallback answer when LLM generation fails"""
        tables_found = len(sql_result.tables_queried)
        total_rows = sql_result.total_rows

        basic_parts = []
        basic_parts.append(f"Analysis of {tables_found} BGC float tables found {total_rows} oceanographic profiles matching the specified criteria.")

        aggregates = sql_result.query_details.get("aggregates", {})
        if aggregates:
            basic_parts.append("Key measurements include:")
            for param, stats in aggregates.items():
                if param == "oxygen":
                    basic_parts.append(f"dissolved oxygen ranging from {stats['min']:.1f} to {stats['max']:.1f} μmol/kg")
                elif param == "chlorophyll":
                    basic_parts.append(f"chlorophyll-a levels from {stats['min']:.3f} to {stats['max']:.3f} mg/m³")

        basic_parts.append(f"These data represent valuable oceanographic measurements from autonomous BGC floats deployed in the study region.")

        return " ".join(basic_parts)

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

    def _create_error_response(self, query: str, error_msg: str) -> Dict[str, Any]:
        """Create error response when all layers fail"""
        return {
            "status": "error",
            "error": "All query processing layers failed",
            "details": error_msg,
            "query": query,
            "answer": "Unable to process query due to system errors. Please try again or rephrase your query.",
            "used_tables": [],
            "table_summaries": [],
            "plots": [],
            "reasoning": {
                "reasoning_steps": [
                    {
                        "step": "System Error",
                        "thought": f"All processing layers encountered errors: {error_msg}",
                        "recommendation": "Please try rephrasing your query or check system status"
                    }
                ]
            } if self.enable_explainable_ai else {}
        }