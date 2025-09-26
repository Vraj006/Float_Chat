"""
Query Expander for Layer 1 Semantic Matching
Converts user queries into detailed, semantically rich queries that match table descriptions
"""

import re
from typing import Dict, List, Any, Optional
from ..llm.openrouter_client import llm_client

class SemanticQueryExpander:
    """Expands user queries to improve semantic matching with BGC Argo float table descriptions"""

    def __init__(self):
        """Initialize query expander with oceanographic knowledge"""

        # Geographic expansion mappings
        self.geographic_expansions = {
            "bay of bengal": ["northern Indian Ocean", "monsoon region", "river discharge influenced", "seasonal hypoxia", "upwelling zones"],
            "arabian sea": ["northwestern Indian Ocean", "intense upwelling", "oxygen minimum zone", "high evaporation", "monsoon driven"],
            "equatorial indian ocean": ["tropical waters", "upwelling signatures", "equatorial divergence", "thermocline dynamics", "ENSO influenced"],
            "southern ocean": ["circumpolar waters", "Antarctic proximity", "subpolar conditions", "carbon sink", "acidification zones"],
            "subtropical": ["gyre circulation", "oligotrophic conditions", "deep mixed layers", "nutrient limited"],
            "temperate": ["seasonal stratification", "moderate productivity", "storm mixing", "frontal systems"],
            "subpolar": ["high latitude", "deep convection", "nutrient rich", "seasonal ice", "strong winds"]
        }

        # Parameter expansion mappings
        self.parameter_expansions = {
            "oxygen": {
                "hypoxic": ["dissolved oxygen", "doxy", "oxygen minimum zone", "OMZ", "low oxygen", "hypoxia", "oxygen depletion"],
                "saturated": ["oxygen saturation", "well-ventilated", "oxygenated surface waters", "air-sea exchange"],
                "general": ["dissolved oxygen", "doxy", "oxygen levels", "oxygen concentrations", "ventilation"]
            },
            "chlorophyll": {
                "bloom": ["phytoplankton bloom", "high productivity", "eutrophic", "chlorophyll-a", "chla", "primary production"],
                "low": ["oligotrophic", "nutrient limited", "low productivity", "desert waters"],
                "general": ["chlorophyll-a", "chla", "productivity", "phytoplankton", "biological activity"]
            },
            "ph": {
                "acidification": ["ocean acidification", "pH decline", "carbonate chemistry", "CO2 uptake", "chemical changes"],
                "general": ["pH measurements", "acidity", "ocean chemistry", "carbonate system"]
            },
            "nitrate": {
                "rich": ["nutrient rich", "high nitrate", "upwelling zones", "deep water masses"],
                "limited": ["nutrient limited", "oligotrophic", "depleted nutrients"],
                "general": ["nitrate concentrations", "nutrients", "biogeochemical cycling"]
            }
        }

        # Platform and project context
        self.platform_context = {
            "APEX": "autonomous profiling float with high-precision sensors",
            "SOLO_BGC_MRV": "biogeochemical float with multiple sensor capabilities",
            "NAVIS_A": "next-generation profiling float with advanced telemetry"
        }

        self.project_context = {
            "GO-BGC": "Global Ocean Biogeochemistry project focusing on oxygen and carbon cycling",
            "SOCCOM": "Southern Ocean Carbon and Climate Observations project",
            "USARGOPROJECT": "US contribution to global Argo float network"
        }

    def expand_query_for_semantic_search(self, query: str, reasoning_mode: bool = True) -> Dict[str, Any]:
        """
        Expand user query into a semantically rich version for better FAISS matching

        Args:
            query: Original user query
            reasoning_mode: Whether to include step-by-step reasoning

        Returns:
            Dictionary with expanded query and reasoning steps
        """
        reasoning_steps = []

        # Step 1: Analyze the original query
        analysis = self._analyze_query_components(query)
        if reasoning_mode:
            reasoning_steps.append({
                "step": "Query Analysis",
                "action": "Identified key components in user query",
                "details": analysis
            })

        # Step 2: Generate expanded query using LLM
        expanded_query = self._generate_expanded_query_with_llm(query, analysis)
        if reasoning_mode:
            reasoning_steps.append({
                "step": "Query Expansion",
                "action": "Generated semantically rich version using oceanographic knowledge",
                "details": {"original": query[:100], "expanded": expanded_query[:200]}
            })

        # Step 3: Add contextual enrichments
        enriched_query = self._add_contextual_enrichments(expanded_query, analysis)
        if reasoning_mode:
            reasoning_steps.append({
                "step": "Contextual Enrichment",
                "action": "Added domain-specific terminology and geographic context",
                "details": {"enrichments_added": len(enriched_query) - len(expanded_query)}
            })

        return {
            "original_query": query,
            "expanded_query": enriched_query,
            "reasoning_steps": reasoning_steps if reasoning_mode else [],
            "query_components": analysis,
            "expansion_confidence": self._calculate_expansion_confidence(analysis)
        }

    def _analyze_query_components(self, query: str) -> Dict[str, Any]:
        """Analyze query to identify key components for expansion"""
        query_lower = query.lower()
        components = {
            "parameters": [],
            "regions": [],
            "conditions": [],
            "platforms": [],
            "projects": [],
            "specific_values": []
        }

        # Identify parameters
        if any(term in query_lower for term in ["oxygen", "doxy", "hypoxic", "hypoxia", "omz"]):
            components["parameters"].append("oxygen")
            if any(term in query_lower for term in ["hypoxic", "hypoxia", "below", "low"]):
                components["conditions"].append("hypoxic")
            elif any(term in query_lower for term in ["saturated", "high", "above"]):
                components["conditions"].append("saturated")

        if any(term in query_lower for term in ["chlorophyll", "chla", "productivity", "bloom"]):
            components["parameters"].append("chlorophyll")
            if any(term in query_lower for term in ["bloom", "high", "peak"]):
                components["conditions"].append("bloom")
            elif any(term in query_lower for term in ["low", "oligotrophic"]):
                components["conditions"].append("low")

        if any(term in query_lower for term in ["ph", "acidification", "acidified"]):
            components["parameters"].append("ph")
            if "acidification" in query_lower or "acidified" in query_lower:
                components["conditions"].append("acidification")

        if any(term in query_lower for term in ["nitrate", "nutrient", "nitrogen"]):
            components["parameters"].append("nitrate")

        # Identify regions
        for region, expansions in self.geographic_expansions.items():
            if region in query_lower:
                components["regions"].append(region)

        # Identify platforms and projects
        for platform in self.platform_context.keys():
            if platform.lower() in query_lower:
                components["platforms"].append(platform)

        for project in self.project_context.keys():
            if project.lower() in query_lower:
                components["projects"].append(project)

        # Extract numerical values
        numbers = re.findall(r'\d+(?:\.\d+)?', query)
        components["specific_values"] = [float(n) for n in numbers]

        return components

    def _generate_expanded_query_with_llm(self, query: str, analysis: Dict[str, Any]) -> str:
        """Use LLM to generate semantically rich expanded query"""

        system_message = {
            "role": "system",
            "content": """You are an expert oceanographer specializing in BGC Argo float data analysis. Your task is to expand user queries into detailed, semantically rich descriptions that will match BGC float table summaries.

BGC float table summaries typically contain:
- Float ID and deployment region details
- Geographic coordinates and ocean region names
- Temporal coverage information
- Biogeochemical parameter measurements (oxygen, chlorophyll, pH, nitrate)
- Platform types (APEX, SOLO_BGC_MRV, NAVIS_A)
- Project affiliations (GO-BGC, SOCCOM, USARGOPROJECT)
- Environmental conditions (hypoxic zones, productivity levels, acidification)
- Oceanographic context (upwelling, gyres, fronts, mixing)

Expand the query to include relevant synonyms, related concepts, and oceanographic terminology that would appear in float descriptions."""
        }

        user_message = {
            "role": "user",
            "content": f"""
Original query: "{query}"

Query components identified:
- Parameters: {analysis.get('parameters', [])}
- Regions: {analysis.get('regions', [])}
- Conditions: {analysis.get('conditions', [])}
- Platforms: {analysis.get('platforms', [])}
- Projects: {analysis.get('projects', [])}
- Values: {analysis.get('specific_values', [])}

Please expand this query into a detailed, semantically rich version (2-3 sentences) that would semantically match BGC Argo float table descriptions. Include:
1. Relevant oceanographic terminology
2. Geographic and environmental context
3. Related biogeochemical processes
4. Measurement context and instrumentation

Return ONLY the expanded query without explanations."""
        }

        try:
            expanded = llm_client.create_completion([system_message, user_message], temperature=0.3)
            return expanded.strip()
        except Exception as e:
            # Fallback to rule-based expansion
            return self._fallback_rule_based_expansion(query, analysis)

    def _fallback_rule_based_expansion(self, query: str, analysis: Dict[str, Any]) -> str:
        """Fallback rule-based expansion if LLM fails"""
        expansions = [query]

        # Add parameter expansions
        for param in analysis.get("parameters", []):
            if param in self.parameter_expansions:
                for condition in analysis.get("conditions", []):
                    if condition in self.parameter_expansions[param]:
                        expansions.extend(self.parameter_expansions[param][condition])
                expansions.extend(self.parameter_expansions[param].get("general", []))

        # Add geographic expansions
        for region in analysis.get("regions", []):
            if region in self.geographic_expansions:
                expansions.extend(self.geographic_expansions[region])

        # Add platform/project context
        for platform in analysis.get("platforms", []):
            if platform in self.platform_context:
                expansions.append(self.platform_context[platform])

        for project in analysis.get("projects", []):
            if project in self.project_context:
                expansions.append(self.project_context[project])

        return " ".join(set(expansions))

    def _add_contextual_enrichments(self, expanded_query: str, analysis: Dict[str, Any]) -> str:
        """Add additional contextual enrichments based on analysis"""
        enrichments = []

        # Add oceanographic process context
        if "oxygen" in analysis.get("parameters", []):
            enrichments.extend([
                "biogeochemical cycling", "marine oxygen minimum zones",
                "ventilation processes", "respiration and remineralization"
            ])

        if "chlorophyll" in analysis.get("parameters", []):
            enrichments.extend([
                "primary productivity", "phytoplankton dynamics",
                "seasonal bloom cycles", "nutrient availability"
            ])

        # Add measurement context
        if analysis.get("specific_values"):
            enrichments.extend([
                "quantitative measurements", "concentration thresholds",
                "environmental monitoring", "water mass characteristics"
            ])

        # Add temporal and spatial context
        enrichments.extend([
            "oceanographic profiles", "water column structure",
            "spatial and temporal variability", "autonomous float measurements"
        ])

        if enrichments:
            return f"{expanded_query} {' '.join(enrichments)}"

        return expanded_query

    def _calculate_expansion_confidence(self, analysis: Dict[str, Any]) -> float:
        """Calculate confidence score for the expansion quality"""
        confidence = 0.0

        # Base confidence from identified components
        if analysis.get("parameters"):
            confidence += 0.3
        if analysis.get("regions"):
            confidence += 0.2
        if analysis.get("conditions"):
            confidence += 0.2
        if analysis.get("specific_values"):
            confidence += 0.2
        if analysis.get("platforms") or analysis.get("projects"):
            confidence += 0.1

        return min(confidence, 1.0)