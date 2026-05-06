import React, { useState } from 'react';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { 
  Trash2, Plus, Minus, ShoppingBag, 
  ArrowRight, Trash, ShieldCheck, 
  Truck, CreditCard 
} from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-6 py-20">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-slate-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Giỏ hàng của bạn đang trống</h1>
        <p className="text-slate-500 mb-10 text-center max-w-md">
          Có vẻ như bạn chưa chọn được món đồ nào. Hãy khám phá các thiết bị sức khỏe công nghệ cao của chúng tôi nhé!
        </p>
        <Button 
          variant="primary"
          onClick={() => navigate('/shop')}
        >
          Tiếp tục mua sắm
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 lg:pt-32 pb-12 bg-slate-50">
      <ConfirmModal 
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={() => {
          clearCart();
          setIsConfirmClearOpen(false);
        }}
        title="Xác nhận xóa giỏ hàng"
        message="Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng không?"
        confirmText="Xóa tất cả"
      />
      <div className="container mx-auto px-6">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items List */}
        <div className="lg:w-2/3">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Giỏ hàng</h1>
            <button 
              onClick={() => setIsConfirmClearOpen(true)}
              className="text-slate-400 hover:text-blue-600 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors"
            >
              <Trash size={16} /> Xóa tất cả
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card p-4 sm:p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center shadow-sm relative"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                    <img 
                      src={item.imageUrl || '/logo_final.png'} 
                      alt={item.name} 
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  
                  <div className="flex-grow w-full sm:w-auto">
                    <Link to={`/product/${item.slug}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-base sm:text-lg block mb-1">
                      {item.name}
                    </Link>
                    <div className="text-blue-600 font-bold text-sm sm:text-base">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className="flex items-center gap-3 bg-slate-100/50 rounded-xl p-1 border border-slate-200">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5 sm:hidden">Thành tiền</div>
                      <div className="font-black text-slate-900 text-sm sm:text-base">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-300 hover:text-blue-500 transition-colors absolute top-4 right-4 sm:static"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-100 sticky top-28 shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính</span>
                <span className="font-semibold text-slate-900">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-600 font-bold uppercase tracking-wider">Miễn phí</span>
              </div>
              <div className="h-px bg-slate-100 my-4" />
              <div className="flex justify-between items-end">
                <span className="text-slate-900 font-bold">Tổng cộng</span>
                <span className="text-2xl font-black text-blue-600">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/checkout')}
              className="w-full"
              icon={ArrowRight}
            >
              Thanh toán ngay
            </Button>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <ShieldCheck size={18} className="text-emerald-500" />
                <span>Thanh toán bảo mật 100%</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Truck size={18} className="text-blue-500" />
                <span>Giao hàng nhanh toàn quốc</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <CreditCard size={18} className="text-cyan-500" />
                <span>Hỗ trợ trả góp 0% lãi suất</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Cart;
