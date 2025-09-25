#!/bin/bash

# FloatChat RAG Backend Startup Script

echo "🚀 Starting FloatChat RAG Backend..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create .env file with required configuration."
    exit 1
fi

# Install requirements if not already installed
echo "📦 Installing requirements..."
python3 -m pip install -r requirements.txt

# Start the Flask application
echo "🌐 Starting Flask server on http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python3 floatchat_flask.py