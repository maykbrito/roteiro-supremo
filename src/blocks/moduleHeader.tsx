// src/blocks/moduleHeader.tsx
import { createReactBlockSpec } from "@blocknote/react";
import { ChevronDown, ChevronRight } from "lucide-react";

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
      const toggleCollapse = () => {
        props.editor.updateBlock(props.block, {
          props: { collapsed: !collapsed },
        });
      };

      return (
        <div className="module-header" data-module-id={moduleId}>
          <div
            className="flex items-center justify-between cursor-pointer select-none py-1"
            onClick={toggleCollapse}
          >
            <div className="flex items-center gap-3">
              <span className="text-lime-400">
                {collapsed ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </span>
              <span className="text-lg font-semibold text-zinc-100">
                {moduleTitle}
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-lime-500/20 text-lime-400 uppercase tracking-wider">
              Módulo {moduleNumber}
            </span>
          </div>

          {microLearning && !collapsed && (
            <div className="ml-8 mb-3">
              <div className="pl-4 border-l-2 border-lime-500/40 text-sm text-zinc-400 italic">
                {microLearning}
              </div>
            </div>
          )}
        </div>
      );
    },
  },
);
