#!/usr/bin/env python3
"""
Simplified FloatChat System Tester
Shows only essential information: query, expanded query, layer used, and output
"""

import requests
import json
import time

# Configuration
API_BASE_URL = "http://localhost:5000"

# Test queries
TEST_QUERIES = [
    "severe hypoxic conditions with oxygen below 20 μmol/kg in Bay of Bengal",
    "chlorophyll levels above 2 mg/m³ indicating phytoplankton blooms",
    "pH measurements below 8.0 showing ocean acidification trends",
    "APEX platform measurements in subtropical Indian Ocean regions",
    "oxygen minimum zones with dissolved oxygen concentrations under 50 μmol/kg"
]

def test_single_query(query: str, query_num: int):
    """Test a single query with minimal output"""
    print(f"\n{'='*80}")
    print(f"Query #{query_num}: {query}")
    print(f"{'='*80}")

    try:
        start_time = time.time()
        response = requests.post(
            f"{API_BASE_URL}/chat_enhanced",
            json={"query": query, "k": 5},
            timeout=60
        )
        elapsed = time.time() - start_time

        if response.status_code == 200:
            result = response.json()

            # Extract key information
            processing_info = result.get("processing_info", {})
            final_layer = processing_info.get("final_layer_used", "unknown")
            answer = result.get("answer", "")

            # Show expanded query if available
            if "query_expansion" in result:
                expansion = result["query_expansion"]
                expanded = expansion.get("expanded_query", "")
                confidence = expansion.get("expansion_confidence", 0)
                print(f"Expanded Query: {expanded[:100]}...")
                print(f"Expansion Confidence: {confidence:.0%}")

            print(f"Layer Used: {final_layer}")
            print(f"Response Time: {elapsed:.1f}s")
            print(f"Answer:\n{answer}")

            return True

        else:
            print(f"❌ Error {response.status_code}: {response.text[:100]}")
            return False

    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def main():
    """Main test function"""
    print("FloatChat Simplified Tester")
    print("="*50)

    # Check server
    try:
        requests.get(f"{API_BASE_URL}/status", timeout=5)
    except:
        print("❌ Server not running. Start with: python app_enhanced.py")
        return

    successful = 0
    for i, query in enumerate(TEST_QUERIES, 1):
        if test_single_query(query, i):
            successful += 1
        time.sleep(1)

    print(f"\n{'='*80}")
    print(f"Summary: {successful}/{len(TEST_QUERIES)} queries successful")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()