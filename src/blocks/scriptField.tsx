// src/blocks/scriptField.tsx
import { createReactBlockSpec } from "@blocknote/react";
import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import type { InlineContent } from "@blocknote/core";

type SuggestionState = {
  status: "idle" | "loading" | "reviewing";
  originalContent: InlineContent[];
};

export const scriptField = createReactBlockSpec(
  {
    type: "scriptField",
    propSchema: {
      label: { default: "" },
      placeholder: { default: "" },
      moduleId: { default: "0" },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const { label, placeholder, moduleId } = props.block.props;
      const [suggestion, setSuggestion] = useState<SuggestionState>({
        status: "idle",
        originalContent: [],
      });
      const suggestAction = useAction(api.ai.suggestFieldContent);

      const handleSuggest = useCallback(async () => {
        if (suggestion.status === "loading") return;

        // Save current content
        const currentContent = props.block.content as InlineContent[];
        setSuggestion({
          status: "loading",
          originalContent: [...currentContent],
        });

        try {
          // Gather context from all blocks in the editor
          const allBlocks = props.editor.document;
          let scriptTitle = "";
          let moduleTitle = "";
          const otherFields: { label: string; content: string }[] = [];

          for (const block of allBlocks) {
            const blockProps = block.props as Record<string, unknown>;
            if (block.type === "moduleHeader" && blockProps.moduleId === moduleId) {
              moduleTitle = blockProps.moduleTitle as string;
            }
            if (block.type === "scriptField" && block.id !== props.block.id) {
              const content = (block.content as InlineContent[])
                .map((c: any) => c.text ?? "")
                .join("");
              if (content.trim()) {
                otherFields.push({
                  label: blockProps.label as string,
                  content,
                });
              }
            }
            // Extract title
            if (
              block.type === "scriptField" &&
              (blockProps.label as string) === "Titulo do Video"
            ) {
              scriptTitle = (block.content as InlineContent[])
                .map((c: any) => c.text ?? "")
                .join("");
            }
          }

          const result = await suggestAction({
            scriptTitle: scriptTitle || "Sem titulo",
            moduleTitle,
            fieldLabel: label,
            existingContent: currentContent
              .map((c: any) => c.text ?? "")
              .join(""),
            otherFields,
          });

          // Insert suggestion into the block
          props.editor.updateBlock(props.block, {
            content: [{ type: "text", text: result, styles: {} }],
          });

          setSuggestion((prev) => ({ ...prev, status: "reviewing" }));
        } catch (error) {
          console.error("AI suggestion failed:", error);
          setSuggestion({ status: "idle", originalContent: [] });
        }
      }, [suggestion.status, props.block, props.editor, label, moduleId, suggestAction]);

      const handleAccept = () => {
        setSuggestion({ status: "idle", originalContent: [] });
      };

      const handleDiscard = () => {
        props.editor.updateBlock(props.block, {
          content: suggestion.originalContent,
        });
        setSuggestion({ status: "idle", originalContent: [] });
      };

      return (
        <div
          className={`script-field module-field-${moduleId} py-2`}
          data-module-id={moduleId}
        >
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {label}
            </label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSuggest();
              }}
              disabled={suggestion.status === "loading"}
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-lime-400 transition-colors px-1.5 py-0.5 rounded hover:bg-lime-500/10 disabled:opacity-50"
            >
              {suggestion.status === "loading" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              <span>Sugerir</span>
            </button>
          </div>

          <div className="inline-content" ref={props.contentRef} />

          {suggestion.status === "reviewing" && (
            <div className="flex items-center gap-2 mt-2 ml-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccept();
                }}
                className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300 px-2 py-1 rounded bg-lime-500/10 hover:bg-lime-500/20 transition-colors"
              >
                <Check size={12} />
                <span>Aceitar</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDiscard();
                }}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
              >
                <X size={12} />
                <span>Descartar</span>
              </button>
            </div>
          )}
        </div>
      );
    },
  }
);
