import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';

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
      accent: "bg-rose-600",
      halo: "bg-rose-50 ring-rose-100",
      message: "border-rose-100 bg-rose-50/70",
      iconColor: "text-rose-600",
      icon: ShieldAlert,
      button: "danger",
      eyebrow: "Hành động cần xác nhận"
    },
    warning: {
      accent: "bg-amber-500",
      halo: "bg-amber-50 ring-amber-100",
      message: "border-amber-100 bg-amber-50/70",
      iconColor: "text-amber-600",
      icon: AlertTriangle,
      button: "primary",
      eyebrow: "Kiểm tra trước khi tiếp tục"
    },
    info: {
      accent: "bg-blue-600",
      halo: "bg-blue-50 ring-blue-100",
      message: "border-blue-100 bg-blue-50/70",
      iconColor: "text-blue-600",
      icon: Info,
      button: "primary",
      eyebrow: "Xác nhận thông tin"
    }
  };

  const style = variants[variant] || variants.danger;
  const Icon = style.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false} closeOnOverlay={!isLoading} size="sm">
      <div className="relative overflow-hidden rounded-2xl bg-white">
        <div className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />

        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Đóng hộp thoại xác nhận"
          className="absolute right-0 top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="px-1 pt-5 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl ring-8 ${style.halo}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Icon size={26} className={style.iconColor} />
            </div>
          </div>

          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            {style.eyebrow}
          </p>
          <h3 className="mx-auto max-w-sm text-2xl font-black leading-tight tracking-tight text-slate-950">
            {title}
          </h3>
        </div>

        <div className={`mt-5 rounded-2xl border px-4 py-3 ${style.message}`}>
          <p className="text-center text-sm font-semibold leading-6 text-slate-700">
            {message}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={style.button}
            onClick={onConfirm}
            className="w-full"
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
