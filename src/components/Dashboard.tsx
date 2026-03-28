// src/components/Dashboard.tsx
import { useQuery, useMutation } from "convex/react";
import { useLocation } from "wouter";
import { api } from "../../convex/_generated/api";
import { Plus, FileText } from "lucide-react";
import { ScriptCard } from "./ScriptCard";

export function Dashboard() {
  const scripts = useQuery(api.scripts.listScripts);
  const createScript = useMutation(api.scripts.createScript);
  const deleteScript = useMutation(api.scripts.deleteScript);
  const [, setLocation] = useLocation();

  const handleNewScript = async () => {
    const id = await createScript({ title: "Novo Roteiro" });
    setLocation(`/editor/${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteScript({ id: id as any });
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-100">
            Roteiro Supremo
          </h1>
          <button
            type="button"
            onClick={handleNewScript}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-lime-500 text-zinc-950 rounded-lg hover:bg-lime-400 transition-colors"
          >
            <Plus size={16} />
            <span>Novo Roteiro</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {scripts === undefined ? (
          <div className="text-center text-zinc-500 py-16">Carregando...</div>
        ) : scripts.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <FileText className="mx-auto text-zinc-700" size={48} />
            <p className="text-zinc-500">Nenhum roteiro ainda</p>
            <button
              type="button"
              onClick={handleNewScript}
              className="px-4 py-2 bg-lime-500 text-zinc-950 font-semibold rounded-lg hover:bg-lime-400 transition-colors"
            >
              Criar primeiro roteiro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map((script) => (
              <ScriptCard
                key={script._id}
                script={script}
                onClick={() => setLocation(`/editor/${script._id}`)}
                onDelete={() => handleDelete(script._id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
