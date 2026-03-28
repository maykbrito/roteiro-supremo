import { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface MicrolearningProps {
  title: string;
  children: ReactNode;
}

export function Microlearning({ title, children }: MicrolearningProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 text-left text-sm font-medium text-orange-800 hover:bg-orange-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span>💡 {title}</span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-orange-400"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 pb-3 text-xs leading-relaxed text-orange-700"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
