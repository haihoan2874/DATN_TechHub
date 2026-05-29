import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Package,
  ReceiptText,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import EmptyState from '../components/feedback/EmptyState';
import StatusBadge from '../components/status/StatusBadge';
import orderService from '../services/orderService';
import { getOrderStatusLabel } from '../constants/orderStatus';

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

const formatDateTime = (value) => {
  if (!value) return '---';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

const splitShippingAddress = (shippingAddress) => {
  if (!shippingAddress) return ['---'];
  return shippingAddress.split('||').map((part) => part.trim()).filter(Boolean);
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderDetail(id);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order detail', error);
        toast.error('Không thể tải chi tiết đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const shippingParts = useMemo(() => splitShippingAddress(order?.shippingAddress), [order?.shippingAddress]);
  const itemCount = useMemo(() => {
    return order?.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0;
  }, [order?.items]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 py-12">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-slate-50 py-12">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white">
            <EmptyState
              icon={ReceiptText}
              title="Không tìm thấy đơn hàng"
              description="Đơn hàng không tồn tại hoặc bạn không có quyền xem đơn hàng này."
            />
            <div className="flex justify-center pb-8">
              <Button onClick={() => navigate('/orders')} icon={ArrowLeft}>
                Quay lại lịch sử đơn hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Quay lại lịch sử đơn hàng
        </button>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 lg:text-2xl">
                  Đơn {order.orderNumber || `#${order.id}`}
                </h1>
                <StatusBadge tone={statusTone[order.status] || 'slate'}>
                  {getOrderStatusLabel(order.status)}
                </StatusBadge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={15} />
                  {formatDateTime(order.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CreditCard size={15} />
                  {order.paymentMethod || 'COD'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Package size={15} />
                  {itemCount} sản phẩm
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-left lg:text-right">
              <p className="text-sm font-medium text-blue-700">Tổng thanh toán</p>
              <p className="mt-1 text-xl font-bold text-blue-700">{formatPrice(order.total)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-bold text-slate-900">Sản phẩm trong đơn hàng</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => (
                <div key={item.id || item.productId} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <img src="/logo_final.png" alt={item.productName} className="h-full w-full object-contain p-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Số lượng: {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">Thành tiền</p>
                    <p className="font-bold text-slate-900">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin size={18} />
                </div>
                <h2 className="font-bold text-slate-900">Địa chỉ nhận hàng</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {shippingParts.map((part, index) => (
                  <p key={`${part}-${index}`} className={index === 0 ? 'font-bold text-slate-900' : ''}>
                    {part}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <ReceiptText size={18} />
                </div>
                <h2 className="font-bold text-slate-900">Thanh toán</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Phương thức</span>
                  <span className="font-semibold text-slate-900">{order.paymentMethod || 'COD'}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                  <span className="font-semibold text-slate-900">Tổng thanh toán</span>
                  <span className="text-lg font-bold text-blue-600">{formatPrice(order.total)}</span>
                </div>
              </div>
              {order.notes && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Ghi chú: </span>
                  {order.notes}
                </div>
              )}
            </section>

            <Button className="w-full" onClick={() => navigate('/shop')} icon={ShoppingBag}>
              Tiếp tục mua sắm
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
