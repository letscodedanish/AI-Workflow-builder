/*
  # GenAI Stack Application Schema

  ## Overview
  This migration creates the complete database schema for the GenAI Stack no-code workflow builder application.

  ## New Tables

  ### 1. stacks
  Stores workflow/stack definitions created by users
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Stack name
  - `description` (text) - Stack description
  - `workflow_data` (jsonb) - Complete workflow definition (nodes, edges, configurations)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. documents
  Stores uploaded documents and their metadata
  - `id` (uuid, primary key) - Unique identifier
  - `stack_id` (uuid, foreign key) - Reference to parent stack
  - `filename` (text) - Original filename
  - `file_path` (text) - Storage path
  - `file_size` (bigint) - File size in bytes
  - `mime_type` (text) - File MIME type
  - `text_content` (text) - Extracted text content
  - `created_at` (timestamptz) - Upload timestamp

  ### 3. embeddings
  Stores document embeddings for vector search
  - `id` (uuid, primary key) - Unique identifier
  - `document_id` (uuid, foreign key) - Reference to source document
  - `chunk_text` (text) - Text chunk that was embedded
  - `chunk_index` (integer) - Position of chunk in document
  - `embedding_model` (text) - Model used for embedding
  - `metadata` (jsonb) - Additional metadata
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. chat_messages
  Stores chat history for each stack
  - `id` (uuid, primary key) - Unique identifier
  - `stack_id` (uuid, foreign key) - Reference to stack
  - `session_id` (uuid) - Chat session identifier
  - `role` (text) - Message role (user/assistant/system)
  - `content` (text) - Message content
  - `metadata` (jsonb) - Additional data (tokens used, model, etc.)
  - `created_at` (timestamptz) - Message timestamp

  ### 5. execution_logs
  Logs workflow execution details
  - `id` (uuid, primary key) - Unique identifier
  - `stack_id` (uuid, foreign key) - Reference to stack
  - `session_id` (uuid) - Execution session
  - `component_type` (text) - Component that was executed
  - `input_data` (jsonb) - Input to component
  - `output_data` (jsonb) - Output from component
  - `status` (text) - Execution status (success/error)
  - `error_message` (text) - Error details if failed
  - `duration_ms` (integer) - Execution time in milliseconds
  - `created_at` (timestamptz) - Execution timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Public access policies for this demo application
  - In production, should be restricted to authenticated users

  ## Notes
  - All tables use UUID primary keys
  - Timestamps use timestamptz for timezone awareness
  - JSONB used for flexible schema storage
  - Foreign keys ensure referential integrity
*/

-- Create stacks table
CREATE TABLE IF NOT EXISTS stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  workflow_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id uuid REFERENCES stacks(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_size bigint DEFAULT 0,
  mime_type text DEFAULT 'application/pdf',
  text_content text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  chunk_text text NOT NULL,
  chunk_index integer DEFAULT 0,
  embedding_model text DEFAULT 'text-embedding-3-large',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id uuid REFERENCES stacks(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create execution_logs table
CREATE TABLE IF NOT EXISTS execution_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id uuid REFERENCES stacks(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  component_type text NOT NULL,
  input_data jsonb DEFAULT '{}'::jsonb,
  output_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'success' CHECK (status IN ('success', 'error')),
  error_message text,
  duration_ms integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_stack_id ON documents(stack_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_document_id ON embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_stack_id ON chat_messages(stack_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_stack_id ON execution_logs(stack_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_session_id ON execution_logs(session_id);

-- Enable Row Level Security
ALTER TABLE stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo purposes)
-- In production, these should be restricted to authenticated users

CREATE POLICY "Allow public read access to stacks"
  ON stacks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to stacks"
  ON stacks FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to stacks"
  ON stacks FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from stacks"
  ON stacks FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to documents"
  ON documents FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to documents"
  ON documents FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete from documents"
  ON documents FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to embeddings"
  ON embeddings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to embeddings"
  ON embeddings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete from embeddings"
  ON embeddings FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to chat_messages"
  ON chat_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to chat_messages"
  ON chat_messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete from chat_messages"
  ON chat_messages FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to execution_logs"
  ON execution_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to execution_logs"
  ON execution_logs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete from execution_logs"
  ON execution_logs FOR DELETE
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stacks table
DROP TRIGGER IF EXISTS update_stacks_updated_at ON stacks;
CREATE TRIGGER update_stacks_updated_at
  BEFORE UPDATE ON stacks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();