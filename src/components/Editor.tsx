// src/components/Editor.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useBlockNoteSync } from "@convex-dev/prosemirror-sync/blocknote";
import { useAuthToken } from "@convex-dev/auth/react";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { BlockNoteEditor } from "@blocknote/core";
import { en as coreDict } from "@blocknote/core/locales";
import { AIExtension, AIMenu, ClientSideTransport } from "@blocknote/xl-ai";
import { pt as aiDictionaryPt } from "@blocknote/xl-ai/locales";
import { AnimatePresence } from "motion/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { schema } from "../blocks/schema";
import { SCRIPT_TEMPLATE } from "../blocks/template";
import { EditorTopBar } from "./EditorTopBar";
import { AIAnalysisPanel } from "./AIAnalysisPanel";
import { Loader2 } from "lucide-react";

interface EditorProps {
  scriptId: Id<"scripts">;
}

export function Editor({ scriptId }: EditorProps) {
  const token = useAuthToken();

  const convexSiteUrl = (import.meta.env.VITE_CONVEX_URL as string).replace(
    ".cloud",
    ".site",
  );

  const aiModel = useMemo(
    () =>
      createOpenAICompatible({
        name: "convex-gemini",
        baseURL: `${convexSiteUrl}/api/ai/blocknote`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })("gemini-3-flash-preview"),
    [convexSiteUrl, token], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const aiExtension = useMemo(
    () =>
      AIExtension({
        transport: new ClientSideTransport({ model: aiModel }),
      }),
    [aiModel],
  );

  const sync = useBlockNoteSync<BlockNoteEditor>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api as any).prosemirrorSync,
    scriptId as string,
    { editorOptions: { schema, extensions: [aiExtension], dictionary: { ...coreDict, ai: aiDictionaryPt } as any } },
  );

  const [analysis, setAnalysis] = useState<any>(null);

  // Handle template initialization for new documents
  const handleCreate = useCallback(() => {
    if (!("create" in sync) || !sync.create) return;
    const tempEditor = BlockNoteEditor.create({ schema });
    tempEditor.replaceBlocks(tempEditor.document, SCRIPT_TEMPLATE);
    // Extract ProseMirror doc JSON from the internal tiptap editor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pmDoc = (tempEditor as any)._tiptapEditor.state.doc.toJSON();
    sync.create(pmDoc);
  }, [sync]);

  // Apply collapse CSS when editor blocks change
  useEffect(() => {
    if (!sync.editor) return;

    const applyCollapse = () => {
      // Use schema-aware typing via our custom editor
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blocks = sync.editor!.document as any[];
      const collapsedModules = new Set<string>();

      for (const block of blocks) {
        if (
          block.type === "moduleHeader" &&
          block.props?.collapsed === true
        ) {
          collapsedModules.add(block.props.moduleId as string);
        }
      }

      // Toggle visibility of field blocks via CSS classes
      const editorEl = document.querySelector(".bn-editor");
      if (!editorEl) return;

      for (const moduleId of ["0", "1", "2-3", "4", "5-6"]) {
        const fields = editorEl.querySelectorAll(
          `.module-field-${CSS.escape(moduleId)}`,
        );
        fields.forEach((el) => {
          const parent = el.closest("[data-node-type]") ?? el.parentElement;
          if (parent instanceof HTMLElement) {
            parent.style.display = collapsedModules.has(moduleId)
              ? "none"
              : "";
          }
        });
      }
    };

    // onChange returns an Unsubscribe function
    const unsubscribe = sync.editor.onChange(applyCollapse);
    applyCollapse();

    return unsubscribe;
  }, [sync.editor]);

  if (sync.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <Loader2 className="animate-spin text-lime-400" size={32} />
      </div>
    );
  }

  if (!sync.editor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 gap-4">
        <p className="text-zinc-400">Documento nao encontrado.</p>
        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 bg-lime-500 text-zinc-950 font-semibold rounded-lg hover:bg-lime-400 transition-colors"
        >
          Criar roteiro
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <EditorTopBar
        scriptId={scriptId}
        editor={sync.editor}
        onAnalysisComplete={setAnalysis}
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <BlockNoteView editor={sync.editor} theme="dark">
          <AIMenu />
        </BlockNoteView>
      </div>
      <AnimatePresence>
        {analysis && (
          <AIAnalysisPanel
            analysis={analysis}
            onClose={() => setAnalysis(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
