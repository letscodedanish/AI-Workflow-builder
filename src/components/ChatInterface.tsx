import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { supabase, ChatMessage } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Node, Edge } from 'reactflow';

type Props = {
  stackId: string;
  workflow: { nodes: Node[]; edges: Edge[] };
  onClose: () => void;
};

export function ChatInterface({ stackId, workflow, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadChatHistory() {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('stack_id', stackId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Partial<ChatMessage> = {
      stack_id: stackId,
      session_id: sessionId,
      role: 'user',
      content: input.trim(),
      metadata: {},
    };

    setLoading(true);
    setInput('');

    try {
      const { data: savedMessage, error: saveError } = await supabase
        .from('chat_messages')
        .insert(userMessage)
        .select()
        .single();

      if (saveError) throw saveError;
      if (savedMessage) {
        setMessages((prev) => [...prev, savedMessage]);
      }

      const response = await executeWorkflow(input.trim());

      const assistantMessage: Partial<ChatMessage> = {
        stack_id: stackId,
        session_id: sessionId,
        role: 'assistant',
        content: response,
        metadata: {},
      };

      const { data: assistantSaved, error: assistantError } = await supabase
        .from('chat_messages')
        .insert(assistantMessage)
        .select()
        .single();

      if (assistantError) throw assistantError;
      if (assistantSaved) {
        setMessages((prev) => [...prev, assistantSaved]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Partial<ChatMessage> = {
        stack_id: stackId,
        session_id: sessionId,
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please check your API keys and configuration.',
        metadata: { error: true },
      };

      const { data: errorSaved } = await supabase
        .from('chat_messages')
        .insert(errorMessage)
        .select()
        .single();

      if (errorSaved) {
        setMessages((prev) => [...prev, errorSaved]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function executeWorkflow(query: string): Promise<string> {
    const userQueryNode = workflow.nodes.find((n) => n.type === 'userQuery');
    const knowledgeBaseNode = workflow.nodes.find((n) => n.type === 'knowledgeBase');
    const llmNode = workflow.nodes.find((n) => n.type === 'llmEngine');
    const outputNode = workflow.nodes.find((n) => n.type === 'output');

    if (!llmNode) {
      throw new Error('LLM Engine component is required');
    }

    let context = '';

    if (knowledgeBaseNode) {
      const kbConfig = knowledgeBaseNode.data.config;
      if (kbConfig.uploadedFiles && kbConfig.uploadedFiles.length > 0) {
        context = `[Context from ${kbConfig.uploadedFiles.length} document(s)]`;
      }
    }

    const llmConfig = llmNode.data.config;
    let prompt = llmConfig.prompt || 'You are a helpful assistant.';

    if (context) {
      prompt = prompt.replace('{context}', context);
    }
    prompt = prompt.replace('{query}', query);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return `This is a simulated response to: "${query}"\n\nTo enable real LLM responses, you would need to:\n1. Set up a backend API endpoint\n2. Configure your OpenAI API key\n3. Connect the workflow execution to the backend\n\nWorkflow configuration:\n- Model: ${llmConfig.model}\n- Temperature: ${llmConfig.temperature}\n- Web Search: ${llmConfig.useWebSearch ? 'Enabled' : 'Disabled'}\n${context ? `- Using context from knowledge base` : ''}`;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Chat With AI</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Start a conversation with your AI workflow</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2">
                <Loader size={16} className="animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
