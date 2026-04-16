import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock,
  Phone,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import apiClient from '../../api/axios';
import SLButton from '../../components/ui/SLButton';
import SLInput from '../../components/ui/SLInput';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation
    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ và tên");
      return;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Địa chỉ Email không hợp lệ");
      return;
    }
    if (formData.phoneNumber.length < 10) {
      setError("Số điện thoại không hợp lệ");
      return;
    }
    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Tự động tạo username từ email (lấy phần trước dấu @) để thỏa mãn CSDL
      const generatedUsername = formData.email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      await apiClient.post('/auth/register', {
        username: generatedUsername,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        fullName: formData.fullName
      });
      // On success, redirect to login
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Right Content Section: CellphoneS Style */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1 relative">
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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[450px]"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-blue-600 uppercase tracking-tight mb-2 italic">
              Đăng ký S-MEMBER
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

          <form className="space-y-4" onSubmit={handleRegister}>
            <SLInput 
              label="Họ và tên"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Nhập họ và tên"
              leftIcon={<Mail size={16} />} 
            />

            <SLInput 
              label="Địa chỉ Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="email@example.com"
              leftIcon={<Mail size={16} />}
            />

            <SLInput 
              label="Số điện thoại"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              placeholder="09xx xxx xxx"
              leftIcon={<Phone size={16} />}
            />

            <div className="grid grid-cols-2 gap-4">
              <SLInput 
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
              />
              <SLInput 
                label="Xác nhận"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
              />
            </div>

            <SLButton 
              type="submit" 
              isLoading={loading}
              className="w-full mt-4"
              size="lg"
            >
              Đăng ký thành viên
            </SLButton>
          </form>

          <div className="mt-8 text-center">
             <p className="text-xs font-bold text-slate-400 italic">
               Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập ngay</Link>
             </p>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-white text-slate-400 font-black uppercase tracking-widest italic">Hoặc tham gia với</span>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <SLButton variant="outline" className="gap-3 shadow-none border-slate-100 h-12">
               <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Đăng ký với Google</span>
            </SLButton>
          </div>
          <div className="mt-12 text-center border-t border-slate-50 pt-8">
             <p className="text-[11px] text-slate-400 font-medium">
                S-LIFE HEALTH REVOLUTION <br/>
                <span className="text-blue-500 font-bold tracking-widest uppercase">Gia nhập cộng đồng 1%</span>
             </p>
          </div>
        </motion.div>
      </div>

      {/* Left Decoration Section (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-20 order-1 lg:order-2">
        <div className="absolute inset-0 opacity-50">
           <img 
             src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2000" 
             alt="Elite Training" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h3 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-none mb-8">ELITE</h3>
              <p className="text-white/80 text-xl font-bold italic tracking-widest uppercase">GIA NHẬP CỘNG ĐỒNG 1%</p>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
