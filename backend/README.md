# FloatChat RAG Backend

This is the RAG (Retrieval-Augmented Generation) backend for FloatChat that integrates with Supabase ocean data and Mistral AI.

## Features

- **RAG Pipeline**: Uses FAISS for vector similarity search across ocean data tables
- **Mistral AI Integration**: Leverages Mistral Large for intelligent responses
- **Supabase Integration**: Connects to ocean/Argo float databases
- **Advanced Plotting**: Generates aesthetic ocean data visualizations
- **CORS Support**: Ready for frontend integration

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Quick Start

1. **Setup the environment:**
   ```bash
   python3 setup.py
   ```

2. **Start the server:**
   ```bash
   ./start.sh
   ```

   Or manually:
   ```bash
   python3 floatchat_flask.py
   ```

## Configuration

The backend uses environment variables defined in `.env`:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Table list for RAG indexing
TABLE_LIST=bgc_4900482,bgc_4900476,argo_1900693,...

# Mistral AI Configuration
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions

# Flask Configuration
FLASK_ENV=development
PORT=5000
```

## API Endpoints

### POST /build_index
Builds the FAISS vector index from Supabase tables. Run this once before using the chat endpoints.

**Request:**
```json
{}
```

**Response:**
```json
{
  "status": "ok",
  "tables_indexed": 120
}
```

### POST /chat
Main chat endpoint with RAG pipeline and visualization support.

**Request:**
```json
{
  "query": "What is the temperature distribution in the Pacific Ocean?",
  "k": 5
}
```

**Response:**
```json
{
  "answer": "Based on the ocean data analysis...",
  "used_tables": ["argo_1900693", "bgc_4900482"],
  "plots": [
    {
      "type": "temperature_profile",
      "title": "Temperature - argo_1900693",
      "data": [{"x": [18.5, 19.2], "y": [0, 50]}],
      "base64": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "suggested_visualizations": [],
  "candidates": [...],
  "raw_llm_filters": {...},
  "raw_llm_final": {...}
}
```

### POST /chat_text
Simple text-only chat endpoint.

**Request:**
```json
{
  "query": "Tell me about ocean temperature",
  "k": 5
}
```

**Response:**
```
Plain text response about ocean temperature...
```

## Architecture

1. **Vector Search**: FAISS indexes table summaries for semantic search
2. **Data Retrieval**: Queries relevant Supabase tables based on user input
3. **LLM Processing**: Mistral AI generates filters and final responses
4. **Visualization**: Creates matplotlib plots with both data and base64 fallback

## Data Flow

```
User Query → Vector Search → Table Selection → Data Filtering →
LLM Analysis → Response Generation → Plot Creation → JSON Response
```

## Dependencies

- **Flask**: Web framework with CORS support
- **FAISS**: Vector similarity search
- **SentenceTransformers**: Text embedding model
- **Supabase**: Database client
- **Matplotlib**: Plot generation
- **Mistral AI**: Language model API

## Troubleshooting

### Index Not Found Error
Run the build index endpoint first:
```bash
curl -X POST http://localhost:5000/build_index
```

### Supabase Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Check table names in `TABLE_LIST`

### Mistral API Issues
- Verify `MISTRAL_API_KEY` is valid
- Check API rate limits

### Plot Display Issues
The backend provides both structured data and base64 fallback for plots. The frontend should prioritize the structured data for better aesthetics.

## Development

To run in development mode:
```bash
export FLASK_ENV=development
python3 floatchat_flask.py
```

The server will run on `http://localhost:5000` with auto-reload enabled.