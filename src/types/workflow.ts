export type ComponentType = 'userQuery' | 'knowledgeBase' | 'llmEngine' | 'output';

export type UserQueryConfig = {
  query: string;
};

export type KnowledgeBaseConfig = {
  embeddingModel: string;
  apiKey: string;
  uploadedFiles: Array<{
    id: string;
    name: string;
    size: number;
  }>;
};

export type LLMEngineConfig = {
  model: string;
  apiKey: string;
  prompt: string;
  temperature: number;
  useWebSearch: boolean;
  webSearchTool: 'serpapi' | 'brave';
  webSearchApiKey: string;
};

export type OutputConfig = {
  displayMode: 'text' | 'json';
};

export type ComponentConfig = UserQueryConfig | KnowledgeBaseConfig | LLMEngineConfig | OutputConfig;

export type ComponentDefinition = {
  type: ComponentType;
  label: string;
  icon: string;
  description: string;
  color: string;
  handles: {
    inputs: Array<{ id: string; label: string }>;
    outputs: Array<{ id: string; label: string }>;
  };
};

export const COMPONENT_DEFINITIONS: Record<ComponentType, ComponentDefinition> = {
  userQuery: {
    type: 'userQuery',
    label: 'User Query',
    icon: 'MessageSquare',
    description: 'Entry point for user queries',
    color: '#3b82f6',
    handles: {
      inputs: [],
      outputs: [{ id: 'query', label: 'Query' }],
    },
  },
  knowledgeBase: {
    type: 'knowledgeBase',
    label: 'Knowledge Base',
    icon: 'Database',
    description: 'Let LLM search info in your file',
    color: '#8b5cf6',
    handles: {
      inputs: [{ id: 'query', label: 'Query' }],
      outputs: [{ id: 'context', label: 'Context' }],
    },
  },
  llmEngine: {
    type: 'llmEngine',
    label: 'LLM (OpenAI)',
    icon: 'Sparkles',
    description: 'Run a query with OpenAI LLM',
    color: '#10b981',
    handles: {
      inputs: [
        { id: 'query', label: 'Query' },
        { id: 'context', label: 'Context' },
      ],
      outputs: [{ id: 'output', label: 'Output' }],
    },
  },
  output: {
    type: 'output',
    label: 'Output',
    icon: 'MonitorCheck',
    description: 'Output of the result nodes as text',
    color: '#f59e0b',
    handles: {
      inputs: [{ id: 'output', label: 'Output' }],
      outputs: [],
    },
  },
};
