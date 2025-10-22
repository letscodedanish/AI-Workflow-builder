import { MessageSquare, Database, Sparkles, MonitorCheck, GripVertical } from 'lucide-react';
import { COMPONENT_DEFINITIONS, ComponentType } from '../types/workflow';
import { Node } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
};

const ICON_MAP = {
  MessageSquare,
  Database,
  Sparkles,
  MonitorCheck,
};

export function ComponentLibrary({ nodes, setNodes }: Props) {
  function addComponent(type: ComponentType) {
    const definition = COMPONENT_DEFINITIONS[type];
    const existingCount = nodes.filter((n) => n.type === type).length;

    const newNode: Node = {
      id: `${type}-${uuidv4()}`,
      type,
      position: { x: 250 + existingCount * 50, y: 100 + existingCount * 50 },
      data: {
        label: definition.label,
        description: definition.description,
        icon: definition.icon,
        color: definition.color,
        type: definition.type,
        handles: definition.handles,
        config: getDefaultConfig(type),
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }

  function getDefaultConfig(type: ComponentType): any {
    switch (type) {
      case 'userQuery':
        return { query: '' };
      case 'knowledgeBase':
        return {
          embeddingModel: 'text-embedding-3-large',
          apiKey: '',
          uploadedFiles: [],
        };
      case 'llmEngine':
        return {
          model: 'gpt-4o-mini',
          apiKey: '',
          prompt: 'You are a helpful PDF assistant. Use web search if the PDF lacks context',
          temperature: 0.75,
          useWebSearch: true,
          webSearchTool: 'serpapi',
          webSearchApiKey: '',
        };
      case 'output':
        return { displayMode: 'text' };
      default:
        return {};
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Chat With AI</h2>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2">
          <MessageSquare size={16} />
          Open Chat
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Components
        </h3>
        <div className="space-y-2">
          {Object.values(COMPONENT_DEFINITIONS).map((component) => {
            const Icon = ICON_MAP[component.icon as keyof typeof ICON_MAP];
            return (
              <button
                key={component.type}
                onClick={() => addComponent(component.type)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors group"
              >
                <Icon size={18} style={{ color: component.color }} />
                <span className="flex-1 text-left font-medium">{component.label}</span>
                <GripVertical size={16} className="text-gray-400 opacity-0 group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
