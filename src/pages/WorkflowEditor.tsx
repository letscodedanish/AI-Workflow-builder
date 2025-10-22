import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase, Stack } from '../lib/supabase';
import { WorkflowNode } from '../components/WorkflowNode';
import { ComponentLibrary } from '../components/ComponentLibrary';
import { ConfigPanel } from '../components/ConfigPanel';
import { ChatInterface } from '../components/ChatInterface';
import { Save, Play, MessageSquare } from 'lucide-react';

const nodeTypes = {
  userQuery: WorkflowNode,
  knowledgeBase: WorkflowNode,
  llmEngine: WorkflowNode,
  output: WorkflowNode,
};

export function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [stack, setStack] = useState<Stack | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadStack();
    }
  }, [id]);

  async function loadStack() {
    try {
      const { data, error } = await supabase
        .from('stacks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setStack(data);
        if (data.workflow_data?.nodes) {
          setNodes(data.workflow_data.nodes);
        }
        if (data.workflow_data?.edges) {
          setEdges(data.workflow_data.edges);
        }
      }
    } catch (error) {
      console.error('Error loading stack:', error);
      navigate('/');
    }
  }

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  async function saveWorkflow() {
    if (!id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('stacks')
        .update({
          workflow_data: { nodes, edges },
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setSaving(false);
    }
  }

  const updateNodeConfig = useCallback(
    (nodeId: string, config: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, config } }
            : node
        )
      );
    },
    [setNodes]
  );

  function validateWorkflow(): boolean {
    const hasUserQuery = nodes.some((n) => n.type === 'userQuery');
    const hasLLM = nodes.some((n) => n.type === 'llmEngine');
    const hasOutput = nodes.some((n) => n.type === 'output');

    return hasUserQuery && hasLLM && hasOutput && edges.length > 0;
  }

  function buildStack() {
    if (!validateWorkflow()) {
      alert('Invalid workflow! Ensure you have: User Query → LLM Engine → Output');
      return;
    }

    saveWorkflow();
    setShowChat(true);
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold"
          >
            G
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {stack?.name || 'GenAI Stack'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveWorkflow}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={buildStack}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Play size={18} />
            Build Stack
          </button>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
            S
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <ComponentLibrary nodes={nodes} setNodes={setNodes} />

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
            <MiniMap />
          </ReactFlow>

          {showChat && (
            <button
              onClick={() => setShowChat(true)}
              className="absolute bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors"
            >
              <MessageSquare size={24} />
            </button>
          )}
        </div>

        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={updateNodeConfig}
          />
        )}
      </div>

      {showChat && (
        <ChatInterface
          stackId={id || ''}
          workflow={{ nodes, edges }}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
