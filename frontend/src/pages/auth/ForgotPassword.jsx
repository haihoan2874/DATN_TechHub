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
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1, 2, 3 Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Phase 1 OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Vui lòng nhập định dạng Email hợp lệ");
      toast.error("Vui lòng nhập định dạng Email hợp lệ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      toast.success("Mã OTP đã được gửi về Email của bạn!");
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || "Email không tồn tại trong hệ thống";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Phase 2 OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số");
      toast.error("Mã OTP phải có 6 chữ số");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/verify-otp', { email, otp });
      toast.success("Xác thực OTP thành công!");
      setStep(3);
    } catch (err) {
      setError("Mã OTP không chính xác hoặc đã hết hạn");
      toast.error("Mã OTP không chính xác hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  // Phase 3 Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      toast.success("Đổi mật khẩu thành công!");
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại sau");
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <Link 
        to="/login" 
        className="absolute top-8 left-12 z-20 flex items-center gap-3 text-slate-500 hover:text-blue-600 transition-all group font-bold uppercase tracking-widest text-[10px]"
      >
        <div className="w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all">
          <ArrowLeft size={16} />
        </div>
        Quay lại đăng nhập
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[460px] bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium relative z-10"
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
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Thành công!</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Mật khẩu của bạn đã được thay đổi. Hệ thống sẽ tự động chuyển về trang Đăng nhập sau giây lát.
              </p>
            </motion.div>
          ) : (
            <div key="form">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100/50">
                  {step === 1 && <ShieldCheck size={32} className="text-blue-600" />}
                  {step === 2 && <KeyRound size={32} className="text-blue-600" />}
                  {step === 3 && <Lock size={32} className="text-blue-600" />}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
                  {step === 1 && "Quên mật khẩu?"}
                  {step === 2 && "Xác thực mã OTP"}
                  {step === 3 && "Mật khẩu mới"}
                </h2>
                <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">
                  {step === 1 && "Nhập email của bạn để nhận mã khôi phục 6 chữ số."}
                  {step === 2 && `Mã 6 số đã được gửi tới ${email}.`}
                  {step === 3 && "Thiết lập mật khẩu mới cho tài khoản của bạn."}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-semibold shadow-sm"
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
                    placeholder="name@example.com"
                    leftIcon={<Mail size={18} />}
                  />
                  <SLButton type="submit" isLoading={loading} className="w-full btn-premium py-4" size="lg" rightIcon={<ArrowRight size={18} />}>
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
                    className="text-center tracking-[0.8em] font-bold text-2xl"
                  />
                  <SLButton type="submit" isLoading={loading} className="w-full btn-premium py-4" size="lg" rightIcon={<ArrowRight size={18} />}>
                    Xác nhận mã
                  </SLButton>
                  <div className="text-center">
                    <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors">
                      Gửi lại mã mới
                    </button>
                  </div>
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
                    leftIcon={<Lock size={18} />}
                  />
                  <SLInput 
                    label="Xác nhận mật khẩu"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    leftIcon={<Lock size={18} />}
                  />
                  <SLButton type="submit" isLoading={loading} className="w-full btn-premium py-4" size="lg" rightIcon={<ArrowRight size={18} />}>
                    Đổi mật khẩu
                  </SLButton>
                </form>
              )}
            </div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center border-t border-slate-50 pt-8">
           <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
              Elite Health Ecosystem <br/>
              <span className="text-blue-400/50">Hệ thống bảo mật Secure 2.0</span>
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
