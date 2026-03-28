// src/components/EditorTopBar.tsx
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { BlockNoteEditor } from "@blocknote/core";

interface EditorTopBarProps {
  scriptId: Id<"scripts">;
  editor: BlockNoteEditor<any, any, any>;
}

export function EditorTopBar({ scriptId, editor }: EditorTopBarProps) {
  const [, setLocation] = useLocation();
  const script = useQuery(api.scripts.getScript, { id: scriptId });
  const updateTitle = useMutation(api.scripts.updateScriptTitle);

  const [title, setTitle] = useState("");
  const titleTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Sync title from server
  useEffect(() => {
    if (script?.title) {
      setTitle(script.title);
    }
  }, [script?.title]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    clearTimeout(titleTimeout.current);
    titleTimeout.current = setTimeout(() => {
      updateTitle({ id: scriptId, title: newTitle });
    }, 500);
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setLocation("/")}
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>Roteiros</span>
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Sem titulo"
          className="flex-1 bg-transparent text-zinc-100 font-medium text-base outline-none placeholder-zinc-600 border-none"
        />

        <button
          type="button"
          onClick={() => {
            // Full document analysis — implemented in Chunk 3
            console.log("Analisar com IA clicked");
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-lime-400 border border-lime-500/30 rounded-lg hover:bg-lime-500/10 transition-colors"
        >
          <Sparkles size={14} />
          <span>Analisar com IA</span>
        </button>
      </div>
    </header>
  );
}
