"""
FastAPI Backend Reference Implementation
This is a reference implementation showing the structure needed for the backend.
This file is not executable in the current environment.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(title="GenAI Stack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WorkflowExecuteRequest(BaseModel):
    stack_id: str
    query: str
    workflow_data: dict

class WorkflowExecuteResponse(BaseModel):
    response: str
    metadata: dict

@app.get("/")
async def root():
    return {"message": "GenAI Stack API"}

@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    stack_id: str = None
):
    """
    Upload and process documents
    - Extract text using PyMuPDF
    - Generate embeddings using OpenAI
    - Store in ChromaDB
    """
    try:
        # Save file
        file_path = f"uploads/{file.filename}"

        # Extract text (implement with PyMuPDF)
        text_content = extract_text_from_pdf(file_path)

        # Generate embeddings
        embeddings = generate_embeddings(text_content)

        # Store in ChromaDB
        store_embeddings(stack_id, embeddings)

        return {
            "success": True,
            "filename": file.filename,
            "text_length": len(text_content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workflow/execute")
async def execute_workflow(request: WorkflowExecuteRequest):
    """
    Execute a workflow
    - Process user query
    - Retrieve context from knowledge base (if configured)
    - Send to LLM with context
    - Return response
    """
    try:
        workflow = request.workflow_data
        query = request.query

        # Find components
        kb_node = find_node_by_type(workflow['nodes'], 'knowledgeBase')
        llm_node = find_node_by_type(workflow['nodes'], 'llmEngine')

        context = ""

        # Retrieve context if knowledge base is configured
        if kb_node:
            context = retrieve_context(request.stack_id, query)

        # Execute LLM
        if llm_node:
            response = execute_llm(
                query=query,
                context=context,
                config=llm_node['data']['config']
            )
        else:
            raise HTTPException(status_code=400, detail="LLM node not found")

        return WorkflowExecuteResponse(
            response=response,
            metadata={"tokens": 0}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using PyMuPDF"""
    import fitz
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def generate_embeddings(text: str) -> List[float]:
    """Generate embeddings using OpenAI"""
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = client.embeddings.create(
        model="text-embedding-3-large",
        input=text
    )
    return response.data[0].embedding

def store_embeddings(stack_id: str, embeddings: List[float]):
    """Store embeddings in ChromaDB"""
    import chromadb
    client = chromadb.HttpClient(host="chromadb", port=8000)
    collection = client.get_or_create_collection(f"stack_{stack_id}")
    # Implementation here

def retrieve_context(stack_id: str, query: str) -> str:
    """Retrieve relevant context from ChromaDB"""
    import chromadb
    client = chromadb.HttpClient(host="chromadb", port=8000)
    collection = client.get_collection(f"stack_{stack_id}")

    # Generate query embedding
    query_embedding = generate_embeddings(query)

    # Query ChromaDB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    return "\n".join(results['documents'][0])

def execute_llm(query: str, context: str, config: dict) -> str:
    """Execute LLM query"""
    from openai import OpenAI
    client = OpenAI(api_key=config.get('apiKey'))

    prompt = config.get('prompt', 'You are a helpful assistant.')
    prompt = prompt.replace('{context}', context).replace('{query}', query)

    # Web search if enabled
    if config.get('useWebSearch'):
        search_results = perform_web_search(query, config.get('webSearchApiKey'))
        prompt += f"\n\nWeb Search Results:\n{search_results}"

    response = client.chat.completions.create(
        model=config.get('model', 'gpt-4o-mini'),
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": query}
        ],
        temperature=config.get('temperature', 0.75)
    )

    return response.choices[0].message.content

def perform_web_search(query: str, api_key: str) -> str:
    """Perform web search using SerpAPI"""
    import requests

    params = {
        "q": query,
        "api_key": api_key
    }

    response = requests.get("https://serpapi.com/search", params=params)
    results = response.json()

    # Extract relevant snippets
    snippets = []
    for result in results.get('organic_results', [])[:3]:
        snippets.append(result.get('snippet', ''))

    return "\n".join(snippets)

def find_node_by_type(nodes: List[dict], node_type: str) -> Optional[dict]:
    """Find a node by type"""
    for node in nodes:
        if node['type'] == node_type:
            return node
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
