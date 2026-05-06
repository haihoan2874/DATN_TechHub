import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../services/authService';
import { 
  ShieldCheck, ArrowRight, ChevronLeft, 
  AlertCircle, CheckCircle2 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setStatus({ type: 'error', message: 'Vui lòng nhập đầy đủ 6 chữ số mã OTP.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const isValid = await authService.verifyOtp({ email, otp });
      if (isValid) {
        setStatus({ type: 'success', message: 'Xác thực thành công!' });
        setTimeout(() => navigate('/reset-password', { state: { email, otp } }), 1500);
      } else {
        setStatus({ type: 'error', message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
      }
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
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => navigate('/forgot-password')} 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-8 transition-colors"
          >
            <ChevronLeft size={20} /> Nhập lại email
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Xác thực OTP</h1>
            <p className="text-slate-500 mt-2 font-medium">Nhập mã 6 số chúng tôi đã gửi tới <br/> <span className="font-black text-slate-700">{email}</span></p>
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
                label="Mã OTP"
                type="text"
                required
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-3xl font-black tracking-[1em]"
                placeholder="000000"
              />

              <Button
                type="submit"
                disabled={otp.length < 6}
                isLoading={isSubmitting}
                className="w-full"
                icon={ArrowRight}
              >
                Xác nhận
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
