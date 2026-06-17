import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import adminService from '../services/adminService';
import { 
  Search, Clock, Truck,
  CheckCircle2, XCircle,
  RefreshCw,
  CreditCard, Package, ChevronDown, ShoppingCart, TrendingUp,
  Eye, Printer, X, MapPin, Phone, User, Calendar, Filter
} from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';

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

const fmtVND = (n) => n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const tableColumns = [
  { key: 'select', label: '', className: 'w-10', sortable: false },
  { key: 'order', label: 'Đơn hàng', sortable: true },
  { key: 'customer', label: 'Khách hàng', sortable: false },
  { key: 'payment', label: 'Thanh toán', sortable: true },
  { key: 'status', label: 'Trạng thái', sortable: false },
  { key: 'actions', label: 'Thao tác', className: 'text-right', sortable: false }
];

const statusToneMap = {
  PENDING: 'amber', PROCESSING: 'blue',
  SHIPPED: 'purple', DELIVERED: 'green', CANCELLED: 'red'
};

// ─── Shipping Label Component (dùng khi in) ───
const ShippingLabel = React.forwardRef(({ order }, ref) => (
  <div ref={ref} className="shipping-label-wrapper">
    <div className="shipping-label">
      {/* Header shop */}
      <div className="label-header">
        <div className="shop-name">S-LIFE</div>
        <div className="shop-info">Thiết bị sức khỏe thông minh</div>
        <div className="shop-info">Hotline: 1900 123 456</div>
      </div>
      {/* Receiver */}
      <div className="label-section">
        <div className="label-section-title">GỬI ĐẾN</div>
        <div className="receiver-name">{order?.customerName || '—'}</div>
        <div className="receiver-info">SĐT: {order?.customerPhone || order?.customerEmail || '—'}</div>
        <div className="receiver-info">
          Đ/C: {[order?.shippingAddress, order?.shippingWard, order?.shippingDistrict, order?.shippingCity]
            .filter(Boolean).join(', ') || order?.address || '—'}
        </div>
      </div>
      {/* Order info */}
      <div className="label-section label-order-info">
        <div><strong>Mã đơn:</strong> {order?.orderNumber}</div>
        <div><strong>Ngày đặt:</strong> {fmtDate(order?.createdAt)}</div>
        <div><strong>Thanh toán:</strong> {order?.paymentMethod === 'COD' ? 'COD (Thu hộ)' : 'Đã thanh toán'}</div>
        <div><strong>Trạng thái:</strong> {ORDER_STATUS_LABELS[order?.status] || order?.status || '—'}</div>
      </div>
      {/* Items */}
      <div className="label-section">
        <div className="label-section-title">SẢN PHẨM</div>
        {(order?.items || order?.orderItems || []).map((item, i) => (
          <div key={i} className="label-item">
            <span>{item.productName} x {item.quantity}</span>
            <span>{fmtVND(item.subtotal || item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="label-total">TỔNG CỘNG: {fmtVND(order?.total)}</div>
      </div>
    </div>
  </div>
));

// ─── Order Detail Modal ───
const OrderDetailModal = ({ order, onClose, onPrint }) => {
  if (!order) return null;
  const items = order.items || order.orderItems || [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
              <Package size={18} className="text-blue-600" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold text-slate-900">#{order.orderNumber}</div>
              <div className="text-xs text-slate-400">{fmtDate(order.createdAt)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint([order])}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <Printer size={15} /> In phiếu dán kiện
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {/* Customer info */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Thông tin khách hàng</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <User size={14} className="text-slate-400 flex-shrink-0" />
                <span className="font-semibold">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={14} className="text-slate-400 flex-shrink-0" />
                <span>{order.customerPhone || order.customerEmail}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  {[order.shippingAddress, order.shippingWard, order.shippingDistrict, order.shippingCity]
                    .filter(Boolean).join(', ') || order.address || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <CreditCard size={14} className="text-slate-400" />
              <span>{order.paymentMethod}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar size={14} />
              <span>{fmtDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Danh sách sản phẩm</div>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              {items.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-400">Không có sản phẩm</div>
              ) : (
                items.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 text-sm ${i < items.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <div>
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-xs text-slate-400">× {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{fmtVND(item.subtotal || item.price * item.quantity)}</div>
                      <div className="text-xs text-slate-400">{fmtVND(item.price)} / cái</div>
                      {item.costPrice != null && (
                        <div className="mt-1 text-xs font-semibold text-emerald-600">
                          Lãi dòng: {fmtVND(item.grossProfit)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-xl bg-slate-900 px-5 py-4">
            <span className="font-semibold text-slate-300">Tổng cộng</span>
            <span className="text-xl font-bold text-white">{fmtVND(order.total)}</span>
          </div>

          {/* Gross profit */}
          {order.grossProfit != null && (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-5 py-3">
              <span className="text-sm font-semibold text-emerald-700">Lãi gộp ước tính</span>
              <span className="text-base font-bold text-emerald-800">{fmtVND(order.grossProfit)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Print Area (hidden, dùng CSS @media print) ───
const PrintArea = React.forwardRef(({ orders }, ref) => {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div ref={ref} id="print-area" className="hidden print:block">
      {orders.map(order => (
        <ShippingLabel key={order.id} order={order} />
      ))}
    </div>,
    document.body
  );
});

// ─── Main Page ───
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'order', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailOrder, setDetailOrder] = useState(null);
  const [printOrders, setPrintOrders] = useState([]);
  const printRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, orderId: null, newStatus: null, title: '', message: ''
  });

  const statuses = [
    { value: 'PENDING', label: ORDER_STATUS_LABELS.PENDING, icon: Clock },
    { value: 'PROCESSING', label: ORDER_STATUS_LABELS.PROCESSING, icon: Package },
    { value: 'SHIPPED', label: ORDER_STATUS_LABELS.SHIPPED, icon: Truck },
    { value: 'DELIVERED', label: ORDER_STATUS_LABELS.DELIVERED, icon: CheckCircle2 },
    { value: 'CANCELLED', label: ORDER_STATUS_LABELS.CANCELLED, icon: XCircle }
  ];

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllOrders();
      setOrders(res?.contents || res?.content || res || []);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by Date
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        if (dateFilter === 'thisMonth') {
          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        }
        if (dateFilter === 'lastMonth') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
        }
        if (dateFilter === 'thisYear') {
          return itemDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    // Filter by Search & Status
    const keyword = searchTerm.trim().toLowerCase();
    result = result.filter(order => {
      const matchesSearch =
        !keyword ||
        order.orderNumber?.toLowerCase().includes(keyword) ||
        order.customerName?.toLowerCase().includes(keyword) ||
        order.customerEmail?.toLowerCase().includes(keyword) ||
        order.customerPhone?.includes(keyword);
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort
    result.sort((a, b) => {
      let valA, valB;
      if (sortConfig.key === 'payment') {
        valA = a.total || 0;
        valB = b.total || 0;
      } else { // default to createdAt
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, searchTerm, statusFilter, dateFilter, sortConfig]);

  const metrics = useMemo(() => {
    const deliveredOrders = filteredOrders.filter(o => o.status === 'DELIVERED');
    const revenue = deliveredOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    return [
      { label: 'Tổng đơn hàng', value: filteredOrders.length, icon: ShoppingCart, tone: 'blue' },
      { label: 'Chờ xử lý', value: filteredOrders.filter(o => o.status === 'PENDING').length, icon: Clock, tone: 'amber' },
      { label: 'Đang giao', value: filteredOrders.filter(o => o.status === 'SHIPPED').length, icon: Truck, tone: 'blue' },
      { label: 'Doanh thu', value: `${revenue.toLocaleString()} ₫`, icon: TrendingUp, tone: 'green' }
    ];
  }, [filteredOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === 'CANCELLED' || newStatus === 'DELIVERED') {
      const statusLabel = statuses.find(s => s.value === newStatus)?.label;
      setConfirmModal({
        isOpen: true, orderId, newStatus,
        title: 'XÁC NHẬN CHUYỂN TRẠNG THÁI',
        message: `Bạn có chắc chắn muốn chuyển đơn hàng này sang trạng thái "${statusLabel}" không?`
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
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setIsUpdating(null);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const columnsWithSort = useMemo(() => {
    return tableColumns.map(col => ({
      ...col,
      sortConfig,
      onSort: handleSort
    }));
  }, [sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, dateFilter, sortConfig]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // ─── Checkbox ───
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedOrders.map(o => o.id)));
    }
  };

  // ─── Print ───
  const handlePrint = useCallback((ordersToPrint) => {
    setPrintOrders(ordersToPrint);
    setTimeout(() => window.print(), 100);
  }, []);

  const handleBulkPrint = () => {
    const selected = orders.filter(o => selectedIds.has(o.id));
    if (selected.length === 0) { toast.error('Chưa chọn đơn hàng nào'); return; }
    handlePrint(selected);
  };

  const getStatusInfo = (statusValue) => statuses.find(s => s.value === statusValue) || statuses[0];
  const getAllowedStatuses = (currentStatus) =>
    statuses.filter(s => ORDER_STATUS_TRANSITIONS[currentStatus]?.includes(s.value));
  const isTerminalStatus = (status) => ORDER_TERMINAL_STATUSES.includes(status);

  return (
    <PageShell>
      {/* Print area - chỉ hiện khi print */}
      <PrintArea ref={printRef} orders={printOrders} />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => executeStatusUpdate(confirmModal.orderId, confirmModal.newStatus)}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.newStatus === 'CANCELLED' ? 'danger' : 'warning'}
        isLoading={isUpdating === confirmModal.orderId}
      />

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onPrint={handlePrint}
        />
      )}

      <PageHeader
        eyebrow="Quản lý vận hành"
        title="Đơn hàng"
        description="Theo dõi đơn hàng, xem chi tiết và in nhãn gói hàng giao khách."
        icon={ShoppingCart}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {metrics.map(metric => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, khách hàng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-10 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex items-center">
              <Filter size={16} className="absolute left-3 text-slate-400" />
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="h-12 w-36 rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="thisMonth">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
                <option value="thisYear">Năm nay</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-12 w-48 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {ORDER_STATUS_VALUES.map(status => (
                <option key={status} value={status}>{statuses.find(s => s.value === status)?.label}</option>
              ))}
            </select>
            <button onClick={fetchOrders} className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 hover:bg-slate-50">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk print toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-5 py-3">
          <span className="text-sm font-semibold text-blue-700">
            Đã chọn {selectedIds.size} đơn hàng
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
            >
              Bỏ chọn
            </button>
            <button
              onClick={handleBulkPrint}
              id="btn-bulk-print-labels"
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
            >
              <Printer size={14} /> In {selectedIds.size} nhãn
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columnsWithSort}
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
              <td colSpan="6" className="px-5 py-4">
                <div className="h-5 w-full rounded bg-slate-100" />
              </td>
            </tr>
          ))
        ) : filteredOrders.length === 0 ? (
          <tr>
            <td colSpan="6">
              <EmptyState title="Không có đơn hàng" description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm." />
            </td>
          </tr>
        ) : (
          paginatedOrders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            const isSelected = selectedIds.has(order.id);
            return (
              <tr key={order.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-blue-50/50' : ''}`}>
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(order.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>

                {/* Đơn hàng */}
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

                {/* Khách hàng */}
                <td className="px-5 py-4">
                  <div className="text-sm font-semibold text-slate-900">{order.customerName}</div>
                  <div className="max-w-44 truncate text-xs font-medium text-slate-400">{order.customerEmail}</div>
                </td>

                {/* Thanh toán */}
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900">{order.total?.toLocaleString()} ₫</div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <CreditCard size={10} /> {order.paymentMethod}
                    </div>
                  </div>
                </td>

                {/* Trạng thái */}
                <td className="px-5 py-4">
                  <StatusBadge tone={statusToneMap[order.status]} icon={statusInfo.icon}>
                    {statusInfo.label}
                  </StatusBadge>
                </td>

                {/* Thao tác */}
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Nút xem chi tiết */}
                    <button
                      onClick={() => setDetailOrder(order)}
                      title="Xem chi tiết đơn hàng"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye size={15} />
                    </button>

                    {/* Nút in nhãn */}
                    <button
                      onClick={() => handlePrint([order])}
                      title="In nhãn gói hàng"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                    >
                      <Printer size={15} />
                    </button>

                    {/* Dropdown cập nhật trạng thái */}
                    <div className="relative">
                      <select
                        disabled={isUpdating === order.id || isTerminalStatus(order.status)}
                        value={order.status}
                        onChange={e => handleUpdateStatus(order.id, e.target.value)}
                        className="form-select cursor-pointer appearance-none pr-9 text-xs disabled:opacity-50"
                      >
                        {getAllowedStatuses(order.status).map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        {isUpdating === order.id
                          ? <RefreshCw size={12} className="animate-spin" />
                          : <ChevronDown size={14} />}
                      </div>
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
