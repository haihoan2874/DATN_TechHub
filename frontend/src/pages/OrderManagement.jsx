import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../services/adminService';
import { 
  Search, Eye, Clock, Truck, 
  CheckCircle2, XCircle, MoreVertical,
  Filter, RefreshCw, ChevronLeft,  ChevronRight, Calendar, User, 
  CreditCard, Package, ChevronDown, ShoppingCart, TrendingUp,
  ArrowUpRight, ExternalLink
} from 'lucide-react';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isUpdating, setIsUpdating] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    orderId: null,
    newStatus: null,
    title: '',
    message: ''
  });

  const statuses = [
    { value: 'PENDING', label: 'Chờ xử lý', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: <Clock size={12} /> },
    { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: <CheckCircle2 size={12} /> },
    { value: 'PROCESSING', label: 'Đang đóng gói', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: <Package size={12} /> },
    { value: 'SHIPPED', label: 'Đang giao', color: 'bg-cyan-50 text-cyan-600 border-cyan-200', icon: <Truck size={12} /> },
    { value: 'DELIVERED', label: 'Đã giao', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <CheckCircle2 size={12} /> },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'bg-rose-50 text-rose-600 border-rose-200', icon: <XCircle size={12} /> }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllOrders();
      setOrders(res?.contents || res?.content || res || []);
    } catch (err) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === 'CANCELLED' || newStatus === 'DELIVERED') {
      const statusLabel = statuses.find(s => s.value === newStatus)?.label;
      setConfirmModal({
        isOpen: true,
        orderId,
        newStatus,
        title: `XÁC NHẬN CHUYỂN TRẠNG THÁI`,
        message: `Bạn có chắc chắn muốn chuyển đơn hàng này sang trạng thái "${statusLabel}" không? Thao tác này ảnh hưởng trực tiếp đến dòng tiền và vận hành.`
      });
      return;
    }
    
    executeStatusUpdate(orderId, newStatus);
  };

  const executeStatusUpdate = async (orderId, newStatus) => {
    setIsUpdating(orderId);
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setIsUpdating(null);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (statusValue) => {
    return statuses.find(s => s.value === statusValue) || statuses[0];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => executeStatusUpdate(confirmModal.orderId, confirmModal.newStatus)}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.newStatus === 'CANCELLED' ? 'danger' : 'warning'}
        isLoading={isUpdating === confirmModal.orderId}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
            <ShoppingCart size={14} />
            Quản lý vận hành
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Đơn hàng</h1>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Tổng đơn hàng', val: orders.length, icon: ShoppingCart, color: 'blue' },
           { label: 'Chờ xử lý', val: orders.filter(o => o.status === 'PENDING').length, icon: Clock, color: 'amber' },
           { label: 'Đang giao', val: orders.filter(o => o.status === 'SHIPPED').length, icon: Truck, color: 'cyan' },
           { label: 'Doanh thu', val: orders.filter(o => o.status === 'DELIVERED').reduce((acc, o) => acc + o.total, 0).toLocaleString() + ' ₫', icon: TrendingUp, color: 'emerald' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                 <stat.icon size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                 <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
           <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {['ALL', 'PENDING', 'SHIPPED', 'DELIVERED'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${statusFilter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {status === 'ALL' ? 'Tất cả' : statuses.find(s => s.value === status)?.label}
                </button>
              ))}
           </div>
           <button onClick={fetchOrders} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors shrink-0">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="pl-10 pr-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Đơn hàng</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Khách hàng</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Thanh toán</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-10 py-8"><div className="h-6 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">Không tìm thấy đơn hàng nào</td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="pl-10 pr-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                             <Package size={20} className="text-slate-400" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 font-mono tracking-tighter">#{order.orderNumber}</div>
                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                              {order.itemCount} sản phẩm <ExternalLink size={10} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div>
                          <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{order.customerName}</div>
                          <div className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1">
                          <div className="text-[13px] font-black text-slate-900">{order.total?.toLocaleString()} ₫</div>
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <CreditCard size={10} /> {order.paymentMethod}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="relative inline-block text-left group-hover:scale-105 transition-transform">
                          <select 
                            disabled={isUpdating === order.id}
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none pr-10 cursor-pointer disabled:opacity-50"
                          >
                            {statuses.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            {isUpdating === order.id ? <RefreshCw size={12} className="animate-spin" /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
