"""
OpenRouter client for FloatChat application.
Handles LLM interactions with GPT-3.5 Turbo via OpenRouter API.
"""

import time
import json
from typing import Dict, List, Any, Optional
import requests

from ..config.settings import config


class OpenRouterClient:
    """Client for interacting with OpenRouter API."""

    def __init__(self):
        """Initialize OpenRouter client."""
        if not config.OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY is required")

        self.api_key = config.OPENROUTER_API_KEY
        self.model = config.OPENROUTER_MODEL
        self.base_url = config.OPENROUTER_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://floatchat.com",  # Optional: your site URL
            "X-Title": "FloatChat RAG System"  # Optional: your app name
        }

    def create_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.0,
        max_tokens: Optional[int] = None,
        retries: int = 3
    ) -> str:
        """
        Create a completion using OpenRouter API.

        Args:
            messages: List of message dictionaries with 'role' and 'content'
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens in response
            retries: Number of retry attempts for rate limiting

        Returns:
            Generated text response

        Raises:
            RuntimeError: If API call fails after retries
        """
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature
        }

        if max_tokens:
            payload["max_tokens"] = max_tokens

        for attempt in range(retries):
            try:
                response = requests.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload,
                    timeout=30
                )

                # Handle rate limiting
                if response.status_code == 429:
                    wait_time = 2 ** attempt
                    print(f"Rate limited. Waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue

                # Handle other errors
                if response.status_code >= 400:
                    error_msg = f"OpenRouter API error {response.status_code}: {response.text}"
                    if attempt == retries - 1:  # Last attempt
                        raise RuntimeError(error_msg)
                    print(f"Error (attempt {attempt + 1}): {error_msg}")
                    time.sleep(1)
                    continue

                # Parse successful response
                result = response.json()
                return result["choices"][0]["message"]["content"]

            except requests.exceptions.Timeout:
                if attempt == retries - 1:
                    raise RuntimeError("Request timeout after retries")
                print(f"Timeout (attempt {attempt + 1})")
                time.sleep(1)
                continue

            except requests.exceptions.RequestException as e:
                if attempt == retries - 1:
                    raise RuntimeError(f"Request failed: {str(e)}")
                print(f"Request error (attempt {attempt + 1}): {str(e)}")
                time.sleep(1)
                continue

        raise RuntimeError("Failed to complete request after retries")

    def generate_filters(self, user_query: str, table_candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate database filters based on user query and table candidates.

        Args:
            user_query: User's query
            table_candidates: List of candidate table metadata

        Returns:
            Dictionary with table candidates and filters
        """
        candidate_summaries = [c["summary"] for c in table_candidates]

        system_message = {
            "role": "system",
            "content": "You are an expert in Argo oceanographic float data analysis. Generate precise database filters based on user queries."
        }

        user_message = {
            "role": "user",
            "content": f"""
User query: {user_query}
Available table candidates: {candidate_summaries}

Generate a JSON response with database filters for the most relevant tables. Consider these guidelines:
- For temperature queries, use temperature_c column with appropriate ranges
- For salinity queries, use salinity_psu column
- For depth queries, use pressure_dbar column (1 dbar ≈ 1 meter depth)
- For geographic queries, use latitude/longitude columns
- For time queries, use date/time columns if available
- Use realistic oceanographic value ranges

Return ONLY valid JSON with this exact structure:
{{
    "table_candidates": [
        {{
            "table": "<table_name>",
            "filters": [
                {{
                    "column": "<column_name>",
                    "op": "<operation>",
                    "value": <value_or_range>
                }}
            ],
            "visualizations": ["salinity_profile", "temperature_profile"],
            "explanation": "Brief explanation of why this table and these filters are relevant"
        }}
    ],
    "global_visualizations": []
}}

Available filter operations: eq, in, gte, lte, gt, lt, between, like, ilike
"""
        }

        messages = [system_message, user_message]
        response_text = self.create_completion(messages, temperature=0.0)

        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            json_text = self._extract_json_from_text(response_text)
            if json_text:
                return json.loads(json_text)
            else:
                # Fallback: create basic structure
                return {
                    "table_candidates": [
                        {
                            "table": table_candidates[0]["table"] if table_candidates else "",
                            "filters": [],
                            "visualizations": ["salinity_profile", "temperature_profile"],
                            "explanation": "Basic query processing"
                        }
                    ],
                    "global_visualizations": []
                }

    def generate_final_answer(
        self,
        user_query: str,
        evidence_data: Dict[str, List[Dict[str, Any]]],
        table_candidates: List[Dict[str, Any]]
    ) -> str:
        """
        Generate final answer based on query results.

        Args:
            user_query: Original user query
            evidence_data: Dictionary mapping table names to query results
            table_candidates: List of table candidate metadata

        Returns:
            Generated answer text
        """
        # Prepare evidence summary
        evidence_texts = []
        for table_name, rows in evidence_data.items():
            if rows:
                columns = list(rows[0].keys())
                evidence_texts.append(
                    f"Table {table_name}: {len(rows)} rows retrieved. "
                    f"Columns: {columns}. "
                    f"Sample data available for analysis."
                )
            else:
                evidence_texts.append(f"Table {table_name}: No matching data found.")

        system_message = {
            "role": "system",
            "content": (
                "You are an expert oceanographer analyzing Argo float data. "
                "Provide accurate, informative responses based on the available data. "
                "Include specific numerical values when possible. "
                "If data is limited, provide scientifically reasonable estimates based on oceanographic knowledge."
            )
        }

        user_message = {
            "role": "user",
            "content": f"""
User query: {user_query}

Evidence from database:
{' | '.join(evidence_texts)}

Based on this evidence, provide a comprehensive answer to the user's query. Include:
1. Direct answer to the question
2. Relevant numerical data or ranges when available
3. Scientific context or explanation
4. Any limitations or assumptions in the data

Keep the response informative but concise (3-6 sentences).
"""
        }

        messages = [system_message, user_message]
        return self.create_completion(messages, temperature=0.1)

    def _extract_json_from_text(self, text: str) -> str:
        """
        Extract JSON from text response.

        Args:
            text: Text potentially containing JSON

        Returns:
            Extracted JSON string or empty string
        """
        start = text.find("{")
        if start == -1:
            return ""

        bracket_count = 0
        for i in range(start, len(text)):
            if text[i] == "{":
                bracket_count += 1
            elif text[i] == "}":
                bracket_count -= 1
                if bracket_count == 0:
                    return text[start:i + 1]

        return ""

    def test_connection(self) -> bool:
        """
        Test the OpenRouter API connection.

        Returns:
            True if connection successful
        """
        try:
            test_messages = [
                {"role": "user", "content": "Hello, this is a connection test. Please respond with 'OK'."}
            ]
            response = self.create_completion(test_messages, temperature=0.0)
            return "ok" in response.lower()
        except Exception as e:
            print(f"OpenRouter connection test failed: {e}")
            return False


# Global OpenRouter client instance
llm_client = OpenRouterClient()