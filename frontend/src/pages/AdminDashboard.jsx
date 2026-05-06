import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Package, ShoppingCart, 
  BarChart3, ArrowUpRight, ArrowDownRight,
  TrendingUp, Calendar, Filter, FileText,
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
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang đồng bộ dữ liệu hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Bảng điều khiển</h1>
          <p className="text-slate-500 mt-1 font-medium">Theo dõi hoạt động kinh doanh thời gian thực.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={RefreshCw} onClick={fetchStats}>Cập nhật mới</Button>
          <Button 
            variant="primary" 
            icon={FileText} 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-slate-900 hover:bg-black shadow-lg shadow-slate-900/10"
          >
            TỔNG HỢP BÁO CÁO
          </Button>
        </div>
      </div>

      <ReportExportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng doanh thu" 
          value={`${stats.totalRevenue.toLocaleString()} ₫`} 
          trend="+12.5%" 
          isUp={true} 
          icon={<TrendingUp size={24} />} 
          color="blue"
        />
        <StatCard 
          title="Đơn hàng mới" 
          value={stats.totalOrders} 
          trend="+8.2%" 
          isUp={true} 
          icon={<ShoppingCart size={24} />} 
          color="emerald"
        />
        <StatCard 
          title="Khách hàng" 
          value={stats.totalCustomers.toLocaleString()} 
          trend="-2.4%" 
          isUp={false} 
          icon={<Users size={24} />} 
          color="amber"
        />
        <StatCard 
          title="Sản phẩm" 
          value={stats.totalProducts} 
          trend="+4" 
          isUp={true} 
          icon={<Package size={24} />} 
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">Doanh thu tuần này</h3>
              <p className="text-sm text-slate-400 font-medium">Dữ liệu tổng hợp từ các đơn hàng đã hoàn tất</p>
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
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">Tỉ trọng Danh mục</h3>
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

          <div className="mt-8 space-y-4">
             {stats.topCategories.map((item, idx) => (
               <div key={idx} className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                   <span className="text-sm font-bold text-slate-600">{item.name}</span>
                 </div>
                 <span className="text-sm font-black text-slate-900">{item.value}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, isUp, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm transition-all"
    >
      <div className="flex items-center justify-between mb-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-black ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</div>
      <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{value}</div>
    </motion.div>
  );
};

export default AdminDashboard;
