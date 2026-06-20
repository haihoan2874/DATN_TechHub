import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronRight,
  LogOut,
  Menu,
  Users,
  X
} from 'lucide-react';

import ConfirmModal from '../components/ui/ConfirmModal';
import { adminNavigation } from '../config/adminNavigation';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDesktopLayout, setIsDesktopLayout] = useState(() => (
    typeof window === 'undefined' ? true : window.innerWidth >= 1024
  ));
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => (
    typeof window === 'undefined' ? true : window.innerWidth >= 1024
  ));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const nextIsDesktop = window.innerWidth >= 1024;
      setIsDesktopLayout(nextIsDesktop);
      setIsSidebarOpen(nextIsDesktop);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktopLayout) {
      setIsSidebarOpen(false);
    }
  }, [isDesktopLayout, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  const closeSidebarOnSmallScreen = () => {
    if (!isDesktopLayout) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-transparent text-slate-950">
      {!isDesktopLayout && isSidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu quản trị"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <motion.aside 
        initial={false}
        animate={{
          width: isDesktopLayout ? (isSidebarOpen ? 256 : 76) : 256,
          x: isDesktopLayout || isSidebarOpen ? 0 : -280,
        }}
        className="fixed inset-y-0 left-0 z-50 flex h-full flex-shrink-0 flex-col border-r border-slate-200 bg-white text-slate-600 lg:relative"
      >
        <div className="flex h-16 items-center border-b border-slate-200 px-4">
          <Link to="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              S
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-950">S-LIFE</p>
                <p className="text-xs font-semibold text-slate-500">Quản trị hệ thống</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 no-scrollbar">
          {adminNavigation.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebarOnSmallScreen}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'} transition-colors`}>
                  <Icon size={20} />
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

        <div className="border-t border-slate-200 p-3">
          {isSidebarOpen ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="truncate text-sm font-bold text-slate-950">{user?.username}</div>
                  <div className="truncate text-xs text-slate-500">Quản trị viên</div>
                </div>
              </div>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100 active:scale-[0.98]"
              >
                <LogOut size={14} /> Đăng xuất
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="flex w-full items-center justify-center rounded-xl py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </motion.aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900">{user?.username}</div>
                <div className="text-xs font-semibold text-slate-500">Đang hoạt động</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Users size={20} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-transparent p-4 custom-scrollbar sm:p-6">
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
