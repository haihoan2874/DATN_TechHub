import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Package,
  ShoppingBag,
  Star,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import orderService from '../services/orderService';
import productService from '../services/productService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import MetricCard from '../components/data/MetricCard';
import EmptyState from '../components/feedback/EmptyState';
import StatusBadge from '../components/status/StatusBadge';
import { getOrderStatusLabel, ORDER_STATUS_VALUES } from '../constants/orderStatus';

const statusTone = {
  PENDING: 'amber',
  CONFIRMED: 'blue',
  PROCESSING: 'blue',
  SHIPPED: 'slate',
  DELIVERED: 'green',
  CANCELLED: 'red'
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));
};

const getOrderTotal = (order) => order.totalAmount ?? order.total ?? 0;

const getItemCount = (order) => {
  return order.orderItems?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0;
};

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

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('Không thể tải lịch sử đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return filter === 'ALL' ? orders : orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  const stats = useMemo(() => ([
    { label: 'Tổng đơn hàng', value: orders.length, icon: Package, tone: 'blue' },
    {
      label: 'Đang xử lý',
      value: orders.filter((order) => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)).length,
      icon: Zap,
      tone: 'amber'
    },
    { label: 'Đã giao', value: orders.filter((order) => order.status === 'DELIVERED').length, icon: CheckCircle2, tone: 'green' }
  ]), [orders]);

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

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-10">
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
              <p className="text-sm font-medium text-slate-500">Sản phẩm</p>
              <h4 className="mt-1 text-lg font-bold text-slate-900">{reviewTarget.productName}</h4>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-500">Số sao đánh giá</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                      star <= reviewRating
                        ? 'border-amber-200 bg-amber-50 text-amber-500'
                        : 'border-slate-200 bg-slate-50 text-slate-300 hover:text-amber-400'
                    }`}
                    aria-label={`Chọn ${star} sao`}
                  >
                    <Star size={22} fill={star <= reviewRating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-comment" className="form-label mb-2 block">
                Nội dung
              </label>
              <textarea
                id="review-comment"
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                rows={5}
                maxLength={1000}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                className="form-textarea"
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

      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Theo dõi trạng thái, hủy đơn chờ xử lý và đánh giá sản phẩm đã giao</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 lg:text-3xl">Lịch sử đơn hàng</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/shop')} icon={ArrowRight} iconPosition="right">
              Tiếp tục mua sắm
            </Button>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <MetricCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['ALL', ...ORDER_STATUS_VALUES].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    filter === status
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {status === 'ALL' ? 'Tất cả' : getOrderStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900">
                          Đơn {order.orderNumber || `#${order.id}`}
                        </h2>
                        <StatusBadge tone={statusTone[order.status] || 'slate'}>
                          {getOrderStatusLabel(order.status)}
                        </StatusBadge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={14} />
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CreditCard size={14} />
                          {order.paymentMethod || 'COD'}
                        </span>
                        <span>{getItemCount(order)} sản phẩm</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-slate-500">Tổng thanh toán</p>
                      <p className="text-xl font-bold text-blue-600">{formatPrice(getOrderTotal(order))}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className="space-y-3">
                      {order.orderItems?.map((item, index) => (
                        <div key={`${order.id}-${item.productId || index}`} className="flex items-center gap-3">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            <img src={item.productImageUrl || '/logo_final.png'} alt={item.productName} className="h-full w-full object-contain p-1.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{item.productName}</p>
                            <p className="text-xs text-slate-500">
                              SL: {item.quantity} x {formatPrice(item.price)}
                            </p>
                          </div>
                          {order.status === 'DELIVERED' && (
                            <button
                              type="button"
                              onClick={() => openReviewModal(order, item)}
                              className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                            >
                              Đánh giá
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                      {order.status === 'PENDING' && (
                        <Button variant="outline" onClick={() => setCancelTarget(order)} className="border-rose-200 text-rose-600 hover:bg-rose-50">
                          Hủy đơn
                        </Button>
                      )}
                      <Button onClick={() => navigate(`/orders/${order.id}`)} icon={ArrowRight} iconPosition="right">
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white">
              <EmptyState
                icon={ShoppingBag}
                title="Chưa có đơn hàng"
                description="Khi bạn đặt hàng thành công, đơn hàng sẽ xuất hiện tại đây để theo dõi trạng thái."
              />
              <div className="flex justify-center pb-8">
                <Button onClick={() => navigate('/shop')} icon={ArrowRight} iconPosition="right">
                  Bắt đầu mua sắm
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
