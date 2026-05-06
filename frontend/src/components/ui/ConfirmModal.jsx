import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, AlertCircle, ShieldAlert, Info, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này không? Thao tác này không thể hoàn tác.",
  confirmText = "Xác nhận ngay",
  cancelText = "Hủy bỏ",
  variant = "danger",
  isLoading = false
}) => {
  
  const variants = {
    danger: {
      bg: "bg-red-50/50",
      iconBg: "bg-red-500",
      iconColor: "text-white",
      icon: ShieldAlert,
      button: "danger",
      border: "border-red-100",
      glow: "shadow-red-500/20"
    },
    warning: {
      bg: "bg-amber-50/50",
      iconBg: "bg-amber-500",
      iconColor: "text-white",
      icon: AlertTriangle,
      button: "primary",
      border: "border-amber-100",
      glow: "shadow-amber-500/20"
    },
    info: {
      bg: "bg-blue-50/50",
      iconBg: "bg-blue-600",
      iconColor: "text-white",
      icon: Info,
      button: "primary",
      border: "border-blue-100",
      glow: "shadow-blue-500/20"
    }
  };

  const style = variants[variant] || variants.danger;
  const Icon = style.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false} size="sm">
      <div className="p-2">
        <div className={`rounded-[2.5rem] ${style.bg} border-2 border-dashed ${style.border} p-10 flex flex-col items-center text-center`}>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className={`w-20 h-20 rounded-[2rem] ${style.iconBg} ${style.iconColor} flex items-center justify-center mb-8 shadow-2xl ${style.glow}`}
          >
            <Icon size={36} />
          </motion.div>
          
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">
            {title}
          </h3>
          
          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 max-w-[280px]">
            {message}
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Button 
              variant={style.button} 
              onClick={onConfirm} 
              className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl"
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
            <button 
              onClick={onClose} 
              disabled={isLoading}
              className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
