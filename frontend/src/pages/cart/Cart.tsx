import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight, 
  ShoppingBag,
  ArrowLeft,
  Smartphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([
    { id: 1, name: "Apple Watch Series 9", price: 9990000, quantity: 1, color: "Graphite" },
    { id: 2, name: "Garmin Venu 3", price: 11490000, quantity: 2, color: "Graphite" },
  ]);

  const updateQuantity = (id: number, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000000 ? 0 : 30000;

  return (
    <MainLayout>
      <div className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
               <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight italic uppercase">Giỏ hàng</h1>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Có {items.length} sản phẩm trong túi của bạn</p>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:scale-105 transition-all italic">
                <ArrowLeft size={16} /> Tiếp tục mua sắm
            </Link>
          </div>

          {items.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {/* List Section */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                    >
                      <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                         <Smartphone size={32} className="text-slate-300" />
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left">
                         <h3 className="text-lg font-black text-slate-900 mb-1 italic uppercase tracking-tight">{item.name}</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Màu: {item.color}</p>
                         <p className="text-blue-600 font-black italic">{item.price.toLocaleString('vi-VN')}₫</p>
                      </div>

                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-2 shrink-0">
                         <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Minus size={14} /></button>
                         <span className="w-10 text-center text-xs font-black italic">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Plus size={14} /></button>
                      </div>

                      <div className="text-right hidden sm:block shrink-0 px-4">
                         <p className="font-black text-slate-900 italic">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                      </div>

                      <button onClick={() => removeItem(item.id)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all opacity-0 group-hover:opacity-100">
                         <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary Section */}
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full -mr-16 -mt-16" />
                
                <h3 className="text-xl font-black mb-10 italic uppercase tracking-widest text-center border-b border-white/10 pb-8">Hóa đơn</h3>
                
                <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest italic text-slate-400">
                       <span>Tạm tính</span>
                       <span className="text-white">{subtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest italic text-slate-400">
                       <span>Phí vận chuyển</span>
                       <span className="text-white">{shipping === 0 ? 'FREE' : `${shipping.toLocaleString('vi-VN')}₫`}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest italic text-slate-400">
                       <span>Thuế (VAT)</span>
                       <span className="text-white">+0₫</span>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 mb-10">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-black uppercase tracking-widest italic text-slate-400">Tổng thanh toán</span>
                       <span className="text-3xl font-black italic tracking-tighter">{(subtotal + shipping).toLocaleString('vi-VN')}₫</span>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-bold italic text-right uppercase">Tiết kiệm được 0₫ hôm nay</p>
                </div>

                <Link to="/checkout">
                  <button className="w-full py-5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 group">
                    Tiến hành thanh toán <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>

                <div className="mt-8 flex items-center justify-center gap-4 opacity-30 grayscale invert">
                   <div className="w-10 h-6 bg-white/20 rounded" />
                   <div className="w-10 h-6 bg-white/20 rounded" />
                   <div className="w-10 h-6 bg-white/20 rounded" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                  <ShoppingBag size={32} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-black text-slate-900 mb-2 italic uppercase tracking-tight">Giỏ hàng trống</h3>
               <p className="text-xs text-slate-400 font-bold mb-10 italic">Hãy chọn cho mình những siêu phẩm công nghệ nhé!</p>
               <button onClick={() => navigate('/shop')} className="px-10 py-4 bg-blue-600 text-white font-black italic uppercase tracking-widest text-[10px] rounded-2xl">
                  Bắt đầu mua sắm
               </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
