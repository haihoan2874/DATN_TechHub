import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SLModal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[90vh]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity }}
            animate={{ opacity }}
            exit={{ opacity }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity, scale.95, y }}
            animate={{ opacity, scale, y }}
            exit={{ opacity, scale.95, y }}
            className={cn(
              "relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col",
              sizes[size]
            )}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              {title ? (
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                  {title}
                </h3>
              ) : <div />}
              
              <button 
                onClick={onClose}
                className="p-2 hover-slate-50 rounded-xl text-slate-400 hover-brand-primary transition-all active-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SLModal;
