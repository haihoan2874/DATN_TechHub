import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react';

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
      bg: "bg-rose-50",
      iconBg: "bg-rose-600",
      iconColor: "text-white",
      icon: ShieldAlert,
      button: "danger",
      border: "border-rose-200"
    },
    warning: {
      bg: "bg-amber-50",
      iconBg: "bg-amber-500",
      iconColor: "text-white",
      icon: AlertTriangle,
      button: "primary",
      border: "border-amber-200"
    },
    info: {
      bg: "bg-blue-50",
      iconBg: "bg-blue-600",
      iconColor: "text-white",
      icon: Info,
      button: "primary",
      border: "border-blue-200"
    }
  };

  const style = variants[variant] || variants.danger;
  const Icon = style.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false} size="sm">
      <div className={`rounded-2xl ${style.bg} border ${style.border} p-6 text-center`}>
          <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${style.iconBg} ${style.iconColor}`}>
            <Icon size={36} />
          </div>
          
          <h3 className="mb-3 text-xl font-bold text-slate-950">
            {title}
          </h3>
          
          <p className="mx-auto mb-6 max-w-[300px] text-sm leading-6 text-slate-600">
            {message}
          </p>

          <div className="flex flex-col gap-2">
            <Button 
              variant={style.button} 
              onClick={onConfirm} 
              className="w-full"
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
            <button 
              type="button"
              onClick={onClose} 
              disabled={isLoading}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-slate-500 hover:bg-white/60 hover:text-slate-900 disabled:opacity-50"
            >
              {cancelText}
            </button>
          </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
