import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  KeyRound
} from 'lucide-react';
import SLButton from '../../components/ui/SLButton';
import SLInput from '../../components/ui/SLInput';
import apiClient from '../../api/axios';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Phase 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Vui lòng nhập định dạng Email hợp lệ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Email không tồn tại trong hệ thống");
    } finally {
      setLoading(false);
    }
  };

  // Phase 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/verify-otp', { email, otp });
      setStep(3);
    } catch (err: any) {
      setError("Mã OTP không chính xác hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  // Phase 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError("Có lỗi xảy ra, vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <Link 
        to="/login" 
        className="absolute top-8 left-12 z-20 flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all group font-bold italic uppercase tracking-widest text-[10px]"
      >
        <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-blue-500/30 group-hover:bg-blue-50 transition-all">
          <ArrowLeft size={14} />
        </div>
        Quay lại đăng nhập
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px] bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative z-10"
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 italic">Thành công!</h2>
              <p className="text-xs text-slate-500 font-bold italic leading-relaxed">
                Mật khẩu của bạn đã được thay đổi. Hệ thống sẽ tự động chuyển về trang Đăng nhập sau giây lát.
              </p>
            </motion.div>
          ) : (
            <div key="form">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {step === 1 && <ShieldCheck size={32} className="text-blue-600" />}
                  {step === 2 && <KeyRound size={32} className="text-blue-600" />}
                  {step === 3 && <Lock size={32} className="text-blue-600" />}
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3 italic">
                  {step === 1 && "Quên mật khẩu?"}
                  {step === 2 && "Xác thực mã OTP"}
                  {step === 3 && "Mật khẩu mới"}
                </h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic leading-relaxed px-4">
                  {step === 1 && "Nhập email của bạn để nhận mã khôi phục 6 chữ số."}
                  {step === 2 && `Mã 6 số đã được gửi tới ${email}.`}
                  {step === 3 && "Thiết lập mật khẩu mới cho tài khoản của bạn."}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-[10px] font-black italic uppercase tracking-tight"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {step === 1 && (
                <form className="space-y-6" onSubmit={handleRequestOtp}>
                  <SLInput 
                    label="Địa chỉ Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    leftIcon={<Mail size={18} />}
                  />
                  <SLButton type="submit" isLoading={loading} className="w-full" size="lg" rightIcon={<ArrowRight size={18} />}>
                    Tiếp tục
                  </SLButton>
                </form>
              )}

              {step === 2 && (
                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                  <SLInput 
                    label="Nhập mã OTP (6 số)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="text-center tracking-[1em] font-black text-2xl"
                  />
                  <SLButton type="submit" isLoading={loading} className="w-full" size="lg" rightIcon={<ArrowRight size={18} />}>
                    Xác nhận mã
                  </SLButton>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 italic">
                    Gửi lại mã mới
                  </button>
                </form>
              )}

              {step === 3 && (
                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <SLInput 
                    label="Mật khẩu mới"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <SLInput 
                    label="Xác nhận mật khẩu"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <SLButton type="submit" isLoading={loading} className="w-full" size="lg">
                    Đổi mật khẩu
                  </SLButton>
                </form>
              )}
            </div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center border-t border-slate-50 pt-8">
           <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic leading-relaxed">
              Elite Health Ecosystem <br/>
              Hệ thống bảo mật S-LIFE Secure 2.0
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
