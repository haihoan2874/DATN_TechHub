import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Package, 
  Home, 
  ShoppingBag,
  CreditCard,
  MapPin
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { useNavigate, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId || "SL-9824-X12"; // Mock or real ID

  return (
    <MainLayout>
      <div className="pt-32 pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="max-w-3xl w-full px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full" />

            {/* Success Icon */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-emerald-100 shadow-inner"
            >
              <CheckCircle2 size={48} className="text-emerald-500" />
            </motion.div>

            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase mb-4">Thanh toán Thành công!</h1>
            <p className="text-slate-500 font-bold italic mb-10 max-w-md mx-auto">
              Cảm ơn bạn đã tin chọn S-Life. Đơn hàng của bạn đang được chuẩn bị để bắt đầu hành trình chăm sóc sức khỏe.
            </p>

            {/* Order Brief */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white transition-colors">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                       <Package size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Mã đơn hàng</span>
                 </div>
                 <p className="text-slate-900 font-black italic uppercase tracking-tighter text-lg">{orderId}</p>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white transition-colors">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                       <CreditCard size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Phương thức</span>
                 </div>
                 <p className="text-slate-900 font-black italic uppercase tracking-tighter text-lg">Chuyển khoản</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/')}
                className="px-10 py-5 bg-slate-900 text-white font-black italic uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
              >
                <Home size={18} /> Về Trang chủ
              </button>
              <button 
                onClick={() => navigate('/shop')}
                className="px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black italic uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
              >
                <ShoppingBag size={18} /> Tiếp tục mua sắm
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 italic">
               <MapPin size={12} /> Giao hàng dự kiến: 2-3 ngày làm việc
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderSuccess;
