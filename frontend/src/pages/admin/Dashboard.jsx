import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  OrderIcon, 
  ProductIcon, 
  CustomerIcon, 
  DashboardIcon 
} from '../../components/common/IconComponents';

const salesData = [
  { name: 'Tháng 1', sales: 4000, orders: 240 },
  { name: 'Tháng 2', sales: 3000, orders: 198 },
  { name: 'Tháng 3', sales: 2000, orders: 150 },
  { name: 'Tháng 4', sales: 2780, orders: 190 },
  { name: 'Tháng 5', sales: 1890, orders: 120 },
  { name: 'Tháng 6', sales: 2390, orders: 170 },
  { name: 'Tháng 7', sales: 3490, orders: 210 },
];

const categoryData = [
  { name: 'Điện thoại', value: 400 },
  { name: 'Máy tính', value: 300 },
  { name: 'Phụ kiện', value: 300 },
  { name: 'Máy tính bảng', value: 200 },
];

const COLORS = ['#3b82f6', '#0ea5e9', '#6366f1', '#a855f7'];

const StatCard = ({ title, value, trend, isPositive, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white border border-slate-100 p-6 lg:p-8 rounded-[2rem] relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 blur-[40px] rounded-full -mr-16 -mt-16`} />
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-4 rounded-2xl bg-${color}-50`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend}
      </div>
    </div>
    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 relative z-10">{title}</p>
    <h3 className="text-3xl font-bold text-slate-900 tracking-tight relative z-10">{value}</h3>
  </motion.div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8 lg:space-y-12 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <DashboardIcon size={32} className="text-blue-600" />
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Tổng quan <span className="text-gradient">Hệ thống</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium text-sm">Chào mừng trở lại! Dưới đây là hiệu suất kinh doanh hôm nay.</p>
        </div>
        <button className="btn-premium py-4 px-8 text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20">
          Xuất báo cáo <ArrowUpRight size={18} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <StatCard 
          title="Tổng doanh thu" 
          value="$128,430" 
          trend="+12.5%" 
          isPositive={true} 
          icon={<DashboardIcon size={26} className="text-blue-600" />} 
          color="blue"
        />
        <StatCard 
          title="Tổng đơn hàng" 
          value="1,240" 
          trend="+8.2%" 
          isPositive={true} 
          icon={<OrderIcon size={26} className="text-cyan-600" />} 
          color="cyan"
        />
        <StatCard 
          title="Sản phẩm" 
          value="432" 
          trend="-2.4%" 
          isPositive={false} 
          icon={<ProductIcon size={26} className="text-indigo-600" />} 
          color="indigo"
        />
        <StatCard 
          title="Khách hàng" 
          value="842" 
          trend="+14.1%" 
          isPositive={true} 
          icon={<CustomerIcon size={26} className="text-emerald-600" />} 
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-8 lg:p-10 rounded-[3rem] shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <h4 className="text-xl font-bold text-slate-900 tracking-tight">Hiệu suất Bán hàng</h4>
            <select className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold px-4 py-2 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 transition-all">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="h-[320px] lg:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: '600' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: '600' }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', padding: '16px' }} 
                  itemStyle={{ color: '#0f172a', fontWeight: '600', fontSize: '14px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white border border-slate-100 p-8 lg:p-10 rounded-[3rem] flex flex-col shadow-sm">
          <h4 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Phân bổ Kho</h4>
          <p className="text-[10px] text-slate-400 mb-12 uppercase tracking-[0.2em] font-bold">Theo danh mục</p>
          <div className="h-[280px] w-full relative flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={12}
                  cornerRadius={10}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">1,200</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tổng sản phẩm</p>
                </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-12">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[11px] text-slate-600 font-semibold truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
