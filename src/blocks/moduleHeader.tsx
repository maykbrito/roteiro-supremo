// src/blocks/moduleHeader.tsx
import { createReactBlockSpec } from "@blocknote/react";
import { useState } from "react";
import { ChevronDown, ChevronRight, Lightbulb } from "lucide-react";

export const moduleHeader = createReactBlockSpec(
  {
    type: "moduleHeader",
    propSchema: {
      moduleId: { default: "0" },
      moduleNumber: { default: "0" },
      moduleTitle: { default: "A Vitrine" },
      microLearning: { default: "" },
      collapsed: { default: false },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { moduleNumber, moduleTitle, microLearning, collapsed, moduleId } =
        props.block.props;
      const [tipOpen, setTipOpen] = useState(true);

      const toggleCollapse = () => {
        props.editor.updateBlock(props.block, {
          props: { collapsed: !collapsed },
        });
      };

      return (
        <div className="module-header" data-module-id={moduleId}>
          <div
            className="flex items-center gap-3 cursor-pointer select-none py-3"
            onClick={toggleCollapse}
          >
            <span className="text-lime-400">
              {collapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-lime-500/20 text-lime-400 uppercase tracking-wider">
              Modulo {moduleNumber}
            </span>
            <span className="text-lg font-semibold text-zinc-100">
              {moduleTitle}
            </span>
          </div>

          {microLearning && !collapsed && (
            <div className="ml-8 mb-3">
              <button
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-lime-400 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setTipOpen(!tipOpen);
                }}
              >
                <Lightbulb size={14} />
                <span>{tipOpen ? "Esconder dica" : "Ver dica"}</span>
              </button>
              {tipOpen && (
                <div className="mt-2 pl-4 border-l-2 border-lime-500/40 text-sm text-zinc-400 italic">
                  {microLearning}
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
  }
);
