import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ChevronRight,
  Tag,
  Activity,
  HeartPulse,
  Watch,
  ArrowRight
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate, Link } from 'react-router-dom';

const Storefront: React.FC = () => {
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
    { id: '1', name: "Apple Watch Series 9", price: 9990000, image: <Watch size={40} className="text-blue-600" />, category: "Smartwatch" },
    { id: '2', name: "Garmin Venu 3", price: 11490000, image: <Activity size={40} className="text-emerald-500" />, category: "Performance" },
    { id: '3', name: "Xiaomi Band 8", price: 1290000, image: <HeartPulse size={40} className="text-rose-500" />, category: "Fitness Band" },
    { id: '4', name: "Dây đeo Sport Band", price: 750000, image: <Tag size={40} className="text-slate-400" />, category: "Accessories" },
  ];

  return (
    <MainLayout>
      <div className="overflow-x-hidden">
        {/* Hero Section */}
        <main className="relative pt-32 lg:pt-48 pb-20 overflow-hidden bg-slate-50/50">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-blue-400/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 lg:items-center">
              {/* Hero Text */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm">
                  <HeartPulse size={12} className="fill-emerald-600/20" />
                  {isLoggedIn ? `Chào mừng trở lại, ${username}` : "Bạn khỏe hơn mỗi ngày"}
                </div>
                <h1 className="text-5xl md:text-7xl font-black leading-[1] mb-8 text-slate-900 tracking-tighter italic uppercase">
                  {isLoggedIn ? <>Mua sắm <br /> <span className="text-blue-600">Thông minh</span></> : <>Kiến tạo <br /> <span className="text-blue-600">Lối sống Khỏe</span></>}
                </h1>
                <p className="text-base md:text-lg text-slate-500 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-bold italic">
                  {isLoggedIn 
                    ? "Chào mừng bạn trở lại. Khám phá kho thiết bị sức khỏe mới nhất và nhận các gợi ý mua sắm thông minh từ trợ lý AI." 
                    : "Khám phá những thiết bị đeo thông minh giúp bạn thấu hiểu cơ thể và cải thiện sức khỏe một cách giản đơn nhất."}
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4">
                  <button 
                    className="px-10 py-5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 hover:scale-105 transition-all shadow-2xl shadow-blue-500/30 group"
                    onClick={() => navigate('/shop')}
                  >
                    {isLoggedIn ? "Sắm ngay ưu đãi" : "Bắt đầu ngay"} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  {isLoggedIn && (
                    <button className="px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black italic uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                      Đơn hàng của tôi
                    </button>
                  )}
                  {!isLoggedIn && (
                    <button className="px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black italic uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                      Tìm hiểu thêm
                    </button>
                  )}
                </div>

                {/* Stats/Badges */}
                <div className="grid grid-cols-3 gap-4 md:gap-8 mt-20 pt-12 border-t border-slate-200/60 max-w-md mx-auto lg:mx-0">
                  {[
                    { label: "Khách hàng", value: "5K+", icon: <ShieldCheck size={18} className="text-blue-600" /> },
                    { label: "Đánh giá", value: "4.9/5", icon: <HeartPulse size={18} className="text-rose-500" /> },
                    { label: "Chuyên gia", value: "24/7", icon: <Activity size={18} className="text-emerald-500" /> },
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

              {/* Hero Image Area */}
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
                      <Watch size={140} className="text-blue-400 opacity-20 group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute bottom-12 left-12 p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl max-w-[280px]">
                          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
                               <HeartPulse size={20} className="text-white" />
                          </div>
                          <p className="text-slate-900 text-lg font-black mb-1 italic uppercase tracking-tighter">Thấu hiểu Trái tim</p>
                          <p className="text-slate-500 text-[10px] italic font-black uppercase tracking-widest leading-relaxed">Theo dõi nhịp tim và giấc ngủ 24/7 một cách nhẹ nhàng.</p>
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
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight italic uppercase mb-4">Lựa chọn cho bạn</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Thiết bị phù hợp với mọi nhu cầu vận động</p>
                 </div>
                 <Link to="/shop" className="group flex items-center gap-3 text-blue-600 font-black italic uppercase tracking-widest text-[10px] hover:translate-x-1 transition-transform">
                    Xem tất cả <ArrowRight size={16} />
                 </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {featuredProducts.map((product) => (
                   <motion.div 
                    key={product.id}
                    whileHover={{ y: -10 }}
                    className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                   >
                      <div className="aspect-square bg-white border border-slate-100 rounded-3xl flex items-center justify-center mb-8 relative overflow-hidden">
                        <div className="absolute top-4 left-4 px-3 py-1 bg-slate-100 rounded-full text-[8px] font-black uppercase tracking-widest italic text-slate-400">
                           {product.category}
                        </div>
                        <div className="group-hover:scale-110 transition-transform duration-700">
                           {product.image}
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 mb-2 italic uppercase tracking-widest group-hover:text-blue-600 transition-colors">{product.name}</h4>
                      <p className="text-blue-600 font-black italic">{product.price.toLocaleString('vi-VN')}₫</p>
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
