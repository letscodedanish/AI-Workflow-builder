import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ExternalLink } from 'lucide-react';
import { supabase, Stack } from '../lib/supabase';

export function StacksPage() {
  const navigate = useNavigate();
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStacks();
  }, []);

  async function loadStacks() {
    try {
      const { data, error } = await supabase
        .from('stacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStacks(data || []);
    } catch (error) {
      console.error('Error loading stacks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createNewStack() {
    try {
      const { data, error } = await supabase
        .from('stacks')
        .insert({
          name: 'Untitled Stack',
          description: 'A new workflow stack',
          workflow_data: { nodes: [], edges: [] },
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        navigate(`/stack/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating stack:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              G
            </div>
            <h1 className="text-xl font-semibold text-gray-900">GenAI Stack</h1>
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
            S
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Stacks</h2>
          <button
            onClick={createNewStack}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Plus size={20} />
            New Stack
          </button>
        </div>

        {stacks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No stacks yet</h3>
            <p className="text-gray-500 mb-6">Create your first workflow stack to get started</p>
            <button
              onClick={createNewStack}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Create Stack
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stacks.map((stack) => (
              <div
                key={stack.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{stack.name}</h3>
                <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                  {stack.description || 'No description'}
                </p>
                <button
                  onClick={() => navigate(`/stack/${stack.id}`)}
                  className="flex items-center gap-2 text-sm text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full justify-center"
                >
                  Edit Stack
                  <ExternalLink size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
