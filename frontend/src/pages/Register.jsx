import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Lock, 
  ArrowRight, AlertCircle, CheckCircle2 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '',
    email: '', 
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setStatus({ type: 'error', message: 'Mật khẩu xác nhận không khớp.' });
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Prepare data for backend
    const { confirmPassword, ...submitData } = formData;
    
    const result = await register(submitData);
    
    if (result.success) {
      setStatus({ type: 'success', message: 'Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...' });
      setTimeout(() => navigate('/login'), 800);
    } else {
      setStatus({ type: 'error', message: result.message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center relative overflow-hidden bg-slate-50">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="max-w-2xl mx-auto">
          {/* Logo Area */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4 text-3xl font-black text-slate-900">
              S-LIFE
            </Link>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Tham gia cộng đồng S-Life</h1>
            <p className="text-slate-500 mt-2 font-medium">Bắt đầu theo dõi sức khỏe của bạn ngay hôm nay</p>
          </div>

          {/* Register Card */}
          <div className="glass-card p-8 rounded-3xl border border-white/50 shadow-2xl shadow-blue-500/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Status Message */}
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                    status.type === 'error' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {status.message}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input 
                  label="Tên đăng nhập"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="user123"
                  icon={User}
                />
                <Input 
                  label="Email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@gmail.com"
                  icon={Mail}
                />
              </div>

              <Input 
                label="Họ và tên"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn An"
                icon={User}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input 
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={Lock}
                  showPassword={showPassword}
                  togglePassword={() => setShowPassword(!showPassword)}
                />
                <Input 
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={Lock}
                  showPassword={showConfirmPassword}
                  togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
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

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-medium">Hoặc đăng ký nhanh với</span>
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

          <p className="text-center mt-8 text-slate-500 font-medium">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
