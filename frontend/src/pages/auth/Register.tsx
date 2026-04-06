import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  Phone,
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[560px] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 lg:p-14 relative z-10 border border-slate-100"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <img 
              src="/logo_final.png" 
              alt="S-Life Logo" 
              className="h-16 w-auto drop-shadow-md group-hover:scale-105 transition-transform duration-300 mix-blend-multiply" 
            />
            <span className="text-2xl font-black text-slate-900 tracking-tighter italic">S-Life</span>
          </Link>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase mb-3">Tạo tài khoản mới</h2>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest italic">Gia nhập cộng đồng S-Life hôm nay</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Họ</label>
              <div className="relative group">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Nguyễn"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-blue-500/50 transition-all font-bold text-sm italic"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Tên</label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Văn An"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 outline-none focus:bg-white focus:border-blue-500/50 transition-all font-bold text-sm italic"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Số điện thoại</label>
            <div className="relative group">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="tel" 
                placeholder="0987-654-321"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-blue-500/50 transition-all font-bold text-sm italic"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Email</label>
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="email" 
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-blue-500/50 transition-all font-bold text-sm italic"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Mật khẩu</label>
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-blue-500/50 transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 px-1 py-2">
            <div className="mt-1">
                <div className="w-5 h-5 rounded-lg border-2 border-slate-200 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all bg-slate-50">
                    <ShieldCheck size={12} className="text-white fill-blue-600 opacity-0" />
                </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                Tôi đồng ý với <Link to="/terms" className="text-blue-600 hover:scale-105 transition-all inline-block">Điều khoản sử dụng</Link> và <Link to="/privacy" className="text-blue-600 hover:scale-105 transition-all inline-block">Chính sách bảo mật</Link> của S-Life.
            </p>
          </div>

          <button 
            className="w-full py-5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            Đăng ký tài khoản <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center mt-12 text-xs font-bold text-slate-400 italic">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập tại đây</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
