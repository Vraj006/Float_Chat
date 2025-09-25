# FloatChat RAG Integration Setup Guide

This guide will help you set up the new RAG (Retrieval-Augmented Generation) pipeline for FloatChat.

## What Changed

The FloatChat AI chatbot now uses a sophisticated RAG pipeline instead of direct Mistral API calls:

- **RAG Backend**: Flask server with FAISS vector search
- **Enhanced Plotting**: Real-time ocean data visualizations
- **Supabase Integration**: Direct connection to ocean databases
- **Intelligent Retrieval**: Context-aware data selection

## Prerequisites

### For Backend (Python)
- Python 3.8 or higher
- pip package manager

### For Frontend (Node.js)
- Node.js 16 or higher
- npm or yarn

## Step 1: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Run the setup script:**
   ```bash
   python3 setup.py
   ```

3. **Verify the .env file has correct configuration:**
   ```bash
   cat .env
   ```

4. **Start the backend server:**
   ```bash
   ./start.sh
   ```

   Or manually:
   ```bash
   python3 floatchat_flask.py
   ```

5. **Build the vector index (one-time setup):**
   ```bash
   curl -X POST http://localhost:5000/build_index
   ```

   Expected response:
   ```json
   {"status":"ok","tables_indexed":120}
   ```

## Step 2: Frontend Setup

1. **Navigate back to project root:**
   ```bash
   cd ..
   ```

2. **Install new dependencies:**
   ```bash
   npm install
   ```

3. **Verify environment configuration:**
   ```bash
   cat .env.local
   ```

   Should include:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

## Step 3: Testing the Integration

1. **Test backend health:**
   ```bash
   curl http://localhost:5000/
   ```

2. **Test chat endpoint:**
   ```bash
   curl -X POST http://localhost:5000/chat \
     -H "Content-Type: application/json" \
     -d '{"query": "What is the temperature in the Pacific Ocean?", "k": 5}'
   ```

3. **Open the frontend:**
   Visit `http://localhost:3000` (or your dev server URL)

4. **Test the AI chatbot:**
   - Navigate to the AI Chat page
   - Try asking: "Show me ocean temperature data"
   - Verify that plots are displayed correctly

## Architecture Overview

```
Frontend (React) → RAG Service → Flask Backend → Supabase Database
                              ↓
                          FAISS Index → Mistral AI
                              ↓
                          Plot Generation
```

## Key Features

### Enhanced Plotting
- Real-time data from Supabase
- Interactive temperature/salinity profiles
- Aesthetic visualizations instead of base64 images

### RAG Pipeline
1. **Query Processing**: User question analyzed
2. **Vector Search**: FAISS finds relevant tables
3. **Data Retrieval**: Supabase queries filtered data
4. **LLM Analysis**: Mistral generates intelligent responses
5. **Visualization**: Matplotlib creates beautiful plots

### Smart Suggestions
- Context-aware follow-up questions
- Table-specific recommendations
- Topic-based exploration

## Troubleshooting

### Backend Issues

**Error: "Index not found"**
- Run: `curl -X POST http://localhost:5000/build_index`
- Wait for indexing to complete

**Error: "Supabase connection failed"**
- Check `SUPABASE_URL` and `SUPABASE_KEY` in `backend/.env`
- Verify table names in `TABLE_LIST`

**Error: "Mistral API failed"**
- Check `MISTRAL_API_KEY` in `backend/.env`
- Verify API key validity

### Frontend Issues

**Error: "Network Error"**
- Ensure backend is running on port 5000
- Check `VITE_BACKEND_URL` in `.env.local`

**Plots not displaying**
- Check browser console for errors
- Verify plot data structure in network tab

### Performance Tips

1. **Index Updates**: Rebuild index when new tables are added
2. **Cache Management**: Backend caches embeddings for better performance
3. **Query Optimization**: Use specific keywords for better retrieval

## Development Workflow

1. **Make Backend Changes:**
   - Edit `backend/floatchat_flask.py`
   - Restart backend: `python3 floatchat_flask.py`

2. **Make Frontend Changes:**
   - Edit React components
   - Hot reload automatically updates

3. **Test Integration:**
   - Use curl for backend testing
   - Use browser for frontend testing

## Production Deployment

### Backend Deployment
```bash
# Use production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 floatchat_flask:app
```

### Frontend Deployment
```bash
# Update VITE_BACKEND_URL for production
echo "VITE_BACKEND_URL=https://your-backend-domain.com" >> .env.production

# Build for production
npm run build
```

## Support

If you encounter issues:

1. Check logs in both frontend and backend consoles
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Test endpoints individually before integration

The RAG integration provides a much more sophisticated and accurate AI experience for ocean data analysis!