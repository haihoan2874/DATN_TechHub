import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, ShoppingBag, HeartPulse, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getOAuthUrl } from '../config/api';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '',
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();
    const nextErrors = {};

    if (!username) {
      nextErrors.username = 'Vui lòng nhập tên đăng nhập.';
    } else if (username.length < 3 || username.length > 30) {
      nextErrors.username = 'Tên đăng nhập phải có từ 3 đến 30 ký tự.';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      nextErrors.username = 'Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.';
    }

    if (!email) {
      nextErrors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Email không đúng định dạng.';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 8) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    } else if (password.length > 72) {
      nextErrors.password = 'Mật khẩu không được vượt quá 72 ký tự.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Prepare data for backend
    const submitData = {
      username,
      email,
      password
    };
    
    const result = await register(submitData);
    
    if (result.success) {
      setStatus({ type: 'success', message: 'Đăng ký thành công. Đang chuyển đến trang đăng nhập…' });
      setTimeout(() => navigate('/login'), 800);
    } else {
      setStatus({ type: 'error', message: result.message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center bg-transparent px-4 py-8 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto w-full max-w-5xl"
      >
        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_0.8fr]">
          <main className="p-5 sm:p-7 lg:p-8">
            <div className="mb-6">
              <Link to="/" className="mb-6 inline-block text-2xl font-extrabold text-slate-900 lg:hidden" translate="no">
                S-LIFE
              </Link>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Tạo tài khoản</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Tạo tài khoản bằng tên đăng nhập, email và mật khẩu để mua sắm tại S-LIFE.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Status Message */}
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  aria-live="polite"
                  className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
                    status.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {status.message}
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input 
                  label="Tên đăng nhập"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ví dụ: slife_user…"
                  icon={User}
                  autoComplete="username"
                  spellCheck={false}
                  error={fieldErrors.username}
                />
                <Input 
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ví dụ: name@example.com…"
                  icon={Mail}
                  autoComplete="email"
                  spellCheck={false}
                  error={fieldErrors.email}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input 
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={Lock}
                  showPassword={showPassword}
                  togglePassword={() => setShowPassword(!showPassword)}
                  autoComplete="new-password"
                  error={fieldErrors.password}
                />
                <Input 
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={Lock}
                  showPassword={showConfirmPassword}
                  togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  autoComplete="new-password"
                  error={fieldErrors.confirmPassword}
                />
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                icon={ArrowRight}
              >
                Đăng ký ngay
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 font-medium text-slate-400">Hoặc đăng ký với</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = getOAuthUrl('google')}
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Tiếp tục với Google</span>
                </div>
              </Button>
            </form>

          <p className="mt-6 text-center text-sm font-medium text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
              Đăng nhập tại đây
            </Link>
          </p>
          </main>

          <aside className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 text-2xl font-extrabold" translate="no">
                S-LIFE
              </Link>
              <div className="mt-12">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-300">TRỞ THÀNH THÀNH VIÊN</p>
                <h2 className="text-3xl font-extrabold leading-tight text-balance">Bắt đầu hành trình chăm sóc sức khỏe.</h2>
                <p className="mt-5 text-sm leading-7 text-slate-300">
                  Đăng ký tài khoản S-LIFE để trải nghiệm nền tảng mua sắm thông minh, sử dụng trợ lý AI và nhận các ưu đãi độc quyền.
                </p>
              </div>
            </div>
            <div className="grid gap-3 text-sm font-semibold text-slate-200">
              <div className="flex items-center gap-3"><ShoppingBag size={18} className="text-blue-300" /> Thanh toán COD & VNPay tiện lợi</div>
              <div className="flex items-center gap-3"><HeartPulse size={18} className="text-blue-300" /> Nhận ưu đãi qua Voucher độc quyền</div>
              <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-blue-300" /> Quản lý địa chỉ & theo dõi đơn hàng</div>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
