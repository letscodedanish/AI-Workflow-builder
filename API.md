# API Documentation

This document describes the API endpoints for the GenAI Stack backend service.

## Base URL

```
Development: http://localhost:8000
Production: https://api.genaistack.com
```

## Authentication

All API requests require authentication using a Bearer token:

```
Authorization: Bearer <token>
```

For public demo, authentication is optional.

## Endpoints

### Workflow Management

#### List All Stacks

```http
GET /api/stacks
```

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "My Workflow",
      "description": "A sample workflow",
      "workflow_data": {
        "nodes": [],
        "edges": []
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Stack Details

```http
GET /api/stacks/:id
```

**Parameters**
- `id` (string, required): Stack UUID

**Response**
```json
{
  "id": "uuid",
  "name": "My Workflow",
  "description": "A sample workflow",
  "workflow_data": {
    "nodes": [...],
    "edges": [...]
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Create Stack

```http
POST /api/stacks
```

**Request Body**
```json
{
  "name": "New Workflow",
  "description": "Description here",
  "workflow_data": {
    "nodes": [],
    "edges": []
  }
}
```

**Response**
```json
{
  "id": "uuid",
  "name": "New Workflow",
  "description": "Description here",
  "workflow_data": {...},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Update Stack

```http
PUT /api/stacks/:id
```

**Parameters**
- `id` (string, required): Stack UUID

**Request Body**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "workflow_data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response**
```json
{
  "id": "uuid",
  "name": "Updated Name",
  ...
}
```

#### Delete Stack

```http
DELETE /api/stacks/:id
```

**Parameters**
- `id` (string, required): Stack UUID

**Response**
```json
{
  "success": true,
  "message": "Stack deleted"
}
```

### Document Management

#### Upload Document

```http
POST /api/documents/upload
Content-Type: multipart/form-data
```

**Request Body**
- `file` (file, required): Document file (PDF, TXT, DOC)
- `stack_id` (string, required): Stack UUID
- `embedding_model` (string, optional): Embedding model to use

**Response**
```json
{
  "id": "uuid",
  "filename": "document.pdf",
  "file_size": 1024000,
  "text_length": 5000,
  "chunks_created": 10,
  "embeddings_generated": true
}
```

#### Get Document

```http
GET /api/documents/:id
```

**Parameters**
- `id` (string, required): Document UUID

**Response**
```json
{
  "id": "uuid",
  "stack_id": "uuid",
  "filename": "document.pdf",
  "file_path": "/uploads/...",
  "file_size": 1024000,
  "mime_type": "application/pdf",
  "text_content": "Extracted text...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### List Documents for Stack

```http
GET /api/stacks/:id/documents
```

**Parameters**
- `id` (string, required): Stack UUID

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "filename": "document.pdf",
      "file_size": 1024000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Delete Document

```http
DELETE /api/documents/:id
```

**Parameters**
- `id` (string, required): Document UUID

**Response**
```json
{
  "success": true,
  "message": "Document deleted"
}
```

### Workflow Execution

#### Execute Workflow

```http
POST /api/workflow/execute
```

**Request Body**
```json
{
  "stack_id": "uuid",
  "session_id": "uuid",
  "query": "What is the capital of France?",
  "workflow_data": {
    "nodes": [
      {
        "id": "node-1",
        "type": "userQuery",
        "data": {
          "config": {...}
        }
      },
      {
        "id": "node-2",
        "type": "llmEngine",
        "data": {
          "config": {
            "model": "gpt-4o-mini",
            "apiKey": "sk-...",
            "prompt": "You are a helpful assistant",
            "temperature": 0.7,
            "useWebSearch": false
          }
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node-1",
        "target": "node-2"
      }
    ]
  }
}
```

**Response**
```json
{
  "response": "The capital of France is Paris.",
  "metadata": {
    "tokens_used": 150,
    "model": "gpt-4o-mini",
    "execution_time_ms": 1500,
    "context_retrieved": false
  },
  "execution_logs": [
    {
      "component": "userQuery",
      "status": "success",
      "duration_ms": 5
    },
    {
      "component": "llmEngine",
      "status": "success",
      "duration_ms": 1495
    }
  ]
}
```

#### Validate Workflow

```http
POST /api/workflow/validate
```

**Request Body**
```json
{
  "workflow_data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Knowledge Base component not configured"
  ]
}
```

### Chat Management

#### Get Chat History

```http
GET /api/chat/history/:stackId
```

**Parameters**
- `stackId` (string, required): Stack UUID

**Query Parameters**
- `session_id` (string, optional): Filter by session
- `limit` (integer, optional): Max messages to return (default: 50)

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "role": "user",
      "content": "What is AI?",
      "metadata": {},
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "AI stands for...",
      "metadata": {
        "tokens": 150
      },
      "created_at": "2024-01-01T00:00:01Z"
    }
  ]
}
```

#### Send Message

```http
POST /api/chat/message
```

**Request Body**
```json
{
  "stack_id": "uuid",
  "session_id": "uuid",
  "message": "What is machine learning?"
}
```

**Response**
```json
{
  "id": "uuid",
  "response": "Machine learning is...",
  "metadata": {
    "tokens_used": 200,
    "execution_time_ms": 2000
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Clear Chat Session

```http
DELETE /api/chat/session/:sessionId
```

**Parameters**
- `sessionId` (string, required): Session UUID

**Response**
```json
{
  "success": true,
  "message": "Session cleared",
  "messages_deleted": 10
}
```

### Embeddings

#### Generate Embeddings

```http
POST /api/embeddings/generate
```

**Request Body**
```json
{
  "document_id": "uuid",
  "model": "text-embedding-3-large",
  "api_key": "sk-..."
}
```

**Response**
```json
{
  "success": true,
  "chunks_processed": 10,
  "embeddings_stored": 10
}
```

#### Search Embeddings

```http
POST /api/embeddings/search
```

**Request Body**
```json
{
  "stack_id": "uuid",
  "query": "What is the return policy?",
  "top_k": 3
}
```

**Response**
```json
{
  "results": [
    {
      "chunk_text": "Our return policy allows...",
      "similarity": 0.89,
      "document_id": "uuid",
      "metadata": {}
    }
  ]
}
```

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "workflow_data.nodes",
      "reason": "At least one node is required"
    }
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INVALID_API_KEY` - Invalid OpenAI/SerpAPI key
- `QUOTA_EXCEEDED` - API quota exceeded
- `WORKFLOW_INVALID` - Invalid workflow configuration
- `EXECUTION_FAILED` - Workflow execution failed

## Rate Limiting

API requests are rate limited:

- **Free tier**: 100 requests/hour
- **Pro tier**: 1000 requests/hour
- **Enterprise**: Custom limits

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## Webhooks

Subscribe to workflow events:

```http
POST /api/webhooks
```

**Request Body**
```json
{
  "url": "https://your-server.com/webhook",
  "events": ["workflow.completed", "workflow.failed"],
  "secret": "your-secret"
}
```

**Webhook Payload**
```json
{
  "event": "workflow.completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "stack_id": "uuid",
    "session_id": "uuid",
    "execution_time_ms": 2000,
    "result": "..."
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { GenAIStackClient } from '@genaistack/sdk';

const client = new GenAIStackClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.genaistack.com'
});

// Create a stack
const stack = await client.stacks.create({
  name: 'My Workflow',
  description: 'A sample workflow'
});

// Execute workflow
const result = await client.workflows.execute({
  stackId: stack.id,
  query: 'What is AI?'
});

console.log(result.response);
```

### Python

```python
from genaistack import Client

client = Client(api_key='your-api-key')

# Create a stack
stack = client.stacks.create(
    name='My Workflow',
    description='A sample workflow'
)

# Execute workflow
result = client.workflows.execute(
    stack_id=stack.id,
    query='What is AI?'
)

print(result.response)
```

### cURL

```bash
# Create a stack
curl -X POST https://api.genaistack.com/api/stacks \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Workflow",
    "description": "A sample workflow"
  }'

# Execute workflow
curl -X POST https://api.genaistack.com/api/workflow/execute \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "stack_id": "uuid",
    "query": "What is AI?",
    "workflow_data": {...}
  }'
```

## Best Practices

1. **API Keys**: Never expose API keys in client-side code
2. **Rate Limiting**: Implement exponential backoff for retries
3. **Error Handling**: Always handle errors gracefully
4. **Caching**: Cache responses when appropriate
5. **Timeouts**: Set reasonable timeout values
6. **Validation**: Validate input before sending requests
7. **Monitoring**: Track API usage and costs

## Support

For API support:
- Documentation: https://docs.genaistack.com
- Email: api-support@genaistack.com
- Discord: https://discord.gg/genaistack
