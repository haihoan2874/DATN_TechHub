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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation
    if (!formData.username.trim()) {
      setError("Vui lòng nhập Email hoặc Số điện thoại");
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError("Vui lòng nhập mật khẩu");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/login', formData);
      const { token, role, username } = response.data;
      
      localStorage.setItem('slife_token', token);
      localStorage.setItem('slife_role', role);
      localStorage.setItem('slife_username', username);

      // Phân quyền điều hướng
      if (role === 'ROLE_ADMIN') {
        navigate('/admin'); // Đường dẫn chuẩn trong App.tsx
      } else {
        navigate('/shop');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side: Visual Inspiration (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=2000" 
             alt="Fitness Lifestyle" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="relative z-10 max-w-lg">
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
           >
              <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">
                Làm chủ <br />
                <span className="text-blue-500 text-7xl">Sức khỏe</span>
              </h1>
              <p className="text-slate-300 text-lg font-medium italic mb-10 leading-relaxed">
                Chào mừng bạn đến với Elite Health Ecosystem. Đăng nhập để truy cập vào kho tính năng tư vấn AI và quản lý sức khỏe cá nhân cao cấp nhất.
              </p>
              <div className="flex gap-4 items-center">
                 <div className="w-12 h-1 bg-blue-500 rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">S-Life Premium Member</span>
              </div>
           </motion.div>
        </div>
        
        {/* Floating Branding */}
        <div className="absolute top-12 left-12">
            <span className="text-2xl font-black text-white italic tracking-tighter">S-LIFE</span>
        </div>
      </div>

      {/* Right Side: CellphoneS Style Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Link 
          to="/" 
          className="absolute top-8 left-8 z-20 flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all group font-bold italic uppercase tracking-widest text-[10px]"
        >
          <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-blue-500/30 group-hover:bg-blue-50 transition-all">
            <ArrowLeft size={14} />
          </div>
          Về trang chủ
        </Link>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[450px]"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-blue-600 uppercase tracking-tight mb-2 italic">
              Đăng nhập S-LIFE
            </h2>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold italic shadow-sm"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <SLInput 
              label="Email / Số điện thoại"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Nhập email hoặc số điện thoại"
              leftIcon={<User size={16} />}
            />

            <SLInput 
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="text-right">
               <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic hover:text-blue-600 transition-colors">Quên mật khẩu?</Link>
            </div>

            <SLButton 
              type="submit" 
              isLoading={loading}
              className="w-full"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
            >
              Đăng nhập ngay
            </SLButton>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-white text-slate-400 font-black uppercase tracking-widest italic">Hoặc đăng nhập với</span>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <SLButton variant="outline" className="gap-3 shadow-none border-slate-100 h-12">
               <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Đăng nhập với Google</span>
            </SLButton>
          </div>

          <div className="mt-10 text-center">
             <p className="text-xs font-bold text-slate-400 italic">
               Bạn chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
             </p>
          </div>

          <div className="mt-12 text-center border-t border-slate-50 pt-8">
             <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic leading-relaxed">
                Elite Health Ecosystem <br/>
                <span className="text-blue-400 font-black italic">s-life.vn</span> & <span className="text-blue-400 font-black italic">health.slife.vn</span>
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
