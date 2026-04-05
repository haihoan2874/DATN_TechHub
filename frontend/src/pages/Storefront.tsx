import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Smartphone, 
  ShieldCheck, 
  ChevronRight,
  Github,
  Facebook,
  Twitter,
  Instagram,
  Tag,
  Cpu
} from 'lucide-react';
import { 
  LogoIcon, 
  SearchIcon, 
  ProductIcon 
} from '../components/common/IconComponents';

const Storefront: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-[300px] bg-white z-[70] p-10 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-16">
                <LogoIcon size={32} />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-all">
                  <X size={28} />
                </button>
              </div>
              <nav className="flex flex-col gap-8">
                {['Điện thoại', 'Máy tính', 'Phụ kiện', 'Khuyến mãi'].map((item) => (
                  <a key={item} href="#" className="text-2xl font-black italic uppercase tracking-tighter text-slate-400 hover:text-blue-600 transition-all">{item}</a>
                ))}
              </nav>
              <div className="mt-auto">
                <button className="w-full py-5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20">
                  Đăng nhập
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3 border-b border-slate-100 glass shadow-sm' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <LogoIcon size={40} />
            <span className="text-2xl font-black tracking-tight text-slate-900 italic uppercase">TECH<span className="text-blue-600">HUB</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="nav-link text-[10px] uppercase tracking-[0.2em] font-black italic">Điện thoại</a>
            <a href="#" className="nav-link text-[10px] uppercase tracking-[0.2em] font-black italic">Máy tính</a>
            <a href="#" className="nav-link text-[10px] uppercase tracking-[0.2em] font-black italic">Phụ kiện</a>
            <a href="#" className="nav-link text-[10px] uppercase tracking-[0.2em] font-black italic">Khuyến mãi</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <SearchIcon size={22} />
            </button>
            <div className="relative">
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <ShoppingCart size={22} />
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-[10px] flex items-center justify-center rounded-full text-white font-bold">0</span>
              </button>
            </div>
            <button className="md:hidden p-2 text-slate-400 hover:text-blue-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={24} />
            </button>
            <button className="hidden md:block px-6 py-2.5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-[10px] rounded-full ml-4 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all active:scale-95">
              Đăng nhập
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 lg:pt-48 pb-20 overflow-hidden bg-slate-50/50">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-cyan-400/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:items-center">
            {/* Hero Text */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm">
                <Tag size={12} className="fill-blue-600/20" />
                Siêu phẩm công nghệ 2026
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-[1] mb-8 text-slate-900 tracking-tighter italic uppercase">
                Nâng tầm <br />
                <span className="text-blue-600">Thế giới Số</span>
              </h1>
              <p className="text-base md:text-lg text-slate-500 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-bold italic">
                Khám phá bộ sưu tập thiết bị công nghệ tinh tuyển. Thiết kế đột phá cho lối sống hiện đại.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4">
                <button 
                  className="px-10 py-5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 hover:scale-105 transition-all shadow-2xl shadow-blue-500/30 group"
                  onClick={() => window.location.href = '/admin'}
                >
                  Mua ngay ngay <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black italic uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                  Thông số chi tiết
                </button>
              </div>

              {/* Stats/Badges */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 mt-20 pt-12 border-t border-slate-200/60 max-w-md mx-auto lg:mx-0">
                {[
                  { label: "Sản phẩm", value: "2K+", icon: <ProductIcon size={18} /> },
                  { label: "Đánh giá", value: "15K+", icon: <ShieldCheck size={18} className="text-blue-600" /> },
                  { label: "Bảo hành", value: "100%", icon: <Smartphone size={18} className="text-blue-600" /> },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center lg:items-start gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      {stat.icon} <span className="text-slate-900 text-xl font-black tracking-tighter">{stat.value}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest italic">{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image / Placeholder */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="relative hidden sm:block lg:block"
            >
              <div className="aspect-square relative flex items-center justify-center p-8 lg:p-12">
                 <div className="absolute inset-0 bg-blue-50 rounded-[4rem] rotate-6 border border-blue-100" />
                 <div className="absolute inset-0 bg-white shadow-2xl shadow-slate-200 rounded-[4rem] -rotate-3 border border-slate-100" />
                 
                 <div className="w-full h-full bg-slate-50 rounded-[3rem] overflow-hidden flex items-center justify-center group relative border border-slate-100">
                    <Cpu size={140} className="text-blue-400 opacity-20 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute bottom-12 left-12 p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl max-w-[280px]">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                             <Tag size={20} className="text-white fill-white" />
                        </div>
                        <p className="text-slate-900 text-lg font-black mb-1 italic uppercase tracking-tighter">Hiệu năng PRO MAX</p>
                        <p className="text-slate-500 text-[10px] italic font-black uppercase tracking-widest leading-relaxed">Bộ vi xử lý thế hệ 2026 mạnh nhất lịch sử.</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="pt-24 pb-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20 text-center sm:text-left">
            <div className="sm:col-span-2">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-8">
                    <LogoIcon size={32} />
                    <span className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">TECHHUB</span>
                </div>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-bold italic mb-10">
                    Thị trường công nghệ cao cấp hàng đầu Việt Nam. Cung cấp những thiết bị điện tử mới nhất, bền nhất cho mọi nhu cầu.
                </p>
                <div className="flex justify-center sm:justify-start gap-4">
                    {[Facebook, Twitter, Instagram, Github].map((Icon, i) => (
                      <a key={i} href="#" className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                        <Icon size={20} />
                      </a>
                    ))}
                </div>
            </div>
            {[
              { title: "Khám phá", links: ["Mới nhất", "Bán chạy", "Ưu đãi"] },
              { title: "Hỗ trợ", links: ["Vận chuyển", "Trả hàng", "Bảo mật"] },
              { title: "Về chúng tôi", links: ["Lịch sử", "Tuyển dụng", "Liên hệ"] }
            ].map((section) => (
              <div key={section.title}>
                <h5 className="text-slate-900 font-black mb-8 italic uppercase tracking-widest text-[10px]">{section.title}</h5>
                <ul className="flex flex-col gap-5 text-slate-400 text-xs font-black uppercase italic tracking-wider">
                    {section.links.map(link => (
                      <li key={link}><a href="#" className="hover:text-blue-600 transition-colors">{link}</a></li>
                    ))}
                </ul>
              </div>
            ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
            <p>© 2026 Đồ án tốt nghiệp TechHub. Sáng tạo bởi Hoàn.</p>
            <div className="flex gap-8">
                <span className="text-emerald-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Server Ổn định
                </span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Storefront;
