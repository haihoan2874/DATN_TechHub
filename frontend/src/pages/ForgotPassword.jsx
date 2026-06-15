import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../services/authService';
import { 
  Mail, ArrowRight, ChevronLeft, 
  AlertCircle, CheckCircle2 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setEmailError('Vui lòng nhập email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Email không đúng định dạng.');
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await authService.forgotPassword(normalizedEmail);
      setStatus({ 
        type: 'success', 
        message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!' 
      });
      // Pass email to verify page to avoid re-typing
      setTimeout(() => navigate('/verify-otp', { state: { email: normalizedEmail } }), 2000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center bg-transparent px-4 py-8 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-md"
      >
        <div>
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-8 transition-colors">
            <ChevronLeft size={20} /> Quay lại đăng nhập
          </Link>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Quên mật khẩu?</h1>
            <p className="text-slate-500 mt-2 font-medium">Đừng lo lắng, hãy nhập email của bạn để lấy lại mật khẩu</p>
          </div>

          <div className="glass-card rounded-2xl border border-white p-6 shadow-2xl shadow-blue-500/5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {status.message && (
                <div aria-live="polite" className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
                  status.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {status.message}
                </div>
              )}

              <Input 
                label="Địa chỉ Email"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="Ví dụ: name@example.com…"
                name="email"
                autoComplete="email"
                spellCheck={false}
                error={emailError}
              />

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                icon={ArrowRight}
              >
                Gửi mã OTP
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
