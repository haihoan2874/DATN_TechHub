import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User,
  Mail, 
  Lock, 
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import apiClient from '../../api/axios';
import SLButton from '../../components/ui/SLButton';
import SLInput from '../../components/ui/SLInput';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation
    if (!formData.username.trim()) {
      setError("Vui lòng nhập Email hoặc Số điện thoại");
      toast.error("Vui lòng nhập Email hoặc Số điện thoại");
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError("Vui lòng nhập mật khẩu");
      toast.error("Vui lòng nhập mật khẩu");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/login', formData);
      const { token, role, username } = response.data;
      
      localStorage.setItem('slife_token', token);
      localStorage.setItem('slife_role', role);
      localStorage.setItem('slife_username', username);

      toast.success(`Chào mừng trở lại, ${username}!`);

      // Phân quyền điều hướng
      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/shop');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left Side Inspiration (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 opacity-30">
           <img 
             src="https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=2000" 
             alt="Fitness Lifestyle" 
             className="w-full h-full object-cover scale-105"
           />
        </div>
        {/* Gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
        
        <div className="relative z-10 max-w-lg">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
              <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 glass-dark rounded-full border border-white/10 shadow-2xl">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100/80">S-Life Premium Member</span>
              </div>
              <h1 className="text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8">
                Làm chủ <br />
                <span className="text-blue-500">Sức khỏe</span> <br />
                Của Bạn
              </h1>
              <p className="text-slate-300 text-lg font-medium mb-12 leading-relaxed opacity-80">
                Chào mừng đến với hệ sinh thái Elite Health. Đăng nhập để khám phá công nghệ AI tư vấn sức khỏe hàng đầu.
              </p>
              <div className="flex gap-4 items-center">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold overflow-hidden">
                         <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                      </div>
                    ))}
                 </div>
                 <span className="text-xs text-slate-400 font-medium">+5,000 thành viên đã tham gia</span>
              </div>
           </motion.div>
        </div>
        
        {/* Floating Branding */}
        <div className="absolute top-12 left-12">
            <span className="text-2xl font-bold text-white tracking-tighter">S-LIFE <span className="text-blue-500 text-sm align-top ml-1">ELITE</span></span>
        </div>
      </div>

      {/* Right Side Style Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50/30">
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
          className="w-full max-w-[440px] bg-white p-10 rounded-[2.5rem] shadow-premium border border-slate-100"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Chào mừng trở lại
            </h2>
            <p className="text-slate-400 text-sm font-medium">Vui lòng đăng nhập vào tài khoản của bạn</p>
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

          <form className="space-y-6" onSubmit={handleLogin}>
            <SLInput 
              label="Email hoặc Số điện thoại"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="name@example.com"
              leftIcon={<User size={18} />}
            />

            <div className="space-y-2">
              <SLInput 
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-blue-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <div className="text-right px-1">
                 <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Quên mật khẩu?</Link>
              </div>
            </div>

            <SLButton 
              type="submit" 
              isLoading={loading}
              className="w-full btn-premium py-4"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
            >
              Đăng nhập ngay
            </SLButton>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-[0.2em]">Hoặc đăng nhập với</span>
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

          <div className="mt-10 text-center">
             <p className="text-sm font-medium text-slate-500">
               Bạn mới tham gia? <Link to="/register" className="text-blue-600 font-bold hover:underline underline-offset-4">Đăng ký thành viên</Link>
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
