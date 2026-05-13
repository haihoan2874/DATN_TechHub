import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Users, BarChart3, Settings, LogOut, 
  Menu, X, Bell, Search, ChevronRight,
  Tag, Image as ImageIcon, Star, TicketPercent
} from 'lucide-react';

import ConfirmModal from '../components/ui/ConfirmModal';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Sản phẩm' },
    { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Đơn hàng' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Người dùng' },
    { path: '/admin/categories', icon: <Tag size={20} />, label: 'Danh mục' },
    { path: '/admin/brands', icon: <ImageIcon size={20} />, label: 'Thương hiệu' },
    { path: '/admin/reviews', icon: <Star size={20} />, label: 'Đánh giá' },
    { path: '/admin/vouchers', icon: <TicketPercent size={20} />, label: 'Voucher' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-slate-900 text-slate-400 h-full flex-shrink-0 flex flex-col z-50 border-r border-slate-800"
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 mb-4">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-black">
              S
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-black text-white tracking-tighter whitespace-nowrap">
                S-LIFE <span className="text-blue-500 text-xs font-bold ml-1 px-1.5 py-0.5 bg-blue-500/10 rounded">ADMIN</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className="font-bold text-[14px] whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {isActive && isSidebarOpen && (
                  <motion.div layoutId="activeHighlight" className="ml-auto">
                    <ChevronRight size={14} />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-slate-800">
          {isSidebarOpen ? (
            <div className="bg-slate-800/50 rounded-2xl p-4 mb-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-white truncate">{user?.username}</div>
                  <div className="text-xs text-slate-500 truncate">Quản trị viên</div>
                </div>
              </div>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-blue-600/20 hover:text-blue-500 rounded-xl text-xs font-bold transition-all"
              >
                <LogOut size={14} /> Đăng xuất
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center py-3 text-slate-500 hover:text-blue-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm kiếm nhanh..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 w-64 transition-all"
              />
            </div>
            
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900">{user?.username}</div>
                <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Online</div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-blue-100 flex items-center justify-center text-blue-600">
                <Users size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
      <ConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Đăng xuất hệ thống"
        message="Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc hiện tại không?"
        confirmText="Đăng xuất ngay"
        variant="warning"
      />
    </div>
  );
};

export default AdminLayout;
