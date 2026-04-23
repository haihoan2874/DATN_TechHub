import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock,
  Phone,
  AlertCircle,
  ArrowLeft,
  User,
  ArrowRight
} from 'lucide-react';
import apiClient from '../../api/axios';
import SLButton from '../../components/ui/SLButton';
import SLInput from '../../components/ui/SLInput';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    // Client-side validation
    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ và tên");
      toast.error("Vui lòng nhập họ và tên");
      return;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Địa chỉ Email không hợp lệ");
      toast.error("Địa chỉ Email không hợp lệ");
      return;
    }
    if (formData.phoneNumber.length < 10) {
      setError("Số điện thoại không hợp lệ");
      toast.error("Số điện thoại không hợp lệ");
      return;
    }
    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const generatedUsername = formData.email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      await apiClient.post('/auth/register', {
        username: generatedUsername,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        fullName: formData.fullName
      });

      // Auto-login after successful registration
      toast.success("Đăng ký thành công! Đang tự động đăng nhập...");
      
      const loginResponse = await apiClient.post('/auth/login', {
        username: generatedUsername,
        password: formData.password
      });

      const { token, role, username } = loginResponse.data;
      
      localStorage.setItem('slife_token', token);
      localStorage.setItem('slife_role', role);
      localStorage.setItem('slife_username', username);

      toast.success(`Chào mừng gia nhập S-Life, ${username}!`);
      navigate('/shop');
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Content Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1 relative bg-slate-50/30">
        <Link 
          to="/" 
          className="absolute top-8 left-8 z-20 flex items-center gap-3 text-slate-500 hover:text-blue-600 transition-all group font-bold uppercase tracking-widest text-[10px]"
        >
          <div className="w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all">
            <ArrowLeft size={16} />
          </div>
          Về trang chủ
        </Link>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[480px] bg-white p-10 rounded-[2.5rem] shadow-premium border border-slate-100"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Bắt đầu hành trình
            </h2>
            <p className="text-slate-400 text-sm font-medium">Trở thành thành viên của Elite Health Ecosystem</p>
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

          <form className="space-y-5" onSubmit={handleRegister}>
            <SLInput 
              label="Họ và tên"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Nguyễn Văn A"
              leftIcon={<User size={18} />} 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SLInput 
                label="Địa chỉ Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="name@example.com"
                leftIcon={<Mail size={18} />}
              />
              <SLInput 
                label="Số điện thoại"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="09xx xxx xxx"
                leftIcon={<Phone size={18} />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SLInput 
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                leftIcon={<Lock size={18} />}
              />
              <SLInput 
                label="Xác nhận mật khẩu"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••"
                leftIcon={<Lock size={18} />}
              />
            </div>

            <SLButton 
              type="submit" 
              isLoading={loading}
              className="w-full btn-premium py-4 mt-2"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
            >
              Đăng ký ngay
            </SLButton>
          </form>

          <div className="mt-8 text-center">
             <p className="text-sm font-medium text-slate-500">
               Đã có tài khoản? <Link to="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">Đăng nhập</Link>
             </p>
          </div>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-[0.2em]">Hoặc tham gia nhanh</span>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <a href="http://localhost:8089/oauth2/authorization/google" className="block">
              <SLButton variant="outline" className="w-full gap-4 shadow-none border-slate-100 h-14 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-600 flex items-center justify-center">
                 <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" className="w-6 h-6 object-contain" alt="Google" />
                 Tiếp tục với Google
              </SLButton>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decoration Section (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-20 order-1 lg:order-2">
        <div className="absolute inset-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2000" 
             alt="Elite Training" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-slate-900/80" />
        
        <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-dark rounded-full border border-white/10 mb-8">
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-100">Cộng đồng Tinh hoa</span>
              </div>
              <h3 className="text-8xl font-bold text-white tracking-tighter leading-none mb-6">ELITE</h3>
              <p className="text-white/70 text-xl font-medium tracking-wide">Nâng tầm chuẩn mực sống khỏe của bạn</p>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
