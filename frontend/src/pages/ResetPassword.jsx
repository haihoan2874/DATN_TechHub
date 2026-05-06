import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../services/authService';
import {  Lock, Eye, EyeOff, ArrowRight, 
  AlertCircle, CheckCircle2 
} from 'lucide-react';
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
      setStatus({ type: 'success', message: 'Đặt lại mật khẩu thành công! Đang chuyển hướng...' });
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
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center relative overflow-hidden bg-slate-50">
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Mật khẩu mới</h1>
            <p className="text-slate-500 mt-2 font-medium">Vui lòng thiết lập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white shadow-2xl shadow-blue-500/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                  status.type === 'error' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
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
              />

              <Input 
                label="Xác nhận mật khẩu"
                type="password"
                required
                icon={Lock}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
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
