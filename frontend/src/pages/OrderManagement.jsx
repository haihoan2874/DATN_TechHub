import React, { useState, useEffect, useMemo } from 'react';
import adminService from '../services/adminService';
import { 
  Search, Clock, Truck,
  CheckCircle2, XCircle,
  RefreshCw,
  CreditCard, Package, ChevronDown, ShoppingCart, TrendingUp
} from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import Toolbar from '../components/layout/Toolbar';
import DataTable from '../components/data/DataTable';
import MetricCard from '../components/data/MetricCard';
import Pagination from '../components/data/Pagination';
import EmptyState from '../components/feedback/EmptyState';
import StatusBadge from '../components/status/StatusBadge';
import toast from 'react-hot-toast';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  ORDER_STATUS_VALUES,
  ORDER_TERMINAL_STATUSES
} from '../constants/orderStatus';

const PAGE_SIZE = 8;

const tableColumns = [
  { key: 'order', label: 'Đơn hàng' },
  { key: 'customer', label: 'Khách hàng' },
  { key: 'payment', label: 'Thanh toán' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Cập nhật', className: 'text-right' }
];

const statusToneMap = {
  PENDING: 'amber',
  CONFIRMED: 'blue',
  PROCESSING: 'blue',
  SHIPPED: 'blue',
  DELIVERED: 'green',
  CANCELLED: 'red'
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    orderId: null,
    newStatus: null,
    title: '',
    message: ''
  });

  const statuses = [
    { value: 'PENDING', label: ORDER_STATUS_LABELS.PENDING, icon: Clock },
    { value: 'CONFIRMED', label: ORDER_STATUS_LABELS.CONFIRMED, icon: CheckCircle2 },
    { value: 'PROCESSING', label: ORDER_STATUS_LABELS.PROCESSING, icon: Package },
    { value: 'SHIPPED', label: ORDER_STATUS_LABELS.SHIPPED, icon: Truck },
    { value: 'DELIVERED', label: ORDER_STATUS_LABELS.DELIVERED, icon: CheckCircle2 },
    { value: 'CANCELLED', label: ORDER_STATUS_LABELS.CANCELLED, icon: XCircle }
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

  const metrics = useMemo(() => {
    const deliveredOrders = orders.filter((order) => order.status === 'DELIVERED');
    const revenue = deliveredOrders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
    return [
      { label: 'Tổng đơn hàng', value: orders.length, icon: ShoppingCart, tone: 'blue' },
      { label: 'Chờ xử lý', value: orders.filter((order) => order.status === 'PENDING').length, icon: Clock, tone: 'amber' },
      { label: 'Đang giao', value: orders.filter((order) => order.status === 'SHIPPED').length, icon: Truck, tone: 'blue' },
      { label: 'Doanh thu', value: `${revenue.toLocaleString()} ₫`, icon: TrendingUp, tone: 'green' }
    ];
  }, [orders]);

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

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return orders.filter(order => {
      const matchesSearch =
        !keyword ||
        order.orderNumber?.toLowerCase().includes(keyword) ||
        order.customerName?.toLowerCase().includes(keyword) ||
        order.customerEmail?.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getStatusInfo = (statusValue) => {
    return statuses.find(s => s.value === statusValue) || statuses[0];
  };

  const getAllowedStatuses = (currentStatus) => {
    return statuses.filter(status => ORDER_STATUS_TRANSITIONS[currentStatus]?.includes(status.value));
  };

  const isTerminalStatus = (status) => ORDER_TERMINAL_STATUSES.includes(status);

  return (
    <PageShell>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => executeStatusUpdate(confirmModal.orderId, confirmModal.newStatus)}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.newStatus === 'CANCELLED' ? 'danger' : 'warning'}
        isLoading={isUpdating === confirmModal.orderId}
      />

      <PageHeader
        eyebrow="Quản lý vận hành"
        title="Đơn hàng"
        description="Theo dõi đơn hàng và cập nhật trạng thái xử lý theo đúng luồng nghiệp vụ."
        icon={ShoppingCart}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <Toolbar>
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo mã đơn, tên hoặc email khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div className="flex w-full items-center gap-2 overflow-x-auto lg:w-auto">
              {['ALL', ...ORDER_STATUS_VALUES].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    statusFilter === status
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {status === 'ALL' ? 'Tất cả' : statuses.find(s => s.value === status)?.label}
                </button>
              ))}
        </div>
        <span className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          {filteredOrders.length} đơn hàng
        </span>
        <button onClick={fetchOrders} className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </Toolbar>

      <DataTable
        columns={tableColumns}
        footer={!loading && filteredOrders.length > 0 ? (
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredOrders.length}
            onPageChange={setCurrentPage}
          />
        ) : null}
      >
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-5 py-4"><div className="h-5 w-full rounded bg-slate-100"></div></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5"><EmptyState title="Không có đơn hàng" description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm." /></td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                             <Package size={20} className="text-slate-400" />
                          </div>
                          <div>
                            <div className="font-mono text-sm font-semibold text-slate-950">#{order.orderNumber}</div>
                            <div className="mt-1 text-xs font-medium text-slate-400">{order.itemCount || 0} sản phẩm</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{order.customerName}</div>
                          <div className="max-w-44 truncate text-xs font-medium text-slate-400">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-900">{order.total?.toLocaleString()} ₫</div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                            <CreditCard size={10} /> {order.paymentMethod}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge tone={statusToneMap[order.status]} icon={statusInfo.icon}>
                          {statusInfo.label}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <select 
                            disabled={isUpdating === order.id || isTerminalStatus(order.status)}
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="cursor-pointer appearance-none rounded-xl border border-slate-300 bg-white px-3 py-2 pr-9 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {getAllowedStatuses(order.status).map(s => (
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
      </DataTable>
    </PageShell>
  );
};

export default OrderManagement;
