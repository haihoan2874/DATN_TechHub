import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ChevronRight,
  Tag,
  Activity,
  HeartPulse,
  Watch,
  ArrowRight,
  Users,
  Star,
  Zap
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate, Link } from 'react-router-dom';

const Storefront = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [username, setUsername] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('slife_token');
    const storedUsername = localStorage.getItem('slife_username');
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUsername || 'Member');
    }
  }, []);

  const featuredProducts = [
    { id: '1', name: "Apple Watch Series 9", price: 10500000, icon: <Watch size={40} className="text-blue-500" />, category: "Smartwatch" },
    { id: '2', name: "Garmin Venu 3", price: 12500000, icon: <Activity size={40} className="text-emerald-500" />, category: "Performance" },
    { id: '3', name: "Xiaomi Band 8", price: 890000, icon: <Zap size={40} className="text-rose-500" />, category: "Fitness Band" },
    { id: '4', name: "Dây đeo Sport Band", price: 1200000, icon: <Tag size={40} className="text-slate-400" />, category: "Accessories" },
  ];

  return (
    <MainLayout>
      <div className="overflow-x-hidden">
        {/* Hero Section */}
        <main className="relative pt-32 lg:pt-48 pb-24 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
          <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-emerald-400/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 lg:items-center">
              {/* Hero Text */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-widest mb-8 shadow-sm">
                  <HeartPulse size={12} className="animate-pulse" />
                  {isLoggedIn ? `Chào mừng trở lại, ${username}` : "Sức khỏe là tinh hoa của cuộc sống"}
                </div>
                <h1 className="text-6xl md:text-8xl font-bold leading-[1.05] mb-8 text-slate-900 tracking-tight">
                  {isLoggedIn ? 
                    <>Mua sắm <span className="text-gradient">Thông minh</span></> : 
                    <>Kiến tạo <span className="text-gradient">Lối sống</span> Elite</>
                  }
                </h1>
                <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-medium">
                  {isLoggedIn 
                    ? "Chào mừng bạn trở lại hệ sinh thái S-Life. Khám phá những công nghệ sức khỏe tiên tiến nhất dành riêng cho bạn." 
                    : "Khám phá những thiết bị đeo thông minh giúp bạn thấu hiểu cơ thể và tối ưu hóa hiệu suất mỗi ngày."}
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4">
                  <button 
                    className="btn-premium group"
                    onClick={() => navigate('/shop')}
                  >
                    {isLoggedIn ? "Sắm ngay ưu đãi" : "Khám phá ngay"} 
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  {isLoggedIn ? (
                    <button 
                      onClick={() => navigate('/profile')}
                      className="btn-outline"
                    >
                      Đơn hàng của tôi
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate('/register')}
                      className="btn-outline"
                    >
                      Tham gia cộng đồng
                    </button>
                  )}
                </div>

                {/* Stats/Badges */}
                <div className="grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-slate-100 max-w-md mx-auto lg:mx-0">
                  {[
                    { label: "Khách hàng", value: "5K+", icon: <Users size={18} className="text-blue-500" /> },
                    { label: "Đánh giá", value: "4.9/5", icon: <Star size={18} className="text-rose-500" /> },
                    { label: "Hỗ trợ", value: "24/7", icon: <ShieldCheck size={18} className="text-emerald-500" /> },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center lg:items-start">
                      <div className="flex items-center gap-2 mb-1">
                        {stat.icon} <span className="text-slate-900 text-xl font-bold tracking-tight">{stat.value}</span>
                      </div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Hero Image Area */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "circOut", delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="aspect-square relative flex items-center justify-center p-12">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-emerald-50 rounded-[4rem] rotate-3 blur-2xl opacity-30" />
                   <div className="absolute inset-0 bg-white shadow-premium rounded-[4rem] -rotate-3 border border-slate-100" />
                   
                   <div className="w-full h-full bg-slate-50 rounded-[3rem] overflow-hidden flex items-center justify-center group relative border border-slate-100">
                      <Watch size={180} className="text-blue-400 opacity-20 group-hover:scale-110 transition-transform duration-[2000ms]" />
                      <div className="absolute bottom-12 left-12 right-12 p-8 glass rounded-3xl border border-white/40">
                          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                               <HeartPulse size={24} className="text-white" />
                          </div>
                          <p className="text-slate-900 text-xl font-bold mb-1 tracking-tight">Thấu hiểu từng nhịp đập</p>
                          <p className="text-slate-500 text-xs font-medium leading-relaxed">Theo dõi sức khỏe 24/7 với công nghệ AI tiên tiến nhất hiện nay.</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Featured Health Devices */}
        <section className="py-32 bg-white">
           <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                 <div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Sản phẩm tiêu biểu</h2>
                    <p className="text-sm font-medium text-slate-400">Được tinh tuyển cho hành trình nâng tầm sức khỏe của bạn</p>
                 </div>
                 <Link to="/shop" className="group flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-[10px] hover:gap-3 transition-all">
                    Xem toàn bộ cửa hàng <ArrowRight size={16} />
                 </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {featuredProducts.map((product) => (
                   <motion.div 
                    key={product.id}
                    whileHover={{ y: -12 }}
                    className="card-premium p-6 group cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                   >
                      <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden group-hover:bg-blue-50 transition-colors duration-500">
                        <div className="absolute top-4 left-4">
                           <span className="tag-premium">{product.category}</span>
                        </div>
                        <div className="group-hover:scale-110 transition-transform duration-700">
                           {product.icon}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                      <p className="text-blue-600 font-bold text-lg">{product.price.toLocaleString('vi-VN')}₫</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Storefront;
