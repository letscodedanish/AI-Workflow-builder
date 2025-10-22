# Architecture Documentation

## System Overview

GenAI Stack is a no-code/low-code platform for building AI-powered workflows. The system follows a modern microservices architecture with clear separation between frontend, backend, and data layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           React Frontend (Vite + TypeScript)         │   │
│  │  - Workflow Builder (React Flow)                     │   │
│  │  - Component Configuration                           │   │
│  │  - Chat Interface                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌────────────────────┐         ┌────────────────────────┐  │
│  │   FastAPI Backend  │◄───────►│   Supabase Backend     │  │
│  │  - Workflow Engine │         │  - Auth & Database     │  │
│  │  - Document Proc.  │         │  - Real-time Updates   │  │
│  │  - API Endpoints   │         │  - File Storage        │  │
│  └────────────────────┘         └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Service Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  ChromaDB   │  │  OpenAI API │  │   SerpAPI        │   │
│  │  Vector DB  │  │  LLM/Embed  │  │   Web Search     │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PostgreSQL (Supabase)                   │   │
│  │  - Workflow Definitions                              │   │
│  │  - Document Metadata                                 │   │
│  │  - Chat History                                      │   │
│  │  - Execution Logs                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── WorkflowNode.tsx          # Custom React Flow node component
│   ├── ComponentLibrary.tsx      # Draggable component palette
│   ├── ConfigPanel.tsx           # Dynamic configuration forms
│   └── ChatInterface.tsx         # Real-time chat UI
├── pages/
│   ├── StacksPage.tsx            # Stack management dashboard
│   └── WorkflowEditor.tsx        # Main workflow canvas
├── lib/
│   └── supabase.ts               # Database client
└── types/
    └── workflow.ts               # TypeScript definitions
```

### Backend Services (Reference Implementation)

```
backend/
├── main.py                       # FastAPI application
├── services/
│   ├── document_processor.py    # PDF text extraction
│   ├── embedding_service.py     # Generate embeddings
│   ├── llm_service.py           # LLM integration
│   ├── workflow_engine.py       # Execute workflows
│   └── vector_store.py          # ChromaDB operations
├── models/
│   ├── workflow.py              # Workflow data models
│   └── document.py              # Document data models
└── api/
    ├── documents.py             # Document endpoints
    ├── workflows.py             # Workflow endpoints
    └── chat.py                  # Chat endpoints
```

## Data Flow

### Workflow Creation Flow

```
User Action → Component Library → Workflow Canvas → React Flow State
                                                          ↓
                                                    Save to Supabase
                                                          ↓
                                                   PostgreSQL Database
```

### Document Upload Flow

```
File Upload → FastAPI Endpoint → PyMuPDF (Text Extract)
                                         ↓
                                  OpenAI Embeddings API
                                         ↓
                                  ChromaDB Storage
                                         ↓
                                  Metadata → Supabase
```

### Query Execution Flow

```
User Query → Workflow Validation → Extract Components
                                           ↓
                      ┌────────────────────┴────────────────────┐
                      ▼                                          ▼
             Knowledge Base                               Direct to LLM
                      ↓                                          ↓
             Retrieve Context                            Skip Context
                      ↓                                          ↓
                      └────────────────────┬────────────────────┘
                                           ↓
                                      LLM Engine
                               (OpenAI/Gemini + Optional Web Search)
                                           ↓
                                      Format Output
                                           ↓
                                      Chat Interface
                                           ↓
                                    Save to Database
```

## Database Schema

### Tables

#### stacks
Stores workflow definitions
- `id`: UUID primary key
- `name`: Workflow name
- `description`: Workflow description
- `workflow_data`: JSONB (nodes + edges)
- `created_at`, `updated_at`: Timestamps

#### documents
Stores uploaded documents
- `id`: UUID primary key
- `stack_id`: Foreign key to stacks
- `filename`: Original filename
- `file_path`: Storage location
- `file_size`: File size in bytes
- `mime_type`: File type
- `text_content`: Extracted text
- `created_at`: Timestamp

#### embeddings
Stores vector embeddings
- `id`: UUID primary key
- `document_id`: Foreign key to documents
- `chunk_text`: Text chunk
- `chunk_index`: Position in document
- `embedding_model`: Model used
- `metadata`: JSONB additional data
- `created_at`: Timestamp

#### chat_messages
Stores chat history
- `id`: UUID primary key
- `stack_id`: Foreign key to stacks
- `session_id`: Session identifier
- `role`: user/assistant/system
- `content`: Message text
- `metadata`: JSONB additional data
- `created_at`: Timestamp

#### execution_logs
Logs workflow execution
- `id`: UUID primary key
- `stack_id`: Foreign key to stacks
- `session_id`: Execution session
- `component_type`: Component executed
- `input_data`, `output_data`: JSONB
- `status`: success/error
- `error_message`: Error details
- `duration_ms`: Execution time
- `created_at`: Timestamp

## API Endpoints

### Workflow Management

```
GET    /api/stacks              # List all stacks
GET    /api/stacks/:id          # Get stack details
POST   /api/stacks              # Create new stack
PUT    /api/stacks/:id          # Update stack
DELETE /api/stacks/:id          # Delete stack
```

### Document Operations

```
POST   /api/documents/upload    # Upload document
GET    /api/documents/:id       # Get document
DELETE /api/documents/:id       # Delete document
POST   /api/documents/process   # Process uploaded doc
```

### Workflow Execution

```
POST   /api/workflow/execute    # Execute workflow
GET    /api/workflow/validate   # Validate workflow
POST   /api/workflow/test       # Test workflow
```

### Chat

```
GET    /api/chat/history/:stackId      # Get chat history
POST   /api/chat/message               # Send message
DELETE /api/chat/session/:sessionId    # Clear session
```

## Component Types

### 1. User Query Component

**Purpose**: Entry point for user input

**Configuration**:
- None required (query provided at runtime)

**Inputs**: None
**Outputs**: `query` (string)

**Implementation**:
```typescript
{
  type: 'userQuery',
  data: {
    config: { query: '' }
  }
}
```

### 2. Knowledge Base Component

**Purpose**: Retrieve context from uploaded documents

**Configuration**:
- Embedding model selection
- API key
- File uploads

**Inputs**: `query` (from User Query)
**Outputs**: `context` (string)

**Implementation**:
1. Upload documents via API
2. Extract text with PyMuPDF
3. Generate embeddings with OpenAI
4. Store in ChromaDB
5. On query: retrieve top K similar chunks
6. Return concatenated context

### 3. LLM Engine Component

**Purpose**: Generate responses using language models

**Configuration**:
- Model selection (GPT-4o, GPT-3.5, etc.)
- API key
- System prompt
- Temperature
- Web search toggle
- Web search API key

**Inputs**:
- `query` (from User Query)
- `context` (optional, from Knowledge Base)

**Outputs**: `response` (string)

**Implementation**:
1. Build prompt with context and query
2. Optional: Perform web search
3. Call OpenAI/Gemini API
4. Return generated response

### 4. Output Component

**Purpose**: Display results to user

**Configuration**:
- Display mode (text/json)

**Inputs**: `response` (from LLM Engine)
**Outputs**: None (terminal node)

**Implementation**:
- Render in chat interface
- Save to database
- Update UI

## Workflow Validation

A valid workflow must:
1. Have at least one User Query component
2. Have at least one LLM Engine component
3. Have at least one Output component
4. Have valid connections between components
5. All required configurations filled

### Validation Rules

```typescript
function validateWorkflow(nodes, edges) {
  // Check required components exist
  const hasUserQuery = nodes.some(n => n.type === 'userQuery');
  const hasLLM = nodes.some(n => n.type === 'llmEngine');
  const hasOutput = nodes.some(n => n.type === 'output');

  if (!hasUserQuery || !hasLLM || !hasOutput) {
    return { valid: false, error: 'Missing required components' };
  }

  // Check connections
  if (edges.length === 0) {
    return { valid: false, error: 'No connections between components' };
  }

  // Validate configuration
  for (const node of nodes) {
    const isValid = validateNodeConfig(node);
    if (!isValid) {
      return { valid: false, error: `Invalid config for ${node.id}` };
    }
  }

  return { valid: true };
}
```

## Security Considerations

### Frontend
- API keys stored in component config (encrypted in DB)
- Never expose keys in client-side code
- Use environment variables for sensitive data

### Backend
- API key validation before execution
- Rate limiting on endpoints
- Input sanitization
- CORS configuration
- Authentication required (optional)

### Database
- Row Level Security (RLS) enabled
- Prepared statements to prevent SQL injection
- Encrypted connections
- Regular backups

### API Keys
- Never commit to version control
- Use secret management (AWS Secrets Manager, Vault)
- Rotate regularly
- Minimum required permissions

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Memoization of components
- Virtual scrolling for large lists
- Debounced inputs

### Backend
- Caching with Redis
- Connection pooling
- Async processing
- Background jobs for long tasks

### Database
- Proper indexing
- Query optimization
- Connection pooling
- Read replicas for scaling

### Vector Store
- Batch operations
- Efficient similarity search
- Index optimization

## Scalability

### Horizontal Scaling
- Multiple frontend replicas (stateless)
- Multiple backend replicas (stateless)
- Load balancing

### Vertical Scaling
- Increase resources for ChromaDB
- Larger database instances

### Caching Strategy
- Redis for session data
- CDN for static assets
- Query result caching

## Monitoring and Logging

### Metrics
- Request rate and latency
- Error rates
- Component execution time
- Database query performance
- API usage and costs

### Logs
- Application logs (structured JSON)
- Access logs
- Error logs with stack traces
- Audit logs for sensitive operations

### Alerts
- High error rates
- Slow queries
- API quota limits
- System resource usage

## Future Enhancements

1. **Authentication System**
   - User registration and login
   - OAuth integration
   - Role-based access control

2. **Advanced Features**
   - Workflow templates
   - Component marketplace
   - Collaboration features
   - Version control for workflows

3. **Integration**
   - More LLM providers (Claude, Llama)
   - Additional data sources
   - Webhook triggers
   - API connectors

4. **Performance**
   - Streaming responses
   - Parallel component execution
   - Smart caching
   - Query optimization

5. **Analytics**
   - Usage analytics
   - Cost tracking
   - Performance insights
   - A/B testing
