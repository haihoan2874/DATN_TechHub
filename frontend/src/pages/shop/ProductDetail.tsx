import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Plus,
  Minus,
  Watch,
  HeartPulse,
  Activity,
  Battery,
  Waves,
  Navigation
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';

const ProductDetail: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [selectedColor, setSelectedColor] = useState('Graphite');

  const product = {
    name: "Apple Watch Series 9",
    price: 9990000,
    rating: 4.8,
    reviews: 856,
    description: "Chip S9 mạnh mẽ nhất. Thao tác chạm hai lần kỳ diệu. Theo dõi nhịp tim, oxy trong máu và theo dõi giấc ngủ chuyên sâu để bạn thấu hiểu cơ thể mình hơn.",
    colors: ["Midnight", "Starlight", "Silver", "Product Red", "Graphite"],
    specs: [
      { icon: <HeartPulse size={20} />, label: "Sức khỏe", value: "Nhịp tim, ECG, SpO2" },
      { icon: <Activity size={20} />, label: "Vận động", value: "Hơn 50 chế độ tập" },
      { icon: <Battery size={20} />, label: "Thời lượng Pin", value: "Lên đến 18 giờ" },
      { icon: <Waves size={20} />, label: "Kháng nước", value: "WR50 (50 mét)" },
      { icon: <Navigation size={20} />, label: "Định vị", value: "GPS L1 tích hợp" },
    ]
  };

  return (
    <MainLayout>
      <div className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-12 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
            <a href="/" className="hover:text-blue-600">Trang chủ</a>
            <ChevronRight size={12} />
            <a href="/shop" className="hover:text-blue-600">Đồng hồ thông minh</a>
            <ChevronRight size={12} />
            <span className="text-slate-900">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 lg:items-start">
            {/* Left: Image Gallery */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center relative overflow-hidden group shadow-2xl shadow-slate-200/50"
              >
                <div className="absolute top-6 left-6 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest italic z-10">
                    Sản phẩm khuyên dùng
                </div>
                <Watch size={180} className="text-blue-600 opacity-20 group-hover:scale-110 transition-transform duration-1000" />
              </motion.div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-slate-50 border border-slate-200 rounded-3xl hover:border-blue-500 cursor-pointer transition-all flex items-center justify-center">
                    <Watch size={24} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight italic uppercase">{product.name}</h1>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} size={14} fill={i <= 4 ? "currentColor" : "none"} />
                            ))}
                        </div>
                        <span className="text-xs font-black text-slate-400 italic">({product.reviews} đánh giá)</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200" />
                    <span className="text-emerald-500 text-xs font-black uppercase tracking-widest italic">Sẵn hàng tại kho</span>
                </div>
              </div>

              <div className="mb-10 text-center sm:text-left">
                  <p className="text-4xl font-black text-blue-600 tracking-tighter mb-4">{product.price.toLocaleString('vi-VN')}₫</p>
                 <p className="text-slate-500 text-sm leading-relaxed font-bold italic max-w-md">{product.description}</p>
              </div>

              <div className="space-y-10 mb-12">
                {/* Color Selector */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Chọn màu yêu thích: <span className="text-slate-900">{selectedColor}</span></span>
                  <div className="flex flex-wrap gap-4">
                    {product.colors.map((color) => (
                      <button 
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all p-1 ${selectedColor === color ? 'border-blue-600' : 'border-transparent hover:border-slate-300'}`}
                      >
                         <div className={`w-full h-full rounded-full border border-slate-100 shadow-inner bg-slate-200`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-4">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Số lượng</span>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-2">
                         <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Minus size={16} /></button>
                         <span className="w-12 text-center font-black italic">{quantity}</span>
                         <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Plus size={16} /></button>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="flex-1 py-5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 group">
                  Mua ngay <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="flex-1 py-5 bg-slate-50 text-slate-900 border border-slate-200 font-black italic uppercase tracking-widest text-xs rounded-2xl hover:bg-white hover:border-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                  <ShoppingCart size={18} className="text-blue-600" /> Thêm vào giỏ
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-slate-50/50 border border-slate-100 rounded-3xl">
                 {[
                   { icon: <ShieldCheck size={20} />, text: "Bảo hành 12T" },
                   { icon: <Truck size={20} />, text: "Giao hàng 2h" },
                   { icon: <RotateCcw size={20} />, text: "Đổi trả 1-1" },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
                      <div className="text-blue-600">{item.icon}</div>
                      {item.text}
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Detailed Tabs */}
          <div className="mt-32">
             <div className="flex gap-12 border-b border-slate-100 mb-12 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'specs', label: 'Theo dõi Sức khỏe' },
                  { id: 'details', label: 'Tính năng chính' },
                  { id: 'reviews', label: 'Cảm nhận người dùng' },
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-6 text-xs font-black uppercase tracking-widest italic relative transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab.label}
                    {activeTab === tab.id && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                  </button>
                ))}
             </div>

             <div className="max-w-4xl">
                 {activeTab === 'specs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {product.specs.map((spec, i) => (
                         <div key={i} className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                               {spec.icon}
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">{spec.label}</p>
                               <p className="text-slate-900 font-black italic">{spec.value}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 )}
                 {activeTab !== 'specs' && (
                    <div className="p-12 bg-slate-50 rounded-[3rem] text-center italic text-slate-400 font-bold">
                        Đang chuẩn bị nội dung chăm sóc sức khỏe cho bạn...
                    </div>
                 )}
             </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
