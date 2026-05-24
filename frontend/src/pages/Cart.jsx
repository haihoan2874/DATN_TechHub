import React, { useState } from 'react';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  Trash2, Plus, Minus, ShoppingBag, 
  ArrowRight, Trash, ShieldCheck, 
  Truck, CreditCard 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setIsConfirmClearOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa giỏ hàng');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 pt-24 lg:pt-32">
        <div className="container mx-auto flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400">
            <ShoppingBag size={30} />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-slate-900">Giỏ hàng đang trống</h1>
          <p className="mb-8 max-w-md text-sm leading-6 text-slate-500">
            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy chọn sản phẩm phù hợp rồi quay lại thanh toán.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/shop')}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 lg:pt-32 pb-12 bg-slate-50">
      <ConfirmModal 
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={handleClearCart}
        title="Xác nhận xóa giỏ hàng"
        message="Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng không?"
        confirmText="Xóa tất cả"
      />
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="lg:w-2/3">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{cartItems.length} sản phẩm trong giỏ</p>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">Giỏ hàng</h1>
              </div>
              <button
                onClick={() => setIsConfirmClearOpen(true)}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash size={16} />
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-5"
                >
                  <div className="mx-auto h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:mx-0 sm:h-24 sm:w-24">
                    <img 
                      src={item.imageUrl || '/logo_final.png'} 
                      alt={item.name} 
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  
                  <div className="flex-grow w-full sm:w-auto">
                    <Link to={`/product/${item.slug}`} className="mb-1 block text-base font-semibold text-slate-900 transition-colors hover:text-blue-600 sm:text-lg">
                      {item.name}
                    </Link>
                    <div className="text-sm font-semibold text-blue-600 sm:text-base">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={item.quantity <= 1}
                        aria-label="Giảm số lượng"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white"
                        aria-label="Tăng số lượng"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <div className="mb-0.5 text-[11px] font-semibold uppercase text-slate-400 sm:hidden">Thành tiền</div>
                      <div className="text-sm font-bold text-slate-900 sm:text-base">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute right-4 top-4 rounded-lg p-2 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 sm:static"
                      aria-label="Xóa sản phẩm khỏi giỏ"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Tóm tắt đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-slate-900">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                </div>
                <div className="h-px bg-slate-100 my-4" />
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-slate-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-blue-600">
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
                  <span>Hỗ trợ thanh toán COD hoặc trực tuyến</span>
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
