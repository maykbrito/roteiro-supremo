// src/components/EditorTopBar.tsx
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import type { BlockNoteEditor } from "@blocknote/core";

interface EditorTopBarProps {
  scriptId: Id<"scripts">;
  editor: BlockNoteEditor<any, any, any>;
  onAnalysisComplete: (analysis: any) => void;
}

export function EditorTopBar({
  scriptId,
  editor,
  onAnalysisComplete,
}: EditorTopBarProps) {
  const [, setLocation] = useLocation();
  const script = useQuery(api.scripts.getScript, { id: scriptId });
  const updateTitle = useMutation(api.scripts.updateScriptTitle);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analyzeAction = useAction((api as any).ai.analyzeScript);

  const [title, setTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const titleTimeout = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocused = useRef(false);

  // Sync title from server only when user is NOT editing
  useEffect(() => {
    if (script?.title != null && !isFocused.current) {
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

  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      // Serialize document to text
      const blocks = editor.document;
      let content = "";
      for (const block of blocks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blockProps = (block as any).props as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blockType = (block as any).type as string;
        if (blockType === "moduleHeader") {
          content += `\n## Modulo ${blockProps.moduleNumber}: ${blockProps.moduleTitle}\n`;
        } else if (blockType === "scriptField") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const text = (((block as any).content as any[]) ?? [])
            .map((c: any) => c.text ?? "")
            .join("");
          content += `**${blockProps.label}:** ${text || "(vazio)"}\n`;
        }
      }
      const result = await analyzeAction({ scriptContent: content });
      onAnalysisComplete(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setLocation("/")}
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>Roteiros</span>
        </button>

        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onFocus={() => {
            isFocused.current = true;
          }}
          onBlur={() => {
            isFocused.current = false;
            // Sync server value on blur in case it changed
            if (script?.title != null) setTitle(script.title);
          }}
          placeholder="Sem titulo"
          className="flex-1 bg-transparent text-zinc-100 font-medium text-base outline-none placeholder-zinc-600 border-none"
        />

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-lime-400 border border-lime-500/30 rounded-lg hover:bg-lime-500/10 transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          <span>{isAnalyzing ? "Analisando..." : "Analisar com IA"}</span>
        </button>
      </div>
    </header>
  );
}
