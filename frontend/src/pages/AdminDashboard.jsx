import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  Users, Package, ShoppingCart, 
  TrendingUp, FileText,
  RefreshCw, Clock, CheckCircle2, Truck, XCircle, AlertTriangle, Trophy
} from 'lucide-react';
import Button from '../components/ui/Button';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';
import ReportExportModal from '../components/admin/ReportExportModal';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/data/MetricCard';
import { formatCurrency } from '../utils/formatters';
import { getOrderStatusLabel } from '../constants/orderStatus';
import { resolveApiAssetUrl } from '../config/api';

const RANGE_OPTIONS = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7days', label: '7 ngày qua' },
  { value: '30days', label: '30 ngày qua' },
  { value: '6months', label: '6 tháng qua' },
  { value: '12months', label: '12 tháng qua' },
  { value: 'custom', label: 'Tùy chỉnh' }
];

const STATUS_TONES = {
  PENDING: 'bg-amber-500',
  PROCESSING: 'bg-teal-500',
  SHIPPED: 'bg-sky-500',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-500'
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStats = useCallback(async () => {
    if (selectedRange === 'custom' && (!startDate || !endDate)) {
      return; // wait for both dates to be selected
    }
    setLoading(true);
    try {
      const params = { range: selectedRange };
      if (selectedRange === 'custom') {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const data = await adminService.getDashboardStats(params);
      setStats(data);
    } catch (err) {
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  }, [selectedRange, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const chartData = useMemo(() => {
    const data = stats?.weeklyRevenue || [];
    
    if (selectedRange === '12months' || selectedRange === '6months') {
      // Group by month
      const monthly = data.reduce((acc, item) => {
        const date = new Date(item.day);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
          acc[monthKey] = { label: `Thg ${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`, value: 0 };
        }
        acc[monthKey].value += Number(item.value);
        return acc;
      }, {});
      return Object.values(monthly);
    } 
    
    if (selectedRange === 'custom' && data.length > 60) {
      // Group by month if custom range is long
      const monthly = data.reduce((acc, item) => {
        const date = new Date(item.day);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
          acc[monthKey] = { label: `Thg ${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`, value: 0 };
        }
        acc[monthKey].value += Number(item.value);
        return acc;
      }, {});
      return Object.values(monthly);
    }

    // Default daily
    return data.map((item) => ({
      ...item,
      label: new Date(item.day).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }));
  }, [stats, selectedRange]);

  const statusTotal = useMemo(() => {
    return (stats?.orderStatuses || []).reduce((total, item) => total + Number(item.count || 0), 0);
  }, [stats]);

  if (loading || !stats) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-blue-600" size={40} />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đang tải tổng quan vận hành...</p>
      </div>
    );
  }

  const metricItems = [
    { label: `Doanh thu ${stats.rangeLabel?.toLowerCase() || ''}`, value: formatCurrency(stats.totalRevenue), icon: TrendingUp, tone: 'blue' },
    { label: `Lợi nhuận ${stats.rangeLabel?.toLowerCase() || ''}`, value: formatCurrency(stats.totalProfit), icon: TrendingUp, tone: 'emerald' },
    { label: `Đơn hàng ${stats.rangeLabel?.toLowerCase() || ''}`, value: stats.totalOrders, icon: ShoppingCart, tone: 'green' },
    { label: 'Khách hàng', value: stats.totalCustomers.toLocaleString(), icon: Users, tone: 'amber' },
    { label: 'Sản phẩm', value: stats.totalProducts, icon: Package, tone: 'indigo' }
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Tổng quan quản trị"
        title="Bảng điều khiển"
        description="Theo dõi doanh thu, đơn hàng, khách hàng và phân bố danh mục sản phẩm."
        icon={TrendingUp}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" icon={RefreshCw} onClick={fetchStats}>Cập nhật</Button>
            <Button icon={FileText} onClick={() => setIsReportModalOpen(true)}>
              Xuất báo cáo
            </Button>
          </div>
        }
      />

      <ReportExportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 px-1 shrink-0">
          <Clock size={16} className="text-blue-600" />
          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 hidden md:inline">Khoảng thời gian</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto overflow-hidden">
          <div className="flex w-full gap-1.5 overflow-x-auto rounded-xl bg-slate-50 p-1 sm:w-auto scrollbar-hide">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedRange(option.value)}
                className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-bold transition-all ${
                  selectedRange === option.value
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white hover:text-slate-950'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {selectedRange === 'custom' && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-xl bg-slate-50 p-1 animate-in fade-in slide-in-from-right-4 duration-300">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border-0 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 min-w-[130px] text-center focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-slate-400 font-bold hidden sm:inline">-</span>
              <input 
                type="date" 
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border-0 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 min-w-[130px] text-center focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {metricItems.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-950">Doanh thu theo thời gian</h3>
              <p className="mt-1 text-sm text-slate-500">Đơn đã giao trong {stats.rangeLabel?.toLowerCase() || 'khoảng đã chọn'}.</p>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} minTickGap={40} />
                <YAxis hide={true} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-950">Trạng thái đơn hàng</h3>
              <p className="mt-1 text-sm text-slate-500">Theo {stats.rangeLabel?.toLowerCase() || 'khoảng đã chọn'}.</p>
            </div>
          </div>

          <div className="space-y-4">
            {(stats.orderStatuses || []).map((item) => {
              const percent = statusTotal > 0 ? Math.round((Number(item.count) / statusTotal) * 100) : 0;
              return (
                <div key={item.status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{getOrderStatusLabel(item.status)}</span>
                    <span className="font-bold text-slate-950">{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${STATUS_TONES[item.status] || 'bg-slate-400'}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            {stats.orderStatuses?.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Chưa có đơn hàng trong khoảng này.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Sản phẩm bán chạy</h3>
              <p className="text-sm text-slate-500">Xếp theo số lượng bán trong {stats.rangeLabel?.toLowerCase() || 'khoảng đã chọn'}.</p>
            </div>
          </div>

          <div className="space-y-3">
            {(stats.topProducts || []).map((product, index) => (
              <div key={`${product.name}-${index}`} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                  {index + 1}
                </div>
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  {product.imageUrl && (
                    <img src={resolveApiAssetUrl(product.imageUrl)} alt={product.name} className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950">{product.name}</p>
                  <p className="text-xs font-semibold text-slate-500">Đã bán {product.quantity} sản phẩm</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-blue-700" title="Doanh thu">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5" title="Lợi nhuận">Lãi: {formatCurrency(product.profit)}</p>
                </div>
              </div>
            ))}
            {stats.topProducts?.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Chưa có sản phẩm bán ra trong khoảng này.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Kho thấp</h3>
              <p className="text-sm text-slate-500">Ưu tiên nhập thêm.</p>
            </div>
          </div>

          <div className="space-y-3">
            {(stats.lowStockProducts || []).map((product, index) => (
              <div key={`${product.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  {product.imageUrl && (
                    <img src={resolveApiAssetUrl(product.imageUrl)} alt={product.name} className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950">{product.name}</p>
                  <p className="text-xs font-semibold text-rose-600">Còn {product.stockQuantity} sản phẩm</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-950">Tỉ trọng danh mục</h3>
              <p className="mt-1 text-sm text-slate-500">Phân bố số lượng bán theo nhóm sản phẩm.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topCategories}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                  <YAxis hide={true} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                    {stats.topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {stats.topCategories.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                </div>
              ))}
              {stats.topCategories?.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Chưa có dữ liệu danh mục trong khoảng này.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminDashboard;
