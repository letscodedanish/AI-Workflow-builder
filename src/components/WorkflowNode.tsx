import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MessageSquare, Database, Sparkles, MonitorCheck, Settings } from 'lucide-react';
import { ComponentType } from '../types/workflow';

const ICON_MAP = {
  MessageSquare,
  Database,
  Sparkles,
  MonitorCheck,
};

export const WorkflowNode = memo(({ data, selected }: NodeProps) => {
  const Icon = ICON_MAP[data.icon as keyof typeof ICON_MAP] || MessageSquare;
  const componentType = data.type as ComponentType;

  const handleStyles = 'w-3 h-3 !bg-white !border-2 !border-gray-400';
  const inputHandles = data.handles?.inputs || [];
  const outputHandles = data.handles?.outputs || [];

  return (
    <div
      className={`bg-white rounded-lg border-2 ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      } min-w-[280px] transition-all`}
    >
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} style={{ color: data.color }} />
          <span className="font-medium text-gray-900 text-sm">{data.label}</span>
        </div>
        <Settings size={16} className="text-gray-400" />
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-600">{data.description}</p>
      </div>

      {inputHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          type="target"
          position={Position.Left}
          id={handle.id}
          className={handleStyles}
          style={{ top: `${40 + index * 30}px` }}
        />
      ))}

      {outputHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Right}
          id={handle.id}
          className={handleStyles}
          style={{ top: `${40 + index * 30}px` }}
        />
      ))}
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';
