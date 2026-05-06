import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full mx-auto px-6 text-center"
      >
        <div className="relative inline-block mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"
          >
            <Package size={16} />
          </motion.div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Đặt hàng thành công!</h1>
        <p className="text-slate-500 text-lg mb-2">Cảm ơn bạn đã tin tưởng và mua sắm tại S-Life.</p>
        <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-10">
          Mã đơn hàng: #{id || 'SL-889922'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/orders')}
            className="flex-1"
          >
            Theo dõi đơn hàng
          </Button>
          <Button 
            onClick={() => navigate('/shop')}
            className="flex-1"
            icon={ShoppingBag}
          >
            Tiếp tục mua sắm
          </Button>
        </div>

        <div className="mt-12 pt-12 border-t border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
          Một email xác nhận chi tiết đơn hàng đã được gửi tới hòm thư của bạn.
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
