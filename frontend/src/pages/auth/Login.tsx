import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Github, 
  Chrome 
} from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 lg:p-12 relative z-10 border border-slate-100"
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase mb-3">Chào mừng trở lại</h2>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest italic">Đăng nhập để trải nghiệm S-Life ngay</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Địa chỉ Email</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="email" 
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm italic"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Mật khẩu</label>
              <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic hover:underline">Quên mật khẩu?</Link>
            </div>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm"
              />
            </div>
          </div>

          <button 
            className="w-full py-5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            Đăng nhập ngay <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="px-4 bg-white text-slate-400 font-black uppercase tracking-widest italic">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 py-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:border-blue-500/30 transition-all group">
            <Chrome size={18} className="text-slate-600 group-hover:text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Google</span>
          </button>
          <button className="flex items-center justify-center gap-3 py-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:border-blue-500/30 transition-all group">
            <Github size={18} className="text-slate-600 group-hover:text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Github</span>
          </button>
        </div>

        <p className="text-center mt-12 text-xs font-bold text-slate-400 italic">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">Tạo tài khoản ngay</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
