import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-10 right-10 z-[200]"
        >
          <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-2xl p-4 pr-12 flex items-center gap-4 min-w-[300px]">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
              ${type === 'success' ? 'bg-emerald-50' : type === 'error' ? 'bg-rose-50' : 'bg-blue-50'}`}>
              {icons[type]}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-0.5">Thông báo hệ thống</p>
              <p className="text-sm font-black text-slate-900 tracking-tight italic">{message}</p>
            </div>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
