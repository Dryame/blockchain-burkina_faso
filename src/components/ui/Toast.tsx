import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose 
}) {
  const icons = {
    success: <CheckCircle2 className="text-burkina-green" />,
    error: <AlertCircle className="text-burkina-red" />,
    info: <Info className="text-burkina-yellow" />
  };

  const bgColors = {
    success: 'bg-burkina-green/10 border-burkina-green/20',
    error: 'bg-burkina-red/10 border-burkina-red/20',
    info: 'bg-burkina-yellow/10 border-burkina-yellow/20'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
        >
          <div className={`p-5 rounded-3xl glass-card flex items-center justify-between border-2 ${bgColors[type]} shadow-2xl`}>
            <div className="flex items-center gap-4">
              <div className="shrink-0">{icons[type]}</div>
              <span className="text-sm font-black text-ui-text uppercase italic tracking-tight">{message}</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-ui-surface rounded-xl text-ui-muted hover:text-ui-text transition-all active:scale-90 ml-4"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
