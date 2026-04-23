import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, MapPin, CreditCard, Calendar, ShoppingBag } from 'lucide-react';
import apiClient from '../../../api/axios';

const OrderDetailModal = ({ isOpen, onClose, orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'SHIPPED': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 lg:p-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-full"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">Chi tiết đơn hàng</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic mt-1">Mã đơn: {order?.orderNumber || '...'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Đang tải dữ liệu...</p>
              </div>
            ) : order && (
              <div className="overflow-y-auto p-8 space-y-10">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4 text-slate-400 capitalize italic font-black text-[10px] tracking-widest">
                            <Calendar size={14} /> Ngày đặt
                        </div>
                        <p className="text-slate-900 font-bold italic">{new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4 text-slate-400 capitalize italic font-black text-[10px] tracking-widest">
                            <CreditCard size={14} /> Thanh toán
                        </div>
                        <p className="text-slate-900 font-bold italic uppercase">{order.paymentMethod}</p>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4 text-slate-400 capitalize italic font-black text-[10px] tracking-widest">
                            <ShoppingBag size={14} /> Tổng tiền
                        </div>
                        <p className="text-blue-600 font-black text-xl italic">${order.total?.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4 text-slate-400 capitalize italic font-black text-[10px] tracking-widest">
                            <Package size={14} /> Trạng thái
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black italic uppercase border ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Shipping & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">📍 Địa chỉ giao hàng</h4>
                        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <p className="text-slate-600 font-medium italic leading-relaxed">{order.shippingAddress}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">📝 Ghi chú từ khách hàng</h4>
                        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm min-h-[100px]">
                            <p className="text-slate-400 italic text-sm">{order.notes || 'Không có ghi chú nào.'}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">🛒 Danh sách sản phẩm</h4>
                    <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-black uppercase italic tracking-widest text-slate-400 border-b border-slate-100">
                                    <th className="px-6 py-4">Sản phẩm</th>
                                    <th className="px-6 py-4 text-center">Số lượng</th>
                                    <th className="px-6 py-4 text-right">Đơn giá</th>
                                    <th className="px-6 py-4 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {order.items?.map((item) => (
                                    <tr key={item.id} className="text-sm font-medium italic">
                                        <td className="px-6 py-4 text-slate-900 font-black uppercase tracking-tight">{item.productName}</td>
                                        <td className="px-6 py-4 text-center font-bold">x{item.quantity}</td>
                                        <td className="px-6 py-4 text-right text-slate-500">${item.price?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-blue-600 font-black">${item.subtotal?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50/50">
                                    <td colSpan={3} className="px-6 py-6 text-right text-[10px] font-black uppercase italic tracking-widest text-slate-400">Tổng thanh toán</td>
                                    <td className="px-6 py-6 text-right text-blue-600 font-black text-xl italic">${order.total?.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
              </div>
            )}

            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end flex-shrink-0">
                <button 
                  onClick={onClose}
                  className="px-8 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
                >
                  Đóng lại
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderDetailModal;
