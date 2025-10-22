# Implementation Guide

This guide provides step-by-step instructions for implementing and extending the GenAI Stack application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend Implementation](#backend-implementation)
4. [Database Setup](#database-setup)
5. [Integration Guide](#integration-guide)
6. [Testing](#testing)
7. [Deployment](#deployment)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+ (for backend)
- PostgreSQL (via Supabase)
- Docker (optional)

### Quick Start

1. **Clone and Install**

```bash
git clone <repository>
cd genai-stack
npm install --legacy-peer-deps
```

2. **Configure Environment**

The `.env` file is already configured with Supabase credentials.

3. **Start Development**

```bash
npm run dev
```

4. **Access Application**

Open http://localhost:5173 in your browser.

## Frontend Implementation

### Current State

The frontend is **fully implemented** and includes:

- ✅ Workflow canvas with React Flow
- ✅ All 4 component types (User Query, Knowledge Base, LLM Engine, Output)
- ✅ Component configuration panels
- ✅ Chat interface
- ✅ Stack management page
- ✅ Database integration with Supabase
- ✅ Responsive design

### Key Files

```
src/
├── components/
│   ├── WorkflowNode.tsx         # Custom React Flow nodes
│   ├── ComponentLibrary.tsx     # Component palette
│   ├── ConfigPanel.tsx          # Configuration UI
│   └── ChatInterface.tsx        # Chat interface
├── pages/
│   ├── StacksPage.tsx           # Home page
│   └── WorkflowEditor.tsx       # Main editor
├── lib/
│   └── supabase.ts              # Database client
└── types/
    └── workflow.ts              # Type definitions
```

### Extending Components

#### Adding a New Component Type

1. **Update Type Definition** (`src/types/workflow.ts`)

```typescript
export type ComponentType =
  | 'userQuery'
  | 'knowledgeBase'
  | 'llmEngine'
  | 'output'
  | 'newComponent'; // Add new type

export const COMPONENT_DEFINITIONS: Record<ComponentType, ComponentDefinition> = {
  // ... existing components
  newComponent: {
    type: 'newComponent',
    label: 'New Component',
    icon: 'Zap',
    description: 'Description of new component',
    color: '#ff6b6b',
    handles: {
      inputs: [{ id: 'input', label: 'Input' }],
      outputs: [{ id: 'output', label: 'Output' }],
    },
  },
};
```

2. **Create Configuration UI** (`src/components/ConfigPanel.tsx`)

```typescript
function renderNewComponentConfig() {
  return (
    <div className="space-y-4">
      <div>
        <label>Configuration Field</label>
        <input
          value={config.field}
          onChange={(e) => handleChange('field', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
    </div>
  );
}
```

3. **Add to Component Library** (automatic via COMPONENT_DEFINITIONS)

4. **Implement Execution Logic** (in backend)

### Customizing Styles

The app uses Tailwind CSS. To customize:

1. **Edit Tailwind Config** (`tailwind.config.js`)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
      },
    },
  },
};
```

2. **Update Component Colors** (`src/types/workflow.ts`)

```typescript
color: '#your-custom-color'
```

### Adding Features

#### Workflow Templates

1. Create `src/data/templates.ts`:

```typescript
export const templates = [
  {
    id: 'chat-bot',
    name: 'Simple Chat Bot',
    description: 'Basic Q&A bot',
    workflow_data: {
      nodes: [...],
      edges: [...],
    },
  },
];
```

2. Add template selector to StacksPage:

```typescript
<button onClick={() => createFromTemplate(template)}>
  Use Template
</button>
```

#### Export/Import Workflows

```typescript
function exportWorkflow(workflow) {
  const json = JSON.stringify(workflow, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workflow.json';
  a.click();
}

function importWorkflow(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const workflow = JSON.parse(e.target.result);
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
  };
  reader.readAsText(file);
}
```

## Backend Implementation

### Current State

The backend is provided as a **reference implementation** in `backend-reference/`.

### Setting Up Backend

1. **Create Virtual Environment**

```bash
cd backend-reference
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**

```bash
pip install -r requirements.txt
```

3. **Configure Environment**

Create `.env` file:

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SERPAPI_KEY=...
CHROMADB_HOST=localhost
CHROMADB_PORT=8000
```

4. **Start Server**

```bash
uvicorn main:app --reload
```

### Implementing Core Services

#### Document Processing Service

```python
# services/document_processor.py
import fitz  # PyMuPDF

class DocumentProcessor:
    def extract_text(self, file_path: str) -> str:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text

    def chunk_text(self, text: str, chunk_size: int = 1000) -> list[str]:
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0

        for word in words:
            current_chunk.append(word)
            current_size += len(word) + 1

            if current_size >= chunk_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_size = 0

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks
```

#### Embedding Service

```python
# services/embedding_service.py
from openai import OpenAI

class EmbeddingService:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def generate_embeddings(
        self,
        texts: list[str],
        model: str = "text-embedding-3-large"
    ) -> list[list[float]]:
        response = self.client.embeddings.create(
            model=model,
            input=texts
        )
        return [item.embedding for item in response.data]
```

#### Vector Store Service

```python
# services/vector_store.py
import chromadb

class VectorStore:
    def __init__(self, host: str, port: int):
        self.client = chromadb.HttpClient(host=host, port=port)

    def create_collection(self, stack_id: str):
        return self.client.get_or_create_collection(f"stack_{stack_id}")

    def add_documents(
        self,
        collection_name: str,
        documents: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict]
    ):
        collection = self.client.get_collection(collection_name)
        ids = [f"doc_{i}" for i in range(len(documents))]
        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

    def query(
        self,
        collection_name: str,
        query_embedding: list[float],
        n_results: int = 3
    ):
        collection = self.client.get_collection(collection_name)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results
```

#### LLM Service

```python
# services/llm_service.py
from openai import OpenAI

class LLMService:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def generate_response(
        self,
        query: str,
        context: str,
        config: dict
    ) -> str:
        prompt = config.get('prompt', 'You are a helpful assistant.')
        prompt = prompt.replace('{context}', context)
        prompt = prompt.replace('{query}', query)

        # Web search if enabled
        if config.get('useWebSearch'):
            search_results = self.perform_web_search(
                query,
                config.get('webSearchApiKey')
            )
            prompt += f"\n\nWeb Search Results:\n{search_results}"

        response = self.client.chat.completions.create(
            model=config.get('model', 'gpt-4o-mini'),
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": query}
            ],
            temperature=config.get('temperature', 0.7)
        )

        return response.choices[0].message.content

    def perform_web_search(self, query: str, api_key: str) -> str:
        import requests

        response = requests.get(
            "https://serpapi.com/search",
            params={"q": query, "api_key": api_key}
        )

        results = response.json()
        snippets = []

        for result in results.get('organic_results', [])[:3]:
            snippets.append(result.get('snippet', ''))

        return "\n".join(snippets)
```

#### Workflow Engine

```python
# services/workflow_engine.py

class WorkflowEngine:
    def __init__(
        self,
        document_processor,
        embedding_service,
        vector_store,
        llm_service
    ):
        self.document_processor = document_processor
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.llm_service = llm_service

    async def execute(
        self,
        workflow_data: dict,
        query: str,
        stack_id: str
    ) -> dict:
        nodes = workflow_data['nodes']
        edges = workflow_data['edges']

        # Find components
        kb_node = self._find_node_by_type(nodes, 'knowledgeBase')
        llm_node = self._find_node_by_type(nodes, 'llmEngine')

        # Retrieve context
        context = ""
        if kb_node:
            context = await self._retrieve_context(stack_id, query)

        # Execute LLM
        if llm_node:
            response = self.llm_service.generate_response(
                query=query,
                context=context,
                config=llm_node['data']['config']
            )
        else:
            raise ValueError("LLM node not found")

        return {
            "response": response,
            "metadata": {
                "context_used": bool(context)
            }
        }

    async def _retrieve_context(self, stack_id: str, query: str) -> str:
        # Generate query embedding
        query_embedding = self.embedding_service.generate_embeddings([query])[0]

        # Query vector store
        results = self.vector_store.query(
            collection_name=f"stack_{stack_id}",
            query_embedding=query_embedding,
            n_results=3
        )

        # Concatenate results
        if results and results['documents']:
            return "\n".join(results['documents'][0])

        return ""

    def _find_node_by_type(self, nodes: list, node_type: str):
        for node in nodes:
            if node['type'] == node_type:
                return node
        return None
```

### API Endpoints

```python
# main.py
from fastapi import FastAPI, UploadFile, HTTPException
from services.workflow_engine import WorkflowEngine

app = FastAPI()

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile, stack_id: str):
    # Save file
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Process document
    text = document_processor.extract_text(file_path)
    chunks = document_processor.chunk_text(text)

    # Generate embeddings
    embeddings = embedding_service.generate_embeddings(chunks)

    # Store in vector DB
    vector_store.add_documents(
        collection_name=f"stack_{stack_id}",
        documents=chunks,
        embeddings=embeddings,
        metadatas=[{"chunk_index": i} for i in range(len(chunks))]
    )

    return {"success": True, "chunks": len(chunks)}

@app.post("/api/workflow/execute")
async def execute_workflow(request: ExecuteRequest):
    result = await workflow_engine.execute(
        workflow_data=request.workflow_data,
        query=request.query,
        stack_id=request.stack_id
    )
    return result
```

## Database Setup

The database is already configured via Supabase. To customize:

### Adding New Tables

```sql
CREATE TABLE custom_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access"
  ON custom_table FOR SELECT
  TO public
  USING (true);
```

### Migrations

Use Supabase migration tool or add to `supabase/migrations/`.

## Integration Guide

### Connecting Frontend to Backend

Update `src/components/ChatInterface.tsx`:

```typescript
async function executeWorkflow(query: string): Promise<string> {
  const response = await fetch('http://localhost:8000/api/workflow/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stack_id: stackId,
      query: query,
      workflow_data: workflow
    })
  });

  const data = await response.json();
  return data.response;
}
```

### File Upload Integration

```typescript
async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('stack_id', stackId);

  const response = await fetch('http://localhost:8000/api/documents/upload', {
    method: 'POST',
    body: formData
  });

  return await response.json();
}
```

## Testing

### Frontend Tests

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Create `src/components/__tests__/WorkflowNode.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { WorkflowNode } from '../WorkflowNode';

test('renders workflow node', () => {
  const data = {
    label: 'Test Node',
    description: 'Test description',
    type: 'userQuery'
  };

  render(<WorkflowNode data={data} />);
  expect(screen.getByText('Test Node')).toBeInTheDocument();
});
```

### Backend Tests

```python
# tests/test_workflow_engine.py
import pytest
from services.workflow_engine import WorkflowEngine

def test_workflow_execution():
    engine = WorkflowEngine(...)
    result = await engine.execute(
        workflow_data={...},
        query="Test query",
        stack_id="test-id"
    )
    assert result['response'] is not None
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy with Docker

```bash
docker-compose up -d
```

### Environment Variables Checklist

- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ⚠️ `OPENAI_API_KEY` (user provides)
- ⚠️ `SERPAPI_KEY` (user provides)

## Next Steps

1. Implement the FastAPI backend
2. Set up ChromaDB
3. Connect frontend to backend
4. Add authentication
5. Deploy to production

## Support

For questions:
- Documentation: See other .md files
- Issues: GitHub Issues
- Community: Discord/Slack
