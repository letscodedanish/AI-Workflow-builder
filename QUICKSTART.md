# Quick Start Guide

Get the GenAI Stack application running in under 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- A modern web browser

## Option 1: Frontend Only (Fastest)

This gets you the visual workflow builder with simulated responses.

### Steps

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**

   Navigate to: http://localhost:5173

4. **Start building workflows**
   - Click "New Stack" to create a workflow
   - Drag components from the left panel
   - Connect them by dragging from output handles to input handles
   - Click a component to configure it
   - Click "Build Stack" to test your workflow
   - Use the chat interface to interact

### What You Can Do

✅ Create and save workflows
✅ Configure all components
✅ Test the chat interface
✅ Save workflows to database
✅ View workflow history

⚠️ LLM responses are simulated (need backend for real responses)

## Option 2: Full Stack with Docker

Get everything running including ChromaDB.

### Steps

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Wait for services to start** (~30 seconds)

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - ChromaDB: http://localhost:8001

4. **Configure your API keys**
   - Open a workflow
   - Add components
   - Enter your OpenAI API key in component config
   - Enter SerpAPI key if using web search

### What You Need

- Docker and Docker Compose installed
- OpenAI API key (get from https://platform.openai.com)
- SerpAPI key (optional, get from https://serpapi.com)

## Option 3: Manual Full Stack

For development with hot-reload.

### Step 1: Start ChromaDB
```bash
docker run -d -p 8001:8000 chromadb/chroma
```

### Step 2: Setup Backend
```bash
cd backend-reference

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=your_supabase_url
OPENAI_API_KEY=your_openai_key
SERPAPI_KEY=your_serpapi_key
CHROMADB_HOST=localhost
CHROMADB_PORT=8001
EOF

# Start server
uvicorn main:app --reload
```

### Step 3: Start Frontend
```bash
# In a new terminal, in project root
npm install --legacy-peer-deps
npm run dev
```

### Step 4: Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## First Workflow Tutorial

### Creating a Simple Q&A Bot

1. **Create a new stack**
   - Click "New Stack" on the home page
   - Name it "Q&A Bot"

2. **Add components**
   - Drag "User Query" to the canvas
   - Drag "LLM Engine" to the canvas
   - Drag "Output" to the canvas

3. **Connect components**
   - Drag from User Query's "Query" output to LLM Engine's "Query" input
   - Drag from LLM Engine's "Output" to Output's "Output" input

4. **Configure LLM Engine**
   - Click on the LLM Engine component
   - Select model (e.g., "GPT 4o-mini")
   - Enter your OpenAI API key
   - Set temperature (e.g., 0.7)
   - Enter system prompt (e.g., "You are a helpful assistant")

5. **Test your workflow**
   - Click "Build Stack"
   - Chat interface will open
   - Type a question: "What is artificial intelligence?"
   - Get AI-powered response!

### Creating a Document Q&A Bot

1. **Create stack and add components**
   - User Query
   - Knowledge Base
   - LLM Engine
   - Output

2. **Connect them**
   - User Query → Knowledge Base (query to query)
   - Knowledge Base → LLM Engine (context to context)
   - User Query → LLM Engine (query to query)
   - LLM Engine → Output

3. **Configure Knowledge Base**
   - Click the component
   - Upload a PDF document
   - Select embedding model
   - Enter OpenAI API key

4. **Configure LLM Engine**
   - Select model
   - Enter API key
   - Set prompt: "You are a helpful assistant. Use the CONTEXT: {context} to answer the User Query: {query}"
   - Adjust temperature

5. **Test with document context**
   - Build and chat
   - Ask questions about your document
   - Get context-aware responses!

## Troubleshooting

### "Cannot find module" error
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Build fails
```bash
npm run typecheck  # Check for type errors
npm run lint       # Check for linting errors
```

### Database connection issues
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is active
- Ensure network connectivity

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Verify all dependencies installed: `pip list`
- Check ports 8000 and 8001 are available

### API key errors
- Verify OpenAI API key is valid
- Check you have credits in your OpenAI account
- Ensure API key has correct permissions

### ChromaDB connection fails
```bash
# Check if ChromaDB is running
curl http://localhost:8001/api/v1/heartbeat

# Restart ChromaDB
docker restart <chromadb_container_id>
```

## Next Steps

After getting started:

1. **Explore the documentation**
   - [README.md](./README.md) - Full feature list
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
   - [API.md](./API.md) - API reference

2. **Try different workflows**
   - Simple chat bot
   - Document Q&A
   - Web search integration
   - Multi-step workflows

3. **Customize components**
   - See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
   - Add new component types
   - Modify existing components

4. **Deploy to production**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Docker deployment
   - Kubernetes deployment
   - Monitoring setup

## Getting API Keys

### OpenAI API Key
1. Go to https://platform.openai.com
2. Sign up or log in
3. Go to API Keys section
4. Create new key
5. Copy and save securely

### SerpAPI Key (Optional)
1. Go to https://serpapi.com
2. Sign up for free account
3. Get API key from dashboard
4. 100 free searches per month

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run typecheck       # Check TypeScript types
npm run lint            # Lint code

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
docker-compose ps        # Check status

# Backend
uvicorn main:app --reload        # Start with hot reload
uvicorn main:app --host 0.0.0.0 # Start accessible from network
python -m pytest                 # Run tests
```

## Support

Need help?

- 📖 Check the documentation files
- 🐛 Open an issue on GitHub
- 💬 Join the community Discord
- 📧 Email: support@genaistack.com

## Pro Tips

1. **Save Often**: Workflows auto-save, but click Save to be sure
2. **Test Incrementally**: Build small workflows first
3. **Use Web Search**: Enable for current information
4. **Monitor Costs**: Check OpenAI usage dashboard
5. **Start Simple**: Begin with User Query → LLM → Output

Happy building! 🚀
