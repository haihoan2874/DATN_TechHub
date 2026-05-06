import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  User, Lock, Eye, EyeOff, 
  ArrowRight, Chrome, 
  AlertCircle, CheckCircle2 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to previous page or home after login
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    const result = await login(formData);
    
    if (result.success) {
      setStatus({ type: 'success', message: 'Đăng nhập thành công! Đang chuyển hướng...' });
      
      // Get the role from the saved user in localStorage or the result (if returned)
      const savedUser = JSON.parse(localStorage.getItem('user'));
      const userRole = savedUser?.role;

      setTimeout(() => {
        if (userRole === 'ROLE_ADMIN') {
          navigate('/admin/dashboard', { replace: true });
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
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center relative overflow-hidden bg-slate-50">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="max-w-md mx-auto">
          {/* Logo Area */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <span className="text-3xl font-black text-slate-900">
                S-LIFE
              </span>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Chào mừng trở lại</h1>
            <p className="text-slate-500 mt-2 font-medium">Đăng nhập để tiếp tục hành trình sức khỏe của bạn</p>
          </div>

          {/* Login Card */}
          <div className="glass-card p-8 rounded-3xl border border-white/50 shadow-2xl shadow-blue-500/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Status Message */}
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium ${
                    status.type === 'error' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {status.message}
                </motion.div>
              )}

              <Input 
                label="Tên đăng nhập"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                icon={User}
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
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={Lock}
                  togglePassword={() => setShowPassword(!showPassword)}
                  showPassword={showPassword}
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

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/0 px-2 text-slate-400 font-medium">Hoặc đăng nhập với</span>
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = "http://localhost:8089/oauth2/authorization/google"}
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Tiếp tục với Google</span>
                </div>
              </Button>
            </form>
          </div>

          {/* Register Link */}
          <p className="text-center mt-8 text-slate-500 font-medium">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
              Tạo tài khoản mới
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
