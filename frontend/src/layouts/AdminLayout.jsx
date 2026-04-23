import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogoIcon, 
  DashboardIcon, 
  ProductIcon, 
  CategoryIcon, 
  OrderIcon, 
  CustomerIcon, 
  SettingIcon, 
  BellIcon, 
  SearchIcon 
} from '../components/common/IconComponents';

const SidebarItem = ({ icon, label, path, active, collapsed, onClick }) => (
  <Link 
    to={path} 
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
      ${active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 font-bold' 
        : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
  >
    <div className="flex-shrink-0">
      {icon}
    </div>
    {!collapsed && (
      <span className="text-sm tracking-wide font-black italic uppercase text-[10px] whitespace-nowrap">{label}</span>
    )}
  </Link>
);

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: <DashboardIcon size={22} />, label: 'Tổng quan', path: '/admin' },
    { icon: <ProductIcon size={22} />, label: 'Sản phẩm', path: '/admin/products' },
    { icon: <CategoryIcon size={22} />, label: 'Danh mục', path: '/admin/categories' },
    { icon: <OrderIcon size={22} />, label: 'Đơn hàng', path: '/admin/orders' },
    { icon: <CustomerIcon size={22} />, label: 'Khách hàng', path: '/admin/customers' },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-6 mb-12 flex items-center justify-between overflow-hidden">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3">
            <LogoIcon size={36} />
            <span className="text-2xl font-black text-slate-900 tracking-tighter italic">S-Life</span>
          </div>
        )}
        {!isMobile && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        )}
        {isMobile && (
          <button onClick={() => setIsMobileOpen(false)} className="p-3 text-slate-400 hover:text-rose-500 rounded-2xl transition-all">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.path}
            {...item}
            active={location.pathname === item.path}
            collapsed={!isMobile && collapsed}
            onClick={() => isMobile && setIsMobileOpen(false)}
          />
        ))}
      </nav>

      <div className="px-4 mt-auto pt-8 border-t border-slate-100 space-y-2">
        <SidebarItem 
          icon={<SettingIcon size={22} />} 
          label="Cài đặt" 
          path="/admin/settings" 
          active={location.pathname === '/admin/settings'} 
          collapsed={!isMobile && collapsed} 
          onClick={() => isMobile && setIsMobileOpen(false)}
        />
        <button className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all group font-bold`}>
          <LogOut size={22} />
          {(!collapsed || isMobile) && <span className="text-[10px] font-black italic uppercase tracking-widest whitespace-nowrap">Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      {/* Drawer Overlay for Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isMobile ? (isMobileOpen ? 280 : 0) : (collapsed ? 100 : 280),
          x: isMobile && !isMobileOpen ? -280 : 0
        }}
        className={`fixed left-0 top-0 bottom-0 z-[60] bg-white border-r border-slate-200 flex flex-col pt-8 pb-6 transition-all duration-300 shadow-xl shadow-slate-200/50 ${isMobile && !isMobileOpen ? 'invisible' : 'visible'}`}
      >
        {SidebarContent}
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 min-w-0 ${isMobile ? 'ml-0' : (collapsed ? 'ml-[100px]' : 'ml-[280px]')}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-24 bg-white/80 backdrop-blur-2xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button onClick={() => setIsMobileOpen(true)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all mr-2">
                <Menu size={24} />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-4 bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl md:w-[350px] lg:w-[450px] group focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:bg-white transition-all">
              <SearchIcon size={20} className="text-slate-400 group-focus-within:text-blue-600" />
              <input 
                type="text" 
                placeholder="Tìm kiếm mọi thứ..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-400 font-bold italic"
              />
            </div>
            {isMobile && (
               <button className="sm:hidden p-3 bg-slate-50 text-slate-400 rounded-2xl"><SearchIcon size={20} /></button>
            )}
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <button className="relative p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all">
              <BellIcon size={22} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-tight italic">Quản trị S-Life</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-blue-600 mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center font-black text-white shadow-xl shadow-blue-500/30">
                SL
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
