import React, { useState, useEffect } from 'react';
import { 
  Users, Package, ShoppingCart, 
  TrendingUp, FileText,
  RefreshCw
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

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-blue-600" size={40} />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đang tải tổng quan vận hành...</p>
      </div>
    );
  }

  const metricItems = [
    { label: 'Tổng doanh thu', value: `${stats.totalRevenue.toLocaleString()} ₫`, icon: TrendingUp, tone: 'blue' },
    { label: 'Đơn hàng', value: stats.totalOrders, icon: ShoppingCart, tone: 'green' },
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricItems.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-950">Doanh thu tuần này</h3>
              <p className="mt-1 text-sm text-slate-500">Tổng hợp từ các đơn hàng đã hoàn tất.</p>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyRevenue}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis hide={true} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-950">Tỉ trọng danh mục</h3>
              <p className="mt-1 text-sm text-slate-500">Phân bố theo nhóm sản phẩm.</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-[250px]">
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

          <div className="mt-6 space-y-3">
             {stats.topCategories.map((item, idx) => (
               <div key={idx} className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                   <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                 </div>
                 <span className="text-sm font-bold text-slate-900">{item.value}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminDashboard;
