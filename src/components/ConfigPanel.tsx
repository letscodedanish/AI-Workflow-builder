import { useState, useEffect } from 'react';
import { X, Upload, Eye, EyeOff } from 'lucide-react';
import { Node } from 'reactflow';
import {
  ComponentType,
  UserQueryConfig,
  KnowledgeBaseConfig,
  LLMEngineConfig,
  OutputConfig,
} from '../types/workflow';

type Props = {
  node: Node;
  onClose: () => void;
  onUpdate: (nodeId: string, config: any) => void;
};

export function ConfigPanel({ node, onClose, onUpdate }: Props) {
  const [config, setConfig] = useState(node.data.config || {});
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setConfig(node.data.config || {});
  }, [node]);

  function handleChange(field: string, value: any) {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onUpdate(node.id, newConfig);
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const uploadedFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36),
      name: file.name,
      size: file.size,
    }));

    handleChange('uploadedFiles', [...(config.uploadedFiles || []), ...uploadedFiles]);
  }

  function renderUserQueryConfig() {
    const cfg = config as UserQueryConfig;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Enter point for querys
          </label>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">User Query</label>
            <textarea
              value={cfg.query || ''}
              onChange={(e) => handleChange('query', e.target.value)}
              placeholder="Write your query here"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  }

  function renderKnowledgeBaseConfig() {
    const cfg = config as KnowledgeBaseConfig;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Let LLM search info in your file
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            File for Knowledge Base
          </label>
          <label className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <Upload size={16} />
            Upload File
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {cfg.uploadedFiles && cfg.uploadedFiles.length > 0 && (
            <div className="mt-2 space-y-1">
              {cfg.uploadedFiles.map((file) => (
                <div key={file.id} className="text-xs text-gray-600 px-2 py-1 bg-gray-50 rounded">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Embedding Model</label>
          <select
            value={cfg.embeddingModel || 'text-embedding-3-large'}
            onChange={(e) => handleChange('embeddingModel', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="text-embedding-3-large">text-embedding-3-large</option>
            <option value="text-embedding-3-small">text-embedding-3-small</option>
            <option value="text-embedding-ada-002">text-embedding-ada-002</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">API Key</label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={cfg.apiKey || ''}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderLLMEngineConfig() {
    const cfg = config as LLMEngineConfig;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Run a query with OpenAI LLM
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Model</label>
          <select
            value={cfg.model || 'gpt-4o-mini'}
            onChange={(e) => handleChange('model', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="gpt-4o-mini">GPT 4o- Mini</option>
            <option value="gpt-4o">GPT 4o</option>
            <option value="gpt-4-turbo">GPT 4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT 3.5 Turbo</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">API Key</label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={cfg.apiKey || ''}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Prompt</label>
          <textarea
            value={cfg.prompt || ''}
            onChange={(e) => handleChange('prompt', e.target.value)}
            placeholder="Enter system prompt"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use <span className="text-blue-600">CONTEXT: {'{context}'}</span> and{' '}
            <span className="text-blue-600">User Query: {'{query}'}</span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Temperature</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={cfg.temperature || 0.75}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 w-12">
              {(cfg.temperature || 0.75).toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">WebSearch Tool</span>
            <input
              type="checkbox"
              checked={cfg.useWebSearch || false}
              onChange={(e) => handleChange('useWebSearch', e.target.checked)}
              className="w-11 h-6 bg-gray-200 rounded-full relative appearance-none cursor-pointer checked:bg-green-600 transition-colors"
            />
          </label>
        </div>

        {cfg.useWebSearch && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">SERF API</label>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={cfg.webSearchApiKey || ''}
                onChange={(e) => handleChange('webSearchApiKey', e.target.value)}
                placeholder="Enter SerpAPI key"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>
    );
  }

  function renderOutputConfig() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Output of the result nodes as text
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Output Text</label>
          <p className="text-xs text-gray-500">Output will be generated based on query</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{node.data.label}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {node.type === 'userQuery' && renderUserQueryConfig()}
        {node.type === 'knowledgeBase' && renderKnowledgeBaseConfig()}
        {node.type === 'llmEngine' && renderLLMEngineConfig()}
        {node.type === 'output' && renderOutputConfig()}
      </div>
    </div>
  );
}
