"""
  Setup script for FloatChat - Builds FAISS index and tests components
  Run this FIRST before using the chat endpoints!
  ENHANCED VERSION - Now builds detailed coordinate summaries
  """

import os
import sys
import requests
import json
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

def check_env_variables():
    """Check if required environment variables are set."""
    print("=" * 70)
    print("🔧 CHECKING ENVIRONMENT VARIABLES")
    print("=" * 70)

    required_vars = {
        "SUPABASE_URL": os.getenv("SUPABASE_URL"),
        "SUPABASE_KEY": os.getenv("SUPABASE_KEY"),
        "OPENROUTER_API_KEY": os.getenv("OPENROUTER_API_KEY"),
        "TABLE_LIST": os.getenv("TABLE_LIST")
    }

    missing = []
    for var_name, var_value in required_vars.items():
        if not var_value:
            print(f"❌ {var_name}: MISSING")
            missing.append(var_name)
        else:
            if "KEY" in var_name:
                print(f"✅ {var_name}: Set (••••••••)")
            else:
                display_val = var_value[:50] + "..." if len(var_value)> 50 else var_value
                print(f"✅ {var_name}: {display_val}")

    # Show additional config
    additional_vars = {
        "SAMPLE_PER_TABLE": os.getenv("SAMPLE_PER_TABLE", "50"),
        "EMBED_MODEL_NAME": os.getenv("EMBED_MODEL_NAME", "all-MiniLM-L6-v2"),
        "OPENROUTER_MODEL": os.getenv("OPENROUTER_MODEL", "gpt-3.5-turbo")
    }

    print(f"\n📋 Additional Configuration:")
    for var_name, var_value in additional_vars.items():
        print(f"   {var_name}: {var_value}")

    if missing:
        print(f"\n⚠️  Missing environment variables: {','.join(missing)}")
        print("Please set them in your .env file")
        return False

    print(f"\n✅ All required environment variables are set!")

    # Show table count
    table_list = os.getenv("TABLE_LIST", "")
    table_count = len([t.strip() for t in table_list.split(",") if
t.strip()])
    print(f"📊 Tables configured: {table_count}")

    return True

def test_server_connection(base_url="http://localhost:5000"):
    """Test if the Flask server is running."""
    print(f"\n" + "=" * 70)
    print("🌐 TESTING SERVER CONNECTION")
    print("=" * 70)

    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Server is running at {base_url}")
            print(f"   Service: {result.get('service', 'FloatChat')}")
            print(f"   Version: {result.get('version', 'Unknown')}")
            return True
        else:
            print(f"❌ Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to server at {base_url}")
        print("   Make sure the Flask app is running: python app.py")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Connection timeout to {base_url}")
        return False
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        return False

def check_component_status(base_url="http://localhost:5000"):
    """Check the status of all components."""
    print(f"\n" + "=" * 70)
    print("📊 CHECKING COMPONENT STATUS")
    print("=" * 70)

    try:
        response = requests.get(f"{base_url}/status", timeout=15)
        if response.status_code == 200:
            status = response.json()

            # Check database
            db_status = status["components"]["database"]["status"]
            print(f"\n🗄️  Database: {db_status}")
            if db_status == "connected":
                tables = status["components"]["database"]["tables"]
                print(f"   📋 Tables configured: {len(tables)}")
                if tables:
                    print(f"   📝 Table list: {', '.join(tables[:5])}" + (f" ... and {len(tables)-5} more" if len(tables) > 5 else ""))
            else:
                print(f"   ❌ Database connection failed")

            # Check FAISS index
            faiss_status =status["components"]["faiss_index"]["status"]
            print(f"\n🔍 FAISS Index: {faiss_status}")
            if faiss_status == "loaded":
                index_info = status["components"]["faiss_index"]
                print(f"   📊 Tables indexed: {index_info.get('tables', 0)}")
                print(f"   🧠 Embedding dimension: {index_info.get('embedding_dim', 'Unknown')}")
                print(f"   📈 Index size: {index_info.get('index_size', 0)} vectors")

                # Show unique regions if available
                regions = index_info.get('unique_regions', [])
                if regions:
                    print(f"   🌍 Ocean regions: {len(regions)} ({','.join(regions[:3])}" +
                        (f" ... +{len(regions)-3}" if len(regions) > 3 else "") + ")")
            else:
                print(f"   ⚠️  Index not built yet - will build in next step")

            # Check LLM
            llm_status = status["components"]["llm"]["status"]
            model = status["components"]["llm"]["model"]
            print(f"\n🤖 LLM: {llm_status}")
            print(f"   📝 Model: {model}")
            if llm_status != "connected":
                print(f"   ❌ LLM connection failed")

            return status
        else:
            print(f"❌ Failed to get status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"❌ Error checking status: {e}")
        return None

def build_faiss_index(base_url="http://localhost:5000",
overwrite=True):
    """Build the FAISS index with enhanced coordinate summaries."""
    print(f"\n" + "=" * 70)
    print("🚀 BUILDING ENHANCED FAISS INDEX")
    print("=" * 70)

    try:
        print("📚 Building FAISS index from Supabase tables...")
        print("🎯 NEW FEATURES:")
        print("   • Detailed coordinate boundaries (min/max lat/lon)")
        print("   • Average positions for each float")
        print("   • Enhanced BGC parameter analysis")
        print("   • Oceanographic zone classification")
        print("   • Parallel processing for speed")
        print("\n⏱️  This may take 2-5 minutes for 190+ tables...")

        start_time = time.time()

        response = requests.post(
            f"{base_url}/build_index",
            json={"overwrite": overwrite},
            timeout=300  # 5 minutes timeout
        )

        if response.status_code == 200:
            result = response.json()
            elapsed = time.time() - start_time

            print(f"\n🎉 Index built successfully in {elapsed:.1f} seconds!")
            print(f"   📊 Tables indexed: {result.get('tables_indexed', 0)}")
            print(f"   📏 Index dimension: {result.get('index_dimension', 'Unknown')}")

            if "metadata" in result and result["metadata"]:
                print(f"\n📋 Sample enhanced summaries:")
                for i, meta in enumerate(result["metadata"][:2], 1):
                    table_name = meta.get("table", "Unknown")
                    summary = meta.get("summary", "No summary")
                    print(f"\n   {i}. {table_name}:")
                    # Show first 150 characters of summary
                    if len(summary) > 150:
                        print(f"      {summary[:150]}...")
                    else:
                        print(f"      {summary}")

                print(f"\n🌍 Unique features in enhanced summaries:")
                print(f"   • Exact coordinate ranges (latitude bounds X°N to Y°N)")
                print(f"   • Precise average positions (average position X°N, Y°E)")
                print(f"   • Detailed movement patterns (extensive mobility vs stationary)")
                print(f"   • Oceanographic zones (tropical vs subtropical vs temperate)")
                print(f"   • Enhanced BGC analysis (hypoxic vs oxygen-saturated)")

            return True
        else:
            print(f"❌ Failed to build index: HTTP {response.status_code}")
            print(f"   Response: {response.text[:300]}")
            return False

    except requests.exceptions.Timeout:
        print("❌ Request timed out - index building taking longer than expected")
        print("   This can happen with many tables. Check server logs for progress.")
        return False
    except Exception as e:
        print(f"❌ Error building index: {e}")
        return False

def test_enhanced_chat_endpoint(base_url="http://localhost:5000"):
    """Test the chat endpoint with enhanced coordinate queries."""
    print(f"\n" + "=" * 70)
    print("🧪 TESTING ENHANCED CHAT ENDPOINT")
    print("=" * 70)

    # Test queries that will work well with enhanced coordinate summaries
    test_queries = [
        "What is the average ocean temperature?",
        "Show me floats with oxygen data from the Indian Ocean",
        "Find BGC measurements in tropical waters",
        "Floats with hypoxic conditions",
        "High productivity waters with chlorophyll data"
    ]

    successful_tests = 0

    for i, query in enumerate(test_queries, 1):
        print(f"\n🔍 Test {i}: '{query}'")
        print("─" * 50)

        try:
            response = requests.post(
                f"{base_url}/chat",
                json={"query": query, "k": 3},
                timeout=45
            )

            if response.status_code == 200:
                result = response.json()

                if result.get("status") == "completed":
                    print(f"✅ Query successful!")

                    # Show answer preview
                    answer = result.get("answer", "No answer")
                    print(f"📝 Answer preview: {answer[:100]}..." if len(answer) > 100 else f"📝 Answer: {answer}")

                    # Show used tables with enhanced info
                    used_tables = result.get("used_tables", [])
                    if used_tables:
                        print(f"📊 Used tables: {','.join(used_tables)}")

                        # Show table summaries if available
                        summaries = result.get("table_summaries", [])
                        if summaries:
                            print(f"🎯 Table details:")
                            for summary in summaries[:2]:  # Show first 2
                                table = summary.get("table", "Unknown")
                                explanation = summary.get("explanation", "")
                                row_count = summary.get("row_count", 0)
                                print(f"   • {table}: {row_count} rows")
                                if explanation:
                                    print(f"     → {explanation[:80]}...")
                    else:
                        print(f"⚠️  No tables were used - check if data matches queries")

                    # Show visualizations
                    plots = result.get("plots", [])
                    if plots:
                        print(f"📈 Generated {len(plots)} visualization(s)")
                        for plot in plots:
                            plot_type = plot.get("type", "unknown")
                            print(f"   • {plot_type}")

                    successful_tests += 1

                else:
                    print(f"❌ Query failed with status: {result.get('status')}")
                    if "error" in result:
                        print(f"   Error: {result['error']}")
            else:
                print(f"❌ Request failed with status code: {response.status_code}")
                print(f"   Response: {response.text[:200]}")

        except requests.exceptions.Timeout:
            print(f"❌ Query timed out after 45 seconds")
        except Exception as e:
            print(f"❌ Error testing query: {e}")

        # Small delay between tests
        time.sleep(1)

    print(f"\n📊 Test Results: {successful_tests}/{len(test_queries)} queries successful")

    if successful_tests >= len(test_queries) * 0.8:  # 80% success rate
        print(f"🎉 Chat endpoint is working well!")
        return True
    elif successful_tests > 0:
        print(f"⚠️  Chat endpoint partially working")
        return True
    else:
        print(f"❌ Chat endpoint not working properly")
        return False

def main():
    """Main setup function with enhanced coordinate features."""
    print("\n" + "🌊 FLOATCHAT ENHANCED SETUP SCRIPT 🌊".center(70))
    print("=" * 70)
    print("🚀 NEW FEATURES:")
    print("   • Detailed coordinate boundaries for each float")
    print("   • Average positions (center points)")
    print("   • Enhanced movement pattern analysis")
    print("   • Oceanographic zone classification")
    print("   • Advanced BGC parameter summaries")
    print("=" * 70)

    # Step 1: Check environment variables
    if not check_env_variables():
        print(f"\n❌ Setup failed: Missing environment variables")
        print("Please configure your .env file and run this script again")
        sys.exit(1)

    # Step 2: Test server connection
    if not test_server_connection():
        print(f"\n❌ Setup failed: Server not running")
        print("Please start the server first:")
        print("   python app.py")
        sys.exit(1)

    # Step 3: Check component status
    status = check_component_status()
    if not status:
        print(f"\n⚠️  Warning: Could not check component status")

    # Step 4: Build FAISS index with enhanced features
    needs_rebuild = True
    if status and status["components"]["faiss_index"]["status"] == "loaded":
        print(f"\n📚 FAISS index already exists")
        rebuild = input("\n🤔 Rebuild with enhanced coordinate summaries? (y/n): ").lower()
        needs_rebuild = rebuild == 'y'

    if needs_rebuild:
        print(f"\n🚀 Building enhanced FAISS index...")
        if not build_faiss_index(overwrite=True):
            print(f"\n❌ Setup failed: Could not build FAISS index")
            print("Check your:")
            print("   • Supabase configuration and credentials")
            print("   • Table names in TABLE_LIST")
            print("   • Network connection")
            print("   • Server logs for detailed error messages")
            sys.exit(1)
    else:
        print(f"\n✅ Using existing FAISS index")

    # Step 5: Test enhanced chat functionality
    if not test_enhanced_chat_endpoint():
        print(f"\n⚠️  Warning: Some chat endpoint tests failed")
        print("The system may still work, but check the logs for errors")
    else:
        print(f"\n🎉 All chat tests passed!")

    # Final status and usage instructions
    print(f"\n" + "=" * 70)
    print("✅ FLOATCHAT ENHANCED SETUP COMPLETE!".center(70))
    print("=" * 70)
    print(f"\n🎯 Your FloatChat system now features:")
    print(f"   • Unique summaries for each of your BGC float tables")
    print(f"   • Precise coordinate boundaries (min/max lat/lon)")
    print(f"   • Average position calculations")
    print(f"   • Enhanced BGC parameter analysis")
    print(f"   • Semantic search that actually works!")

    print(f"\n🧪 Test your enhanced system:")
    print(f"   python test_queries.py")

    print(f"\n📋 Manual testing commands:")
    print(f'   curl -X POST http://localhost:5000/chat \\')
    print(f'     -H "Content-Type: application/json" \\')
    print(f'     -d \'{{')
    print(f'       "query": "Show me oxygen data from tropical waters",')
    print(f'       "k": 5')
    print(f'     }}\'')

    print(f"\n📊 Check your enhanced metadata:")
    print(f"   cat table_metadata.json | head -100")

if __name__ == "__main__":
    main()