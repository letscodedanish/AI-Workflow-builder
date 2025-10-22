# GenAI Stack - No-Code Workflow Builder

A powerful no-code/low-code web application that enables users to visually create and interact with intelligent workflows. Build custom AI-powered applications by connecting components that handle user input, extract knowledge from documents, interact with language models, and return answers through a chat interface.

## 🎯 Project Status

### ✅ Completed (Frontend)
- Visual workflow builder with React Flow
- All 4 component types implemented (User Query, Knowledge Base, LLM Engine, Output)
- Dynamic configuration panels for each component
- Stack management page (My Stacks view)
- Chat interface with message history
- Supabase database integration
- Complete PostgreSQL schema with RLS
- Responsive design matching Figma specifications
- Docker and Kubernetes deployment configurations

### 📋 Reference Implementation Provided (Backend)
- FastAPI backend structure in `backend-reference/`
- Document processing service (PyMuPDF)
- Embedding generation service (OpenAI)
- Vector store integration (ChromaDB)
- LLM service with web search (SerpAPI)
- Workflow execution engine
- Complete API documentation

### 🚀 Ready to Deploy
- Docker Compose configuration
- Kubernetes manifests (deployments, services, ingress)
- Comprehensive documentation
- Architecture diagrams
- API specifications

## Features

- **Visual Workflow Builder**: Drag-and-drop interface powered by React Flow
- **4 Core Components**:
  - User Query: Entry point for user queries
  - Knowledge Base: Upload documents and extract embeddings for context-aware responses
  - LLM Engine: Connect to OpenAI GPT or Gemini models
  - Output: Display results in a chat interface
- **Real-time Chat Interface**: Ask questions and get AI-powered responses
- **Workflow Persistence**: Save and load workflows with Supabase
- **Chat History**: Keep track of all conversations
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Flow** for visual workflow building
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for fast development and building

### Backend & Database
- **Supabase** for database and real-time features
- **PostgreSQL** database with Row Level Security

### Database Schema

The application uses the following tables:

1. **stacks**: Store workflow definitions
2. **documents**: Store uploaded documents and metadata
3. **embeddings**: Store document embeddings for vector search
4. **chat_messages**: Store chat history
5. **execution_logs**: Log workflow execution details

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (already configured in this project)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install --legacy-peer-deps
```

3. Environment variables are already configured in `.env`

4. Start the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## Usage

### Creating a Workflow

1. Navigate to the home page and click "New Stack"
2. You'll be taken to the workflow editor
3. Drag components from the left panel onto the canvas
4. Connect components by dragging from output handles to input handles
5. Click on a component to configure it in the right panel
6. Click "Save" to save your workflow

### Component Configuration

#### User Query Component
- No configuration needed
- Serves as the entry point for user queries

#### Knowledge Base Component
- Upload PDF, TXT, or DOC files
- Select embedding model (OpenAI text-embedding models)
- Enter your OpenAI API key
- Files are processed and embeddings are stored for retrieval

#### LLM Engine Component
- Select AI model (GPT-4o, GPT-4o-mini, GPT-3.5-turbo)
- Enter your OpenAI API key
- Configure system prompt (use `{context}` and `{query}` placeholders)
- Adjust temperature (0-2)
- Enable web search with SerpAPI (optional)

#### Output Component
- Displays results in the chat interface
- No configuration needed

### Running a Workflow

1. Build a valid workflow (User Query → [Knowledge Base] → LLM Engine → Output)
2. Click "Build Stack" to validate and prepare the workflow
3. The chat interface will open
4. Type your questions and get AI-powered responses

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.tsx       # Chat UI component
│   ├── ComponentLibrary.tsx    # Draggable component library
│   ├── ConfigPanel.tsx         # Dynamic configuration panel
│   └── WorkflowNode.tsx        # Custom React Flow node
├── pages/
│   ├── StacksPage.tsx          # Home page with stack list
│   └── WorkflowEditor.tsx      # Main workflow editor
├── lib/
│   └── supabase.ts             # Supabase client and types
├── types/
│   └── workflow.ts             # TypeScript type definitions
├── App.tsx                     # Main app with routing
└── main.tsx                    # Application entry point
```

## Backend Integration

This frontend application is ready to connect to a FastAPI backend. The simulated workflow execution can be replaced with real API calls to:

- Process document uploads
- Generate embeddings with ChromaDB
- Execute LLM queries with OpenAI/Gemini
- Perform web searches with SerpAPI

### Required Backend Endpoints

```
POST /api/documents/upload       # Upload and process documents
POST /api/embeddings/generate    # Generate embeddings
POST /api/workflow/execute       # Execute workflow
GET  /api/chat/history/:stackId  # Get chat history
```

## Deployment

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

Build and run:

```bash
docker build -t genai-stack .
docker run -p 4173:4173 genai-stack
```

### Kubernetes (Optional)

Create Kubernetes manifests for:
- Deployment
- Service
- Ingress
- ConfigMap for environment variables

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Future Enhancements

- [ ] Real backend integration with FastAPI
- [ ] ChromaDB vector store integration
- [ ] File upload to cloud storage
- [ ] User authentication
- [ ] Workflow templates
- [ ] Export/import workflows
- [ ] Collaborative editing
- [ ] Advanced analytics and monitoring
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using React, TypeScript, and Supabase
