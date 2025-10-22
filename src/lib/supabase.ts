import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Stack = {
  id: string;
  name: string;
  description: string;
  workflow_data: WorkflowData;
  created_at: string;
  updated_at: string;
};

export type WorkflowData = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type WorkflowNode = {
  id: string;
  type: 'userQuery' | 'knowledgeBase' | 'llmEngine' | 'output';
  position: { x: number; y: number };
  data: NodeData;
};

export type NodeData = {
  label: string;
  config: Record<string, any>;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
};

export type ChatMessage = {
  id: string;
  stack_id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
};

export type Document = {
  id: string;
  stack_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  text_content: string;
  created_at: string;
};
