import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  Truck, 
  XCircle,
  Download
} from 'lucide-react';
import apiClient from '../../../api/axios';
import { OrderIcon } from '../../../components/common/IconComponents';
import OrderDetailModal from './OrderDetailModal';
import Toast, { ToastType } from '../../../components/common/Toast';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  paymentMethod: string;
  createdAt: string;
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal & Toast states
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as ToastType });

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
        { id: '1', orderNumber: 'ORD-20240405-001', status: 'PENDING', total: 1250, customerName: 'Hoan Nguyễn', customerEmail: 'hoan@gmail.com', itemCount: 3, paymentMethod: 'VNPAY', createdAt: new Date().toISOString() },
        { id: '2', orderNumber: 'ORD-20240405-002', status: 'CONFIRMED', total: 840, customerName: 'Minh Anh', customerEmail: 'minhanh@gmail.com', itemCount: 1, paymentMethod: 'COD', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.put(`/orders/${id}/status?status=${newStatus}`);
      setToast({ isVisible: true, message: `Hệ thống đã cập nhật trạng thái đơn: ${newStatus}`, type: 'success' });
      fetchOrders();
    } catch (err) {
      console.error('Error updating status:', err);
      setToast({ isVisible: true, message: 'Lỗi khi cập nhật trạng thái.', type: 'error' });
    }
  };

  const handleViewDetail = (id: string) => {
    setSelectedOrderId(id);
    setIsDetailOpen(true);
  };

  const filteredOrders = orders.filter(o => 
    (o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'ALL' || o.status === statusFilter)
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
        case 'PENDING': return { text: 'Chờ xử lý', color: 'bg-amber-50 text-amber-600 border-amber-100' };
        case 'CONFIRMED': return { text: 'Đã xác nhận', color: 'bg-blue-50 text-blue-600 border-blue-100' };
        case 'SHIPPED': return { text: 'Đang giao', color: 'bg-purple-50 text-purple-600 border-purple-100' };
        case 'DELIVERED': return { text: 'Đã giao', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
        case 'CANCELLED': return { text: 'Đã huỷ', color: 'bg-rose-50 text-rose-600 border-rose-100' };
        default: return { text: status, color: 'bg-slate-50 text-slate-600 border-slate-100' };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <OrderIcon size={40} />
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight italic uppercase">Đơn hàng</h1>
            <p className="text-slate-400 font-bold italic tracking-wide text-xs">Theo dõi và vận hành hành trình mua sắm của khách.</p>
          </div>
        </div>
        <button 
          className="w-full md:w-auto px-8 py-4 bg-slate-100/50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black italic uppercase tracking-widest text-[10px] transition-all border border-slate-200 flex items-center justify-center gap-3"
        >
          <Download size={18} /> Xuất báo cáo
        </button>
      </div>

      <div className="bg-white border border-slate-100 p-4 lg:p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm theo mã đơn, tên khách..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-14 pr-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white placeholder:text-slate-400 font-bold italic transition-all"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 md:flex-none px-6 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 font-black italic uppercase tracking-widest text-[10px] rounded-2xl outline-none focus:border-blue-500/20"
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
              <tr className="bg-slate-50 shadow-[inset_0_-1px_0_0_#f1f5f9] text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black italic">
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
                            <p className="text-sm font-black text-slate-900 mb-1 tracking-tight italic uppercase">{order.orderNumber}</p>
                            <p className="text-[10px] text-slate-400 italic font-bold">
                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </td>
                        <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs">
                                    {order.customerName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-700 italic uppercase">{order.customerName}</p>
                                    <p className="text-[10px] text-slate-400 italic lowercase font-medium">{order.customerEmail}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-8 font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {order.paymentMethod}
                        </td>
                        <td className="px-10 py-8">
                            <p className="text-blue-600 font-black italic text-lg">${order.total.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 italic font-bold uppercase">{order.itemCount} sản phẩm</p>
                        </td>
                        <td className="px-10 py-8">
                            <span className={`px-4 py-2 rounded-full text-[10px] font-black italic uppercase border ${statusInfo.color}`}>
                                {statusInfo.text}
                            </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                    onClick={() => handleViewDetail(order.id)}
                                    className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-2xl transition-all shadow-sm"
                                    title="Xem chi tiết"
                                >
                                    <Eye size={18} />
                                </button>
                                {order.status === 'PENDING' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                                        className="p-3 bg-white border border-slate-100 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm"
                                        title="Xác nhận đơn"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                )}
                                {order.status === 'CONFIRMED' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                                        className="p-3 bg-white border border-slate-100 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all shadow-sm"
                                        title="Bắt đầu giao"
                                    >
                                        <Truck size={18} />
                                    </button>
                                )}
                                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                        className="p-3 bg-white border border-slate-100 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm"
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
