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
  const [otpError, setOtpError] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
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
    <div className="flex min-h-screen items-center bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto w-full max-w-md"
      >
        <div>
          <button 
            type="button"
            onClick={() => navigate('/forgot-password')} 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-8 transition-colors"
          >
            <ChevronLeft size={20} /> Nhập lại email
          </button>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Xác thực OTP</h1>
            <p className="text-slate-500 mt-2 font-medium">Nhập mã 6 số chúng tôi đã gửi tới <br/> <span className="font-black text-slate-700">{email}</span></p>
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
                label="Mã OTP"
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  if (otpError) setOtpError('');
                }}
                inputClassName="text-center text-2xl font-black tracking-[0.35em] sm:text-3xl"
                placeholder="000000"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                spellCheck={false}
                error={otpError}
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
