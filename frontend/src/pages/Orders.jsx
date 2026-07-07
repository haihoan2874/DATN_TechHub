import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Package,
  Search,
  ShoppingBag,
  SlidersHorizontal,
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
import { formatCurrency, formatDate } from '../utils/formatters';

const statusTone = {
  PENDING: 'amber',
  PROCESSING: 'blue',
  SHIPPED: 'teal',
  DELIVERED: 'green',
  CANCELLED: 'red'
};

const getOrderTotal = (order) => order.totalAmount ?? order.total ?? 0;

const getItemCount = (order) => {
  return order.orderItems?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0;
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toastTriggered = useRef(false);

  // Xử lý kết quả thanh toán VNPay redirect về
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');
    
    if (paymentStatus && !toastTriggered.current) {
      toastTriggered.current = true; // Đánh dấu là đã hiện toast để không bị lặp đúp trong StrictMode
      if (paymentStatus === 'success') {
        toast.success('Thanh toán VNPay thành công! Đơn hàng đang được xử lý.', { duration: 5000 });
      } else if (paymentStatus === 'failed') {
        toast.error('Thanh toán VNPay thất bại hoặc bị hủy. Vui lòng thử lại.', { duration: 5000 });
      }
      // Dọn query param khỏi URL để không hiển thị lại khi refresh
      navigate('/orders', { replace: true });
    }
  }, [location.search, navigate]);

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

  const processedOrders = useMemo(() => {
    let list = [...orders];

    if (filter !== 'ALL') {
      list = list.filter((order) => order.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((order) => {
        const matchNumber = (order.orderNumber || '').toLowerCase().includes(q);
        const matchId = String(order.id || '').toLowerCase().includes(q);
        const matchItem = order.orderItems?.some((item) =>
          (item.productName || '').toLowerCase().includes(q)
        );
        return matchNumber || matchId || matchItem;
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortBy === 'OLDEST') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortBy === 'HIGHEST_TOTAL') {
        return getOrderTotal(b) - getOrderTotal(a);
      } else if (sortBy === 'LOWEST_TOTAL') {
        return getOrderTotal(a) - getOrderTotal(b);
      }
      return 0;
    });

    return list;
  }, [orders, filter, searchQuery, sortBy]);

  const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedOrders.slice(start, start + itemsPerPage);
  }, [processedOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, sortBy]);

  const stats = useMemo(() => ([
    { label: 'Tổng đơn hàng', value: orders.length, icon: Package, tone: 'blue' },
    {
      label: 'Đang xử lý',
      value: orders.filter((order) => ['PENDING', 'PROCESSING'].includes(order.status)).length,
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
      await fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá vào lúc này');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 lg:py-10">
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

          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-100">
              {['ALL', ...ORDER_STATUS_VALUES].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    filter === status
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {status === 'ALL' ? 'Tất cả đơn hàng' : getOrderStatusLabel(status)}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã đơn hàng, tên sản phẩm..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <SlidersHorizontal size={16} className="text-slate-500" />
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 transition hover:border-slate-300 focus:border-slate-400 focus:outline-none"
                >
                  <option value="NEWEST">Mới nhất trước</option>
                  <option value="OLDEST">Cũ nhất trước</option>
                  <option value="HIGHEST_TOTAL">Giá trị cao nhất</option>
                  <option value="LOWEST_TOTAL">Giá trị thấp nhất</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : processedOrders.length > 0 ? (
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
                <article key={order.id} className="glass-card p-4 sm:p-6 transition-all hover:shadow-md hover:border-slate-300/80">
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
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Calendar size={14} />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <CreditCard size={14} />
                          {order.paymentMethod || 'COD'}
                        </span>
                        <span className="font-semibold text-slate-700">{getItemCount(order)} sản phẩm</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng thanh toán</p>
                      <p className="text-xl font-black text-blue-600">{formatCurrency(getOrderTotal(order))}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="space-y-3 min-w-0">
                      {order.orderItems?.map((item, index) => (
                        <div key={`${order.id}-${item.productId || index}`} className="flex items-center gap-3">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            <img
                              src={item.productImageUrl || '/logo_final.png'}
                              alt={item.productName}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-contain p-1.5"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{item.productName}</p>
                            <p className="text-xs font-medium text-slate-500">
                              SL: {item.quantity} x <span className="font-bold text-slate-700">{formatCurrency(item.price)}</span>
                            </p>
                          </div>
                          {order.status === 'DELIVERED' && (() => {
                            const hasReviewed = item.isReviewed || item.reviewed;
                            return (
                              <button
                                type="button"
                                disabled={hasReviewed}
                                onClick={() => openReviewModal(order, item)}
                                className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                                  hasReviewed
                                    ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm'
                                }`}
                              >
                                {hasReviewed ? 'Đã đánh giá' : 'Đánh giá'}
                              </button>
                            );
                          })()}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:justify-center">
                      {order.status === 'PENDING' && (
                        <Button variant="outline" onClick={() => setCancelTarget(order)} className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold">
                          Hủy đơn
                        </Button>
                      )}
                      <Button onClick={() => navigate(`/orders/${order.id}`)} icon={ArrowRight} iconPosition="right" className="font-bold">
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </article>
              ))}

              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Hiển thị <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
                    <span className="font-bold text-slate-900">
                      {Math.min(currentPage * itemsPerPage, processedOrders.length)}
                    </span>{' '}
                    trong tổng số <span className="font-bold text-slate-900">{processedOrders.length}</span> đơn hàng
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} /> Trang trước
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-9 w-9 rounded-xl text-xs font-black transition ${
                                currentPage === pageNum
                                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          (pageNum === currentPage - 2 && pageNum > 1) ||
                          (pageNum === currentPage + 2 && pageNum < totalPages)
                        ) {
                          return <span key={pageNum} className="px-1 text-xs font-bold text-slate-400">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Trang sau <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
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
