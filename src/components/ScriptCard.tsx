// src/components/ScriptCard.tsx
import { Trash2 } from "lucide-react";

interface ScriptCardProps {
  script: {
    _id: string;
    title: string;
    updatedAt?: number;
  };
  onClick: () => void;
  onDelete: () => void;
}

export function ScriptCard({ script, onClick, onDelete }: ScriptCardProps) {
  const timeAgo = script.updatedAt ? getTimeAgo(script.updatedAt) : "";

  return (
    <div
      onClick={onClick}
      className="group relative p-4 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-lime-500/30 hover:bg-zinc-900/80 transition-all"
    >
      <h3 className="font-medium text-zinc-100 truncate">{script.title}</h3>
      <p className="mt-1 text-xs text-zinc-500">{timeAgo}</p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-3 right-3 p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-500/10"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "agora mesmo";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min atras`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atras`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atras`;
  return new Date(timestamp).toLocaleDateString("pt-BR");
}
