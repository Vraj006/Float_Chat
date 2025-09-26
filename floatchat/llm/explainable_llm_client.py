"""
Explainable LLM Client with Reasoning Transparency
Provides step-by-step reasoning for how the LLM reaches its answers
"""

import time
import json
from typing import Dict, List, Any, Optional
import requests

from ..config.settings import config
from .openrouter_client import OpenRouterClient

class ExplainableLLMClient(OpenRouterClient):
    """LLM client with explainable AI capabilities for transparent reasoning"""

    def __init__(self):
        """Initialize explainable LLM client"""
        super().__init__()

    def generate_filters_with_reasoning(
        self,
        user_query: str,
        expanded_query: str,
        table_candidates: List[Dict[str, Any]],
        query_expansion_reasoning: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate database filters with step-by-step reasoning

        Args:
            user_query: Original user query
            expanded_query: Semantically expanded query
            table_candidates: List of candidate table metadata
            query_expansion_reasoning: Reasoning from query expansion

        Returns:
            Dictionary with filters and detailed reasoning
        """
        candidate_summaries = [c["summary"] for c in table_candidates]

        system_message = {
            "role": "system",
            "content": """You are an expert oceanographer who analyzes BGC Argo float data. You must provide transparent, step-by-step reasoning for your analysis.

Your response must be in the following JSON format:
{
    "reasoning_steps": [
        {
            "step": "Query Understanding",
            "thought": "What I understand from the user's question",
            "key_elements": ["list", "of", "key", "elements"]
        },
        {
            "step": "Table Selection",
            "thought": "Why I chose these specific tables",
            "selected_tables": ["table1", "table2"],
            "rejection_reasoning": "Why I rejected other tables"
        },
        {
            "step": "Filter Design",
            "thought": "How I designed the database filters",
            "filter_logic": "Explanation of filter logic"
        },
        {
            "step": "Visualization Selection",
            "thought": "Why I chose these visualizations",
            "selected_plots": ["plot1", "plot2"]
        }
    ],
    "confidence_assessment": {
        "overall_confidence": 0.8,
        "uncertainty_factors": ["list", "of", "uncertainties"],
        "data_quality_expectations": "Expected quality of results"
    },
    "table_candidates": [
        {
            "table": "<table_name>",
            "selection_reasoning": "Specific reason for selecting this table",
            "relevance_score": 0.9,
            "filters": [
                {
                    "column": "<column_name>",
                    "op": "<operation>",
                    "value": <value_or_range>,
                    "reasoning": "Why this specific filter is needed"
                }
            ],
            "visualizations": ["plot_type1", "plot_type2"],
            "explanation": "How this table contributes to answering the query"
        }
    ],
    "expected_findings": "What patterns or results I expect to find",
    "alternative_approaches": "Other ways this query could be analyzed"
}"""
        }

        user_message = {
            "role": "user",
            "content": f"""
Original user query: "{user_query}"
Expanded semantic query: "{expanded_query}"

Available table candidates with their descriptions:
{json.dumps(candidate_summaries, indent=2)}

Please analyze this oceanographic query with complete transparency:

1. REASONING STEPS: Walk through your thought process step-by-step
2. TABLE SELECTION: Explain why you chose specific tables and rejected others
3. FILTER DESIGN: Justify each database filter with oceanographic reasoning
4. CONFIDENCE ASSESSMENT: Rate your confidence and identify uncertainties
5. EXPECTED FINDINGS: Predict what the data analysis will reveal

Provide filters for the most relevant tables using realistic oceanographic value ranges:
- Temperature: typically -2°C to 30°C
- Salinity: typically 32-37 PSU
- Pressure/depth: 1 dbar ≈ 1 meter depth
- Oxygen: 0-400 μmol/kg (hypoxic <50, saturated >300)
- Chlorophyll: 0.01-10 mg/m³ (oligotrophic <0.3, bloom >2.0)
- pH: 7.5-8.3 (acidified <7.9)
- Nitrate: 0-50 μmol/kg

Remember: Your reasoning will be shown to users, so be clear and educational.
"""
        }

        messages = [system_message, user_message]

        try:
            response_text = self.create_completion(messages, temperature=0.1)

            # Try to extract JSON from response
            response_data = self._extract_and_parse_json(response_text)

            # Add metadata about the reasoning process
            response_data["reasoning_metadata"] = {
                "query_expansion_used": bool(query_expansion_reasoning),
                "expansion_reasoning": query_expansion_reasoning or [],
                "total_candidates_considered": len(table_candidates),
                "reasoning_timestamp": time.time()
            }

            return response_data

        except Exception as e:
            # Fallback to original method with basic reasoning
            return self._fallback_reasoning(user_query, table_candidates, str(e))

    def generate_final_answer_with_reasoning(
        self,
        user_query: str,
        evidence_data: Dict[str, List[Dict[str, Any]]],
        table_candidates: List[Dict[str, Any]],
        processing_reasoning: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Generate final answer with detailed reasoning about the analysis

        Args:
            user_query: Original user query
            evidence_data: Retrieved data from database
            table_candidates: Table metadata
            processing_reasoning: Previous reasoning steps

        Returns:
            Dictionary with answer and reasoning
        """
        # Prepare evidence summary with statistics
        evidence_summary = self._create_evidence_summary(evidence_data)

        system_message = {
            "role": "system",
            "content": """You are an expert oceanographer providing transparent analysis of BGC Argo float data.

Provide your response in this JSON format:
{
    "reasoning_steps": [
        {
            "step": "Data Assessment",
            "thought": "What data I found and its quality",
            "data_statistics": "Key statistics from the data"
        },
        {
            "step": "Pattern Analysis",
            "thought": "What patterns I identified in the data",
            "key_findings": ["finding1", "finding2"]
        },
        {
            "step": "Scientific Interpretation",
            "thought": "How I interpret these findings oceanographically",
            "oceanographic_context": "Broader scientific context"
        },
        {
            "step": "Answer Formulation",
            "thought": "How I constructed my final answer",
            "confidence_level": "high/medium/low"
        }
    ],
    "data_analysis": {
        "tables_analyzed": ["table1", "table2"],
        "total_profiles": 150,
        "data_quality_assessment": "Assessment of data quality",
        "statistical_summary": {
            "parameter_ranges": "Key parameter ranges found",
            "spatial_coverage": "Geographic coverage",
            "temporal_coverage": "Time period covered"
        }
    },
    "scientific_insights": {
        "primary_findings": ["insight1", "insight2"],
        "oceanographic_processes": ["process1", "process2"],
        "environmental_implications": "What these findings mean"
    },
    "answer": "Complete answer to the user's question",
    "confidence_assessment": {
        "answer_confidence": 0.8,
        "data_limitations": ["limitation1", "limitation2"],
        "uncertainty_sources": ["uncertainty1", "uncertainty2"]
    },
    "further_analysis_suggestions": "Suggestions for deeper analysis"
}"""
        }

        user_message = {
            "role": "user",
            "content": f"""
User query: "{user_query}"

Data retrieved from analysis:
{evidence_summary}

Previous reasoning (if any):
{json.dumps(processing_reasoning.get('reasoning_steps', []), indent=2) if processing_reasoning else 'None'}

Please provide a comprehensive analysis with complete transparency:

1. DATA ASSESSMENT: Evaluate the quality and completeness of retrieved data
2. PATTERN ANALYSIS: Identify key patterns and trends in the data
3. SCIENTIFIC INTERPRETATION: Explain findings in oceanographic context
4. ANSWER FORMULATION: Construct clear, accurate response
5. CONFIDENCE ASSESSMENT: Rate confidence and identify limitations

Be educational and explain the oceanographic significance of your findings.
Include specific numerical values when available.
"""
        }

        try:
            messages = [system_message, user_message]
            response_text = self.create_completion(messages, temperature=0.2)
            response_data = self._extract_and_parse_json(response_text)

            # Add processing metadata
            response_data["processing_metadata"] = {
                "analysis_timestamp": time.time(),
                "data_sources": len(evidence_data),
                "total_data_points": sum(len(rows) for rows in evidence_data.values()),
                "reasoning_chain_length": len(response_data.get("reasoning_steps", []))
            }

            return response_data

        except Exception as e:
            # Fallback answer with basic reasoning
            return self._fallback_answer_reasoning(user_query, evidence_data, str(e))

    def _create_evidence_summary(self, evidence_data: Dict[str, List[Dict[str, Any]]]) -> str:
        """Create structured summary of evidence data"""
        if not evidence_data:
            return "No data retrieved from database query."

        summary_parts = []

        for table_name, rows in evidence_data.items():
            if not rows:
                continue

            columns = list(rows[0].keys()) if rows else []
            summary_parts.append(f"Table {table_name}: {len(rows)} profiles")
            summary_parts.append(f"  Columns: {columns}")

            # Add sample statistics if numeric columns present
            numeric_cols = ["doxy", "chla", "ph_in_situ_total", "nitrate", "latitude", "longitude"]
            for col in numeric_cols:
                if col in columns:
                    values = [r.get(col) for r in rows if r.get(col) is not None]
                    if values:
                        # Handle both single values and lists
                        flat_values = []
                        for val in values:
                            if isinstance(val, list):
                                flat_values.extend([v for v in val if v is not None])
                            elif val is not None:
                                flat_values.append(val)

                        if flat_values and len(flat_values) > 0:
                            summary_parts.append(f"  {col}: {min(flat_values):.2f} to {max(flat_values):.2f}")

        return "\n".join(summary_parts)

    def _extract_and_parse_json(self, response_text: str) -> Dict[str, Any]:
        """Extract and parse JSON from LLM response"""
        # Try to find JSON in response
        json_start = response_text.find("{")
        json_end = response_text.rfind("}") + 1

        if json_start != -1 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass

        # If JSON parsing fails, create structured response from text
        return {
            "reasoning_steps": [
                {
                    "step": "Response Processing",
                    "thought": "LLM provided text response instead of structured JSON",
                    "raw_response": response_text[:500]
                }
            ],
            "answer": response_text,
            "confidence_assessment": {
                "answer_confidence": 0.5,
                "data_limitations": ["Response format parsing issue"],
                "uncertainty_sources": ["JSON extraction failed"]
            }
        }

    def _fallback_reasoning(
        self,
        user_query: str,
        table_candidates: List[Dict[str, Any]],
        error: str
    ) -> Dict[str, Any]:
        """Fallback reasoning when main method fails"""
        return {
            "reasoning_steps": [
                {
                    "step": "Fallback Analysis",
                    "thought": f"Primary reasoning failed due to: {error}",
                    "fallback_action": "Using basic table selection"
                }
            ],
            "table_candidates": [
                {
                    "table": table_candidates[0]["table"] if table_candidates else "",
                    "selection_reasoning": "Selected first available candidate due to processing error",
                    "relevance_score": 0.3,
                    "filters": [],
                    "visualizations": ["salinity_profile", "temperature_profile"],
                    "explanation": "Basic query processing with limited reasoning"
                }
            ] if table_candidates else [],
            "confidence_assessment": {
                "overall_confidence": 0.2,
                "uncertainty_factors": ["Processing error occurred"],
                "data_quality_expectations": "Limited due to fallback processing"
            }
        }

    def _fallback_answer_reasoning(
        self,
        user_query: str,
        evidence_data: Dict[str, List[Dict[str, Any]]],
        error: str
    ) -> Dict[str, Any]:
        """Fallback answer reasoning when main method fails"""
        tables_found = len(evidence_data)
        total_rows = sum(len(rows) for rows in evidence_data.values())

        basic_answer = f"Analysis of {tables_found} BGC float tables retrieved {total_rows} oceanographic profiles."
        if total_rows == 0:
            basic_answer = "No matching data was found for this specific query."

        return {
            "reasoning_steps": [
                {
                    "step": "Fallback Processing",
                    "thought": f"Advanced reasoning failed: {error}",
                    "basic_analysis": f"Found {total_rows} data points from {tables_found} tables"
                }
            ],
            "answer": basic_answer,
            "data_analysis": {
                "tables_analyzed": list(evidence_data.keys()),
                "total_profiles": total_rows,
                "data_quality_assessment": "Unable to assess due to processing error"
            },
            "confidence_assessment": {
                "answer_confidence": 0.3,
                "data_limitations": ["Processing error limited analysis depth"],
                "uncertainty_sources": ["Fallback reasoning used"]
            }
        }