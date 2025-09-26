"""
Configuration module for FloatChat application.
Handles environment variables and application settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

    # Table configuration
    TABLE_LIST = os.getenv("TABLE_LIST", "")  # comma separated table names
    SAMPLE_PER_TABLE = int(os.getenv("SAMPLE_PER_TABLE", "50"))

    # FAISS index configuration
    INDEX_PATH = os.getenv("INDEX_PATH", "faiss.index")
    METADATA_PATH = os.getenv("METADATA_PATH", "table_metadata.json")

    # Embedding model configuration
    EMBED_MODEL_NAME = os.getenv("EMBED_MODEL_NAME", "all-MiniLM-L6-v2")

    # OpenRouter/LLM configuration
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "gpt-3.5-turbo")
    OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    # Flask configuration
    FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")
    FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"

    # MCP configuration
    MCP_SERVER_NAME = os.getenv("MCP_SERVER_NAME", "floatchat-mcp")
    MCP_SERVER_VERSION = os.getenv("MCP_SERVER_VERSION", "1.0.0")

    @classmethod
    def validate(cls):
        """Validate required environment variables."""
        required_vars = [
            ("SUPABASE_URL", cls.SUPABASE_URL),
            ("SUPABASE_KEY", cls.SUPABASE_KEY),
            ("OPENROUTER_API_KEY", cls.OPENROUTER_API_KEY),
        ]

        missing = [name for name, value in required_vars if not value]
        if missing:
            raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

    @classmethod
    def get_table_list(cls):
        """Get list of tables from TABLE_LIST environment variable."""
        return [t.strip() for t in cls.TABLE_LIST.split(",") if t.strip()]

# Create global config instance
config = Config()