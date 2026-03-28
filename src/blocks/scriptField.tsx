// src/blocks/scriptField.tsx
import { createReactBlockSpec } from "@blocknote/react";
import { Sparkles } from "lucide-react";

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
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-lime-400 transition-colors px-1.5 py-0.5 rounded hover:bg-lime-500/10"
              onClick={(e) => {
                e.stopPropagation();
                // AI suggestion — implemented in Chunk 3
                console.log("Sugerir clicked for:", label);
              }}
            >
              <Sparkles size={12} />
              <span>Sugerir</span>
            </button>
          </div>
          <div className="inline-content" ref={props.contentRef} />
        </div>
      );
    },
  }
);
