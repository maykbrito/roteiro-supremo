// src/components/AIAnalysisPanel.tsx
import { X } from "lucide-react";
import { motion } from "motion/react";

interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: { area: string; suggestion: string }[];
  retentionHooks: string;
  ctaEffectiveness: string;
  contentFlow: string;
}

interface AIAnalysisPanelProps {
  analysis: AnalysisResult;
  onClose: () => void;
}

export function AIAnalysisPanel({ analysis, onClose }: AIAnalysisPanelProps) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-screen w-96 bg-zinc-900 border-l border-zinc-800 z-50 overflow-y-auto"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">
            Analise do Roteiro
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Score */}
        <div className="text-center">
          <div className="text-5xl font-bold text-lime-400">
            {analysis.score}
          </div>
          <p className="text-sm text-zinc-500 mt-1">Pontuacao geral</p>
        </div>

        {/* Summary */}
        <p className="text-sm text-zinc-300">{analysis.summary}</p>

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-lime-400 mb-2">
              Pontos Fortes
            </h3>
            <ul className="space-y-1">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-sm text-zinc-300 pl-3 border-l-2 border-lime-500/30">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {analysis.improvements.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-yellow-400 mb-2">
              Sugestoes de Melhoria
            </h3>
            <div className="space-y-3">
              {analysis.improvements.map((imp, i) => (
                <div key={i} className="pl-3 border-l-2 border-yellow-500/30">
                  <p className="text-xs font-medium text-zinc-400">
                    {imp.area}
                  </p>
                  <p className="text-sm text-zinc-300">{imp.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        <div className="space-y-4 pt-2 border-t border-zinc-800">
          <div>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Ganchos de Retencao
            </h3>
            <p className="text-sm text-zinc-300">{analysis.retentionHooks}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Eficacia do CTA
            </h3>
            <p className="text-sm text-zinc-300">
              {analysis.ctaEffectiveness}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Fluxo do Conteudo
            </h3>
            <p className="text-sm text-zinc-300">{analysis.contentFlow}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
