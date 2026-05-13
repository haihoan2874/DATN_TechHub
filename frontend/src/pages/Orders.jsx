import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, CheckCircle2, Package, Search,
  ArrowRight, Zap, TrendingUp, Calendar, CreditCard, Star
} from 'lucide-react';
import orderService from '../services/orderService';
import productService from '../services/productService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    setCancelSubmitting(true);
    try {
      await orderService.cancelOrder(cancelTarget.id);
      toast.success('Hủy đơn hàng thành công');
      setCancelTarget(null);
      await fetchOrders();
    } catch (error) {
      console.error('Failed to cancel order', error);
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng vào lúc này.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const openReviewModal = (order, item) => {
    setReviewTarget({ orderId: order.id, productId: item.productId, productName: item.productName });
    setReviewRating(0);
    setReviewComment('');
  };

  const closeReviewModal = () => {
    if (reviewSubmitting) return;
    setReviewTarget(null);
    setReviewRating(0);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget) return;
    if (!reviewRating) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    setReviewSubmitting(true);
    try {
      await productService.createReview(reviewTarget.productId, {
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      toast.success('Cảm ơn bạn đã đánh giá sản phẩm');
      setReviewTarget(null);
      setReviewRating(0);
      setReviewComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá vào lúc này');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'CONFIRMED': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'SHIPPED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'DELIVERED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Đang chờ';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PROCESSING': return 'Đang xử lý';
      case 'SHIPPED': return 'Đang giao';
      case 'DELIVERED': return 'Đã giao';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const stats = [
    { label: 'Tổng đơn hàng', value: orders.length, icon: <Package size={18} />, color: 'blue' },
    { label: 'Đang xử lý', value: orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)).length, icon: <Zap size={18} />, color: 'amber' },
    { label: 'Hoàn thành', value: orders.filter(o => o.status === 'DELIVERED').length, icon: <CheckCircle2 size={18} />, color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] pt-24 lg:pt-32 pb-20 relative overflow-hidden">
      <Modal
        isOpen={Boolean(reviewTarget)}
        onClose={closeReviewModal}
        title="Đánh giá sản phẩm"
        size="md"
        closeOnOverlay={!reviewSubmitting}
        footer={
          <>
            <Button variant="ghost" onClick={closeReviewModal} disabled={reviewSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmitReview} isLoading={reviewSubmitting}>
              Gửi đánh giá
            </Button>
          </>
        }
      >
        {reviewTarget && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sản phẩm</p>
              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{reviewTarget.productName}</h4>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Số sao</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                      star <= reviewRating
                        ? 'bg-amber-50 border-amber-200 text-amber-500'
                        : 'bg-slate-50 border-slate-100 text-slate-300 hover:text-amber-400'
                    }`}
                  >
                    <Star size={24} fill={star <= reviewRating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-comment" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Nội dung
              </label>
              <textarea
                id="review-comment"
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                rows={5}
                maxLength={1000}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                className="w-full rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-500/5 resize-none"
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelOrder}
        title="Xác nhận hủy đơn"
        message={`Bạn có chắc chắn muốn hủy đơn ${cancelTarget?.orderNumber || cancelTarget?.id || ''}? Hệ thống chỉ cho phép hủy đơn đang chờ xử lý.`}
        confirmText="Hủy đơn"
        variant="danger"
        isLoading={cancelSubmitting}
      />

      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 bg-blue-50 w-fit px-4 py-2 rounded-full border border-blue-100"
            >
              <TrendingUp size={14} />
              <span>Theo dõi mua sắm</span>
            </motion.div>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <h1 className="text-4xl lg:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">
                  Lịch sử <span className="text-blue-600">Đơn hàng</span>
                </h1>
                <p className="text-slate-500 font-medium max-w-lg">
                  Quản lý và theo dõi hành trình các sản phẩm công nghệ đỉnh cao mà bạn đã sở hữu tại S-Life.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="hidden sm:grid grid-cols-3 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-3xl border border-white shadow-sm flex flex-col gap-2 min-w-[120px]">
                      <div className={`text-${stat.color}-500`}>{stat.icon}</div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                        <p className="text-xl font-black text-slate-900">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white sticky top-24 z-40 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-grow p-1">
              {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === f 
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {f === 'ALL' ? 'Tất cả' : getStatusText(f)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-white/50 rounded-[3rem] animate-pulse border border-white" />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-white/70 backdrop-blur-md rounded-[3rem] border border-white shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                  >
                    <div className="p-8 lg:p-10">
                      <div className="flex flex-wrap items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center font-black shadow-lg shadow-slate-900/20">
                            #{order.id.toString().slice(-4)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn hàng</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span className="text-[10px] font-black text-slate-900">ORD-{order.id}</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                 <Calendar size={14} className="text-slate-400" />
                                 {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                               </div>
                               <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                 <CreditCard size={14} className="text-slate-400" />
                                 {order.paymentMethod || 'COD'}
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className={`px-5 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-[0.15em] ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-8 flex flex-col md:flex-row md:items-center gap-8">
                           <div className="flex -space-x-6 hover:-space-x-2 transition-all duration-500 p-2">
                             {order.orderItems?.slice(0, 3).map((item, i) => (
                               <motion.div 
                                 key={i} 
                                 whileHover={{ y: -10, scale: 1.1, rotate: 5 }}
                                 className="w-20 h-20 rounded-3xl border-4 border-white bg-slate-50 overflow-hidden shadow-xl relative z-[10-i]"
                               >
                                 <img src={item.productImageUrl || '/logo_final.png'} alt="Product" className="w-full h-full object-contain p-2" />
                               </motion.div>
                             ))}
                             {order.orderItems?.length > 3 && (
                               <div className="w-20 h-20 rounded-3xl border-4 border-white bg-slate-900 text-white flex items-center justify-center text-[11px] font-black shadow-xl relative z-0">
                                 +{order.orderItems.length - 3}
                               </div>
                             )}
                           </div>

                           <div className="flex-grow">
                             <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 line-clamp-1">
                               {order.orderItems?.[0]?.productName || 'Kiện hàng công nghệ'}
                             </h4>
                             <p className="text-sm font-medium text-slate-500">
                               Số lượng: <span className="text-slate-900 font-bold">{order.orderItems?.reduce((acc, curr) => acc + curr.quantity, 0)} sản phẩm</span>
                             </p>
                             <div className="mt-4 flex flex-wrap gap-2">
                                {order.orderItems?.slice(0, 2).map((item, i) => (
                                  <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100">
                                    {item.productName}
                                  </span>
                                ))}
                             </div>
                             {order.status === 'DELIVERED' && (
                               <div className="mt-5 flex flex-wrap gap-2">
                                 {order.orderItems?.map((item, i) => (
                                   <button
                                     key={`${order.id}-${item.productId || i}`}
                                     type="button"
                                     onClick={() => openReviewModal(order, item)}
                                     className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-600 transition-all hover:border-amber-200 hover:bg-amber-100"
                                   >
                                     <Star size={13} />
                                     Đánh giá {item.productName}
                                   </button>
                                 ))}
                               </div>
                             )}
                           </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col items-center lg:items-end gap-6 pt-8 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100">
                           <div className="text-center lg:text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng</p>
                             <p className="text-3xl font-black text-blue-600 tracking-tight">{formatPrice(order.totalAmount)}</p>
                           </div>
                           
                           <div className="flex items-center gap-3 w-full lg:w-fit">
                             {order.status === 'PENDING' && (
                               <button
                                 onClick={() => setCancelTarget(order)}
                                 className="flex-grow lg:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-rose-50 text-rose-600 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-xl shadow-rose-900/5 active:scale-95"
                               >
                                 Hủy đơn
                               </button>
                             )}
                             <button 
                               onClick={() => navigate(`/order-success/${order.id}`)}
                               className="flex-grow lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                             >
                               Chi tiết <ArrowRight size={16} />
                             </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 bg-white/50 backdrop-blur-md rounded-[4rem] border-2 border-dashed border-slate-200"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                <div className="absolute inset-0 bg-blue-600/5 animate-ping rounded-full" />
                <ShoppingBag size={40} className="text-slate-200 relative z-10" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Giỏ hàng đang trống</h3>
              <p className="text-slate-500 font-medium mb-12 max-w-sm mx-auto leading-relaxed">
                Bạn chưa thực hiện bất kỳ giao dịch nào. Đừng bỏ lỡ những siêu phẩm công nghệ đang chờ đón bạn!
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/shop')} 
                className="px-12 rounded-[2rem]"
                icon={ArrowRight}
              >
                Bắt đầu mua sắm ngay
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
