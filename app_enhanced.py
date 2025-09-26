"""
Enhanced FloatChat Flask Application with Three-Layer Query Architecture
Integrates Layer 1 (Semantic), Layer 2 (SQL), and Layer 3 (Synthetic) processing
"""

import asyncio
import logging
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

# Import original components
from floatchat.config.settings import config
from floatchat.database.supabase_client import db_client
from floatchat.embeddings.faiss_index import faiss_manager
from floatchat.llm.openrouter_client import llm_client
from floatchat.visualization.plots import plotter
from floatchat.agents.mcp_agent import mcp_agent, mcp_server
from floatchat.utils.helpers import extract_json_from_text, validate_filters

# Import new three-layer components
from floatchat.query import ThreeLayerQueryProcessor

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the three-layer processor
three_layer_processor = ThreeLayerQueryProcessor()


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "FloatChat Enhanced RAG System",
        "version": config.MCP_SERVER_VERSION,
        "features": ["3-layer query architecture", "semantic search", "SQL parameter matching", "synthetic responses"]
    })


@app.route("/status", methods=["GET"])
def get_status():
    """Get application status and component health."""
    try:
        # Test database connection
        db_status = db_client.test_connection()

        # Get FAISS index info
        index_info = faiss_manager.get_index_info()

        # Test LLM connection
        llm_status = llm_client.test_connection()

        # Get MCP agent status
        agent_status = mcp_agent.get_current_task_status()

        return jsonify({
            "status": "ok",
            "components": {
                "database": {
                    "status": "connected" if db_status else "disconnected",
                    "tables": config.get_table_list()
                },
                "faiss_index": index_info,
                "llm": {
                    "status": "connected" if llm_status else "disconnected",
                    "model": config.OPENROUTER_MODEL
                },
                "mcp_agent": agent_status or {"status": "idle"},
                "three_layer_processor": {
                    "status": "ready",
                    "layers": ["semantic_search", "sql_parameter_matching", "synthetic_response"]
                }
            },
            "config": {
                "embed_model": config.EMBED_MODEL_NAME,
                "sample_per_table": config.SAMPLE_PER_TABLE
            }
        })

    except Exception as e:
        logger.error(f"Status check failed: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@app.route("/build_index", methods=["POST"])
def build_index():
    """Build FAISS index from Supabase tables."""
    try:
        body = request.get_json() or {}
        overwrite = body.get("overwrite", False)

        logger.info(f"Building FAISS index (overwrite={overwrite})")
        index, metadata = faiss_manager.build_index(overwrite=overwrite)

        return jsonify({
            "status": "ok",
            "message": "FAISS index built successfully",
            "tables_indexed": len(metadata),
            "index_dimension": faiss_manager.embedding_dim,
            "metadata": metadata
        })

    except Exception as e:
        logger.error(f"Index building failed: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@app.route("/chat_enhanced", methods=["POST"])
def chat_enhanced():
    """
    Enhanced chat endpoint using three-layer query architecture.
    Automatically progresses through layers until a satisfactory response is found.
    """
    try:
        body = request.get_json() or {}
        user_query = body.get("query", "")
        k = int(body.get("k", 5))
        force_layer = body.get("force_layer")  # Optional: force specific layer (1, 2, or 3)

        if not user_query:
            return jsonify({
                "error": "Provide 'query' in JSON body"
            }), 400

        logger.info(f"Processing enhanced query: {user_query[:100]}...")

        # Process through three-layer architecture
        result = three_layer_processor.process_query(
            query=user_query,
            k=k,
            force_layer=force_layer
        )

        # Add processing metadata to response
        response = result.response
        response["processing_info"] = {
            "final_layer_used": result.final_layer_used.value if result.final_layer_used else None,
            "layers_attempted": [layer.value for layer in result.layers_attempted],
            "total_execution_time": round(result.total_execution_time, 2),
            "layer_performance": [
                {
                    "layer": lr.layer.value,
                    "success": lr.success,
                    "has_data": lr.has_data,
                    "execution_time": round(lr.execution_time, 2),
                    "details": lr.details
                }
                for lr in result.layer_results
            ]
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Enhanced chat request failed: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@app.route("/chat_layer", methods=["POST"])
def chat_layer():
    """
    Test specific layer of the three-layer architecture.
    Useful for debugging and testing individual layers.
    """
    try:
        body = request.get_json() or {}
        user_query = body.get("query", "")
        layer = int(body.get("layer", 1))  # Which layer to test (1, 2, or 3)
        k = int(body.get("k", 5))

        if not user_query:
            return jsonify({
                "error": "Provide 'query' in JSON body"
            }), 400

        if layer not in [1, 2, 3]:
            return jsonify({
                "error": "Layer must be 1 (semantic), 2 (SQL), or 3 (synthetic)"
            }), 400

        logger.info(f"Testing Layer {layer} with query: {user_query[:100]}...")

        # Force specific layer
        result = three_layer_processor.process_query(
            query=user_query,
            k=k,
            force_layer=layer
        )

        response = result.response
        response["layer_test_info"] = {
            "requested_layer": layer,
            "layer_used": result.final_layer_used.value if result.final_layer_used else None,
            "execution_time": round(result.total_execution_time, 2),
            "layer_details": result.layer_results[0].details if result.layer_results else {}
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Layer test request failed: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


# Maintain backward compatibility with original endpoints

@app.route("/chat", methods=["POST"])
def chat():
    """
    Main agentic chat endpoint using MCP orchestration.
    This is the original endpoint maintained for backward compatibility.
    """
    try:
        body = request.get_json() or {}
        user_query = body.get("query", "")
        k = int(body.get("k", 5))

        if not user_query:
            return jsonify({
                "error": "Provide 'query' in JSON body"
            }), 400

        logger.info(f"Processing agentic query: {user_query[:100]}...")

        # Execute task using MCP agent
        context = {"k": k}
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            result = loop.run_until_complete(
                mcp_agent.execute_task(user_query, context)
            )
        finally:
            loop.close()

        return jsonify(result)

    except Exception as e:
        logger.error(f"Chat request failed: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@app.route("/chat_simple", methods=["POST"])
def chat_simple():
    """
    Simplified chat endpoint (Layer 1 semantic search only).
    Uses direct LLM calls without full agentic orchestration.
    """
    try:
        body = request.get_json() or {}
        user_query = body.get("query", "")
        k = int(body.get("k", 5))

        if not user_query:
            return jsonify({
                "error": "Provide 'query' in JSON body"
            }), 400

        logger.info(f"Processing simple query: {user_query[:100]}...")

        # Use Layer 1 only for backward compatibility
        result = three_layer_processor.process_query(
            query=user_query,
            k=k,
            force_layer=1
        )

        return jsonify(result.response)

    except Exception as e:
        logger.error(f"Simple chat request failed: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@app.route("/chat_text", methods=["POST"])
def chat_text():
    """Plain text chat endpoint returning text/plain response."""
    try:
        body = request.get_json() or {}
        user_query = body.get("query", "")
        k = int(body.get("k", 5))

        if not user_query:
            return Response(
                "Error: Provide 'query' in JSON body.",
                content_type="text/plain",
                status=400
            )

        logger.info(f"Processing text query: {user_query[:100]}...")

        # Use enhanced processing
        result = three_layer_processor.process_query(query=user_query, k=k)
        answer = result.response.get("answer", "No answer generated")

        return Response(answer.strip(), content_type="text/plain")

    except Exception as e:
        logger.error(f"Text chat request failed: {e}")
        return Response(
            f"Error: {str(e)}",
            content_type="text/plain",
            status=500
        )


@app.route("/tools", methods=["GET"])
def list_tools():
    """List available MCP tools."""
    try:
        tools = mcp_agent.list_available_tools()
        return jsonify({
            "status": "ok",
            "tools": tools,
            "mcp_server": {
                "name": config.MCP_SERVER_NAME,
                "version": config.MCP_SERVER_VERSION
            },
            "enhanced_features": {
                "three_layer_processing": True,
                "semantic_search": True,
                "sql_parameter_matching": True,
                "synthetic_responses": True
            }
        })

    except Exception as e:
        logger.error(f"Failed to list tools: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@app.route("/mcp", methods=["POST"])
def mcp_endpoint():
    """MCP protocol endpoint for external MCP clients."""
    try:
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                "error": {
                    "code": -32600,
                    "message": "Invalid Request"
                }
            }), 400

        # Handle MCP request asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            response = loop.run_until_complete(
                mcp_server.handle_request(request_data)
            )
        finally:
            loop.close()

        return jsonify(response)

    except Exception as e:
        logger.error(f"MCP request failed: {e}")
        return jsonify({
            "error": {
                "code": -32603,
                "message": f"Internal error: {str(e)}"
            }
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": [
            "GET /health",
            "GET /status",
            "GET /tools",
            "POST /build_index",
            "POST /chat_enhanced (NEW - Three-layer processing)",
            "POST /chat_layer (NEW - Test specific layer)",
            "POST /chat (Original agentic)",
            "POST /chat_simple (Original Layer 1 only)",
            "POST /chat_text",
            "POST /mcp"
        ]
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        "error": "Internal server error",
        "message": str(error)
    }), 500


def initialize_app():
    """Initialize application components."""
    try:
        # Validate configuration
        config.validate()
        logger.info("Configuration validated successfully")

        # Test database connection
        if db_client.test_connection():
            logger.info("Database connection established")
        else:
            logger.warning("Database connection failed")

        # Try to load existing FAISS index
        try:
            faiss_manager.load_index()
            logger.info("FAISS index loaded successfully")
        except FileNotFoundError:
            logger.info("No existing FAISS index found - will need to build one")

        # Test LLM connection
        if llm_client.test_connection():
            logger.info("LLM connection established")
        else:
            logger.warning("LLM connection failed")

        logger.info("FloatChat Enhanced application initialized successfully")
        logger.info("🚀 Three-layer query architecture ready!")
        logger.info("  - Layer 1: Semantic search via FAISS")
        logger.info("  - Layer 2: SQL parameter matching")
        logger.info("  - Layer 3: Synthetic response generation")

    except Exception as e:
        logger.error(f"Application initialization failed: {e}")
        raise


if __name__ == "__main__":
    initialize_app()

    logger.info(f"Starting FloatChat Enhanced server on {config.FLASK_HOST}:{config.FLASK_PORT}")
    app.run(
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
        debug=config.FLASK_DEBUG
    )