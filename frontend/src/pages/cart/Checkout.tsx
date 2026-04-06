import React, { useState } from 'react';

import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

const Checkout: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState('vnpay');

  const cartItems = [
    { id: 1, name: "Apple Watch Series 9", price: 9990000, quantity: 1 },
    { id: 2, name: "Garmin Venu 3", price: 11490000, quantity: 2 },
  ];

  const subtotal = 32970000;
  const shipping = 0;

  return (
    <MainLayout>
      <div className="pt-32 pb-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <Link to="/cart" className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                <ArrowLeft size={20} />
            </Link>
            <div>
               <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight italic uppercase">Thanh toán</h1>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Hoàn tất đơn hàng công nghệ của bạn</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <section className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <Truck size={20} />
                   </div>
                   <h3 className="text-xl font-black italic uppercase tracking-tighter">Thông tin giao hàng</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Họ và tên</label>
                    <input type="text" placeholder="Nguyễn Văn An" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold italic" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Số điện thoại</label>
                    <input type="tel" placeholder="0987-XXX-XXX" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold italic" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Địa chỉ nhận hàng</label>
                    <input type="text" placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP. HCM" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold italic" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Ghi chú (Tùy chọn)</label>
                    <textarea rows={3} placeholder="Giao giờ hành chính, gọi trước khi đến..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold italic resize-none" />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <CreditCard size={20} />
                   </div>
                   <h3 className="text-xl font-black italic uppercase tracking-tighter">Phương thức thanh toán</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'vnpay', name: 'VNPay', desc: 'Thanh toán qua mã QR / Thẻ nội địa' },
                    { id: 'cod', name: 'COD', desc: 'Thanh toán khi nhận hàng' },
                  ].map((method) => (
                    <button 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${paymentMethod === method.id ? 'border-blue-600 bg-blue-50/10' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}
                    >
                       {paymentMethod === method.id && <div className="absolute top-4 right-4 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"><ShieldCheck size={12} className="text-white" /></div>}
                       <p className="font-black italic uppercase tracking-tight text-slate-900 mb-1">{method.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 italic">{method.desc}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black italic uppercase tracking-widest text-slate-900 mb-8 pb-6 border-b border-slate-50">Đơn hàng của bạn</h3>
                
                <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                   {cartItems.map((item) => (
                     <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                           <Smartphone size={24} className="text-slate-300" />
                        </div>
                        <div className="flex-1">
                           <p className="text-xs font-black italic uppercase tracking-tight text-slate-900 truncate max-w-[120px]">{item.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 italic">Số lượng: {item.quantity}</p>
                        </div>
                        <p className="text-xs font-black italic">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                     </div>
                   ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                   <div className="flex justify-between text-xs font-black uppercase tracking-widest italic text-slate-400">
                      <span>Tạm tính</span>
                      <span className="text-slate-900">{subtotal.toLocaleString('vi-VN')}₫</span>
                   </div>
                   <div className="flex justify-between text-xs font-black uppercase tracking-widest italic text-slate-400">
                      <span>Vận chuyển</span>
                      <span className="text-emerald-500">Miễn phí</span>
                   </div>
                   <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100">
                      <span className="text-sm font-black uppercase tracking-widest italic text-slate-900">Tổng cộng</span>
                      <span className="text-2xl font-black italic tracking-tighter text-blue-600">{(subtotal + shipping).toLocaleString('vi-VN')}₫</span>
                   </div>
                </div>

                <button className="w-full mt-10 py-5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                   Xác nhận đặt hàng <ChevronRight size={18} />
                </button>

                <div className="mt-6 flex items-center justify-center gap-3 text-slate-400">
                   <ShieldCheck size={14} className="text-blue-600" />
                   <span className="text-[10px] font-black uppercase tracking-widest italic">An toàn & Bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
