import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Truck, BadgeCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getOAuthUrl } from '../config/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error')) {
      setStatus({ type: 'error', message: 'Đăng nhập Google thất bại. Vui lòng đăng nhập bằng tài khoản S-LIFE.' });
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = formData.username.trim();
    const password = formData.password.trim();
    const nextErrors = {};

    if (!username) {
      nextErrors.username = 'Vui lòng nhập tên đăng nhập hoặc email.';
    }
    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    }
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    const result = await login({ username, password });
    
    if (result.success) {
      setStatus({ type: 'success', message: 'Đăng nhập thành công. Đang chuyển hướng…' });
      
      // Get the role from the saved user in localStorage or the result (if returned)
      const savedUser = JSON.parse(localStorage.getItem('user'));
      const userRole = savedUser?.role;

      setTimeout(() => {
        if (userRole === 'ROLE_ADMIN') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }, 100);
    } else {
      setStatus({ type: 'error', message: result.message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-3 py-6 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-4xl"
      >
        <div className="grid w-full overflow-hidden rounded-2xl border-0 sm:border border-slate-200 bg-white shadow-none sm:shadow-sm lg:grid-cols-[0.9fr_1fr]">
          <aside className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 text-2xl font-extrabold" translate="no">
                S-LIFE
              </Link>
              <div className="mt-12">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-300">Thiết bị sức khỏe thông minh</p>
                <h2 className="text-3xl font-extrabold leading-tight text-balance">Quản lý mua sắm dễ dàng trên một nền tảng.</h2>
                <p className="mt-5 text-sm leading-7 text-slate-300">
                  Đăng nhập để nhận các đặc quyền thành viên, theo dõi tiến trình giao hàng và sử dụng trợ lý AI hỗ trợ mua sắm 24/7.
                </p>
              </div>
            </div>
            <div className="grid gap-3 text-sm font-semibold text-slate-200">
              <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-blue-300" /> Bảo mật thông tin an toàn</div>
              <div className="flex items-center gap-3"><Truck size={18} className="text-blue-300" /> Theo dõi đơn hàng trực tuyến</div>
              <div className="flex items-center gap-3"><BadgeCheck size={18} className="text-blue-300" /> Đánh giá sản phẩm đã mua</div>
            </div>
          </aside>

          <main className="p-3.5 sm:p-7 lg:p-8">
            <div className="mb-5 sm:mb-6">
              <Link to="/" className="mb-4 inline-block text-xl font-extrabold text-slate-900 lg:hidden" translate="no">
                S-LIFE
              </Link>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Đăng nhập</h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-500">Chào mừng bạn quay trở lại. Vui lòng đăng nhập để tiếp tục.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" noValidate>
              {/* Status Message */}
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  aria-live="polite"
                  className={`flex items-center gap-3 rounded-xl p-3 text-sm font-medium ${
                    status.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {status.message}
                </motion.div>
              )}

              <Input 
                label="Tên đăng nhập hoặc email"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập hoặc email…"
                icon={User}
                autoComplete="username"
                spellCheck={false}
                error={fieldErrors.username}
              />

              <div className="space-y-1">
                <div className="flex justify-end mb-1">
                  <Link to="/forgot-password" title="Quên mật khẩu?" className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input 
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={Lock}
                  togglePassword={() => setShowPassword(!showPassword)}
                  showPassword={showPassword}
                  autoComplete="current-password"
                  error={fieldErrors.password}
                />
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                icon={ArrowRight}
              >
                Đăng nhập
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 font-medium text-slate-400">Hoặc đăng nhập với</span>
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
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
              Tạo tài khoản mới
            </Link>
          </p>
          </main>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
