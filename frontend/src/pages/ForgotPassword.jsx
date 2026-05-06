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
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await authService.forgotPassword(email);
      setStatus({ 
        type: 'success', 
        message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!' 
      });
      // Pass email to verify page to avoid re-typing
      setTimeout(() => navigate('/verify-otp', { state: { email } }), 2000);
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
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center relative overflow-hidden bg-slate-50">
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="max-w-md mx-auto">
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-8 transition-colors">
            <ChevronLeft size={20} /> Quay lại đăng nhập
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Quên mật khẩu?</h1>
            <p className="text-slate-500 mt-2 font-medium">Đừng lo lắng, hãy nhập email của bạn để lấy lại mật khẩu</p>
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
                label="Địa chỉ Email"
                type="email"
                required
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
