import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Truck,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../../api/axios';
import { OrderIcon } from '../../../components/common/IconComponents';
import OrderDetailModal from './OrderDetailModal';
import Toast from '../../../components/common/Toast';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/orders');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      // Fallback for demo
      setOrders([
        { id: '1', orderNumber: 'ORD-2024-001', customerName: 'Hoan Nguyễn', customerEmail: 'hoan@gmail.com', total: 1540, status: 'DELIVERED', createdAt: '2024-03-15T10:00:00Z', itemCount: 3, paymentMethod: 'VNPAY' },
        { id: '2', orderNumber: 'ORD-2024-002', customerName: 'Minh Anh', customerEmail: 'minh@example.com', total: 890, status: 'SHIPPED', createdAt: '2024-03-16T14:20:00Z', itemCount: 1, paymentMethod: 'COD' },
        { id: '3', orderNumber: 'ORD-2024-003', customerName: 'Tuấn Trần', customerEmail: 'tuan@example.com', total: 2100, status: 'PENDING', createdAt: '2024-03-17T09:15:00Z', itemCount: 5, paymentMethod: 'BANK_TRANSFER' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await apiClient.patch(`/orders/${id}/status`, { status: newStatus });
      setToast({ isVisible: true, message: `Đã cập nhật trạng thái đơn hàng.`, type: 'success' });
      fetchOrders();
    } catch (err) {
      setToast({ isVisible: true, message: 'Lỗi khi cập nhật trạng thái.', type: 'error' });
    }
  };

  const handleViewDetail = (id) => {
    setSelectedOrderId(id);
    setIsDetailOpen(true);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return { text: 'Chờ xử lý', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={14} /> };
      case 'CONFIRMED': return { text: 'Đã xác nhận', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <CheckCircle size={14} /> };
      case 'SHIPPED': return { text: 'Đang giao', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: <Truck size={14} /> };
      case 'DELIVERED': return { text: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle size={14} /> };
      case 'CANCELLED': return { text: 'Đã huỷ', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle size={14} /> };
      default: return { text: status, color: 'bg-slate-50 text-slate-400 border-slate-100', icon: null };
    }
  };

  const filteredOrders = orders.filter(o => 
    (statusFilter === 'ALL' || o.status === statusFilter) &&
    (o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600">
            <OrderIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Đơn hàng</h1>
            <p className="text-slate-400 font-medium text-sm">Theo dõi và quản lý các giao dịch khách hàng.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-4 lg:p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm theo mã đơn, tên khách..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-16 pr-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white placeholder:text-slate-400 font-semibold transition-all"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 md:flex-none px-6 py-4 bg-slate-50 border border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px] rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
            >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="CONFIRMED">Xác nhận</option>
                <option value="SHIPPED">Đang giao</option>
                <option value="DELIVERED">Hoàn thành</option>
                <option value="CANCELLED">Đã huỷ</option>
            </select>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 shadow-[inset_0_-1px_0_0_#f1f5f9] text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-10 py-6">Mã Đơn / Ngày đặt</th>
                <th className="px-10 py-6">Khách hàng</th>
                <th className="px-10 py-6">Thanh toán</th>
                <th className="px-10 py-6">Tổng tiền</th>
                <th className="px-10 py-6">Trạng thái</th>
                <th className="px-10 py-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-10 py-10 h-24 bg-white" />
                  </tr>
                ))
              ) : filteredOrders.map((order) => {
                  const statusInfo = getStatusLabel(order.status);
                  return (
                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-8">
                            <p className="text-sm font-bold text-slate-900 mb-1 tracking-tight uppercase">{order.orderNumber}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </td>
                        <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold text-xs">
                                    {order.customerName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 uppercase">{order.customerName}</p>
                                    <p className="text-[10px] text-slate-400 lowercase font-medium">{order.customerEmail}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-8 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {order.paymentMethod}
                        </td>
                        <td className="px-10 py-8">
                            <p className="text-blue-600 font-bold text-lg">${order.total.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{order.itemCount} sản phẩm</p>
                        </td>
                        <td className="px-10 py-8">
                            <span className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase border ${statusInfo.color} flex items-center gap-2 w-fit shadow-sm`}>
                                {statusInfo.icon}
                                {statusInfo.text}
                            </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                <button 
                                    onClick={() => handleViewDetail(order.id)}
                                    className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
                                    title="Xem chi tiết"
                                >
                                    <Eye size={18} />
                                </button>
                                {order.status === 'PENDING' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                                        className="p-3 bg-white border border-slate-100 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-100 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-emerald-500/10"
                                        title="Xác nhận đơn"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                )}
                                {order.status === 'CONFIRMED' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                                        className="p-3 bg-white border border-slate-100 text-blue-500 hover:bg-blue-50 hover:border-blue-100 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
                                        title="Bắt đầu giao"
                                    >
                                        <Truck size={18} />
                                    </button>
                                )}
                                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                        className="p-3 bg-white border border-slate-100 text-rose-500 hover:bg-rose-50 hover:border-rose-100 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-rose-500/10"
                                        title="Huỷ đơn"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        orderId={selectedOrderId}
      />

      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
};

export default OrderList;
