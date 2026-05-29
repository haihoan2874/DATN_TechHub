import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../services/authService';
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  const [formData, setFormData] = useState({ 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await authService.resetPassword({ 
        email, 
        otp, 
        newPassword: formData.newPassword 
      });
      setStatus({ type: 'success', message: 'Đặt lại mật khẩu thành công. Đang chuyển hướng…' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-md"
      >
        <div>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Mật khẩu mới</h1>
            <p className="text-slate-500 mt-2 font-medium">Vui lòng thiết lập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          <div className="glass-card rounded-2xl border border-white p-6 shadow-2xl shadow-blue-500/5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status.message && (
                <div aria-live="polite" className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
                  status.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {status.message}
                </div>
              )}

              <Input 
                label="Mật khẩu mới"
                type={showPassword ? 'text' : 'password'}
                required
                minLength="8"
                icon={Lock}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="••••••••"
                togglePassword={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
                name="newPassword"
                autoComplete="new-password"
              />

              <Input 
                label="Xác nhận mật khẩu"
                type="password"
                required
                icon={Lock}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                name="confirmPassword"
                autoComplete="new-password"
              />

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                icon={ArrowRight}
              >
                Cập nhật mật khẩu
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
