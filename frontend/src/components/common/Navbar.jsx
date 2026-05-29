import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, LogOut, Settings, Loader2, Watch, Headphones, Tag, Activity } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ConfirmModal from '../ui/ConfirmModal';
import { resolveApiAssetUrl } from '../../config/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clear UI states on logout
  useEffect(() => {
    if (!user) {
      setIsUserMenuOpen(false);
      setIsLogoutConfirmOpen(false);
      setSearchQuery('');
    }
  }, [user]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsLogoutConfirmOpen(false);
    setSearchResults([]);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    logout();
    navigate('/', { replace: true });
  };

  // Real-time search logic with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const response = await productService.getAllProducts({ 
            name: searchQuery,
            pageSize: 6
          });
          setSearchResults(response.data?.content || response.content || []);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <>
    <nav className={`sticky top-0 left-0 right-0 z-[100] border-b border-slate-200 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
      isScrolled 
        ? 'shadow-sm'
        : 'shadow-none'
    }`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3 lg:gap-6">
          
          {/* 1. Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-8 w-8 overflow-hidden transition-transform duration-300 group-hover:scale-105 sm:h-9 sm:w-9">
              <img src="/logo_final.png" alt="S-Life Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-blue-600 sm:text-2xl">S-LIFE</span>
          </Link>

          {/* 2. Navigation Links (Desktop) */}
          <div className="hidden xl:flex items-center gap-8 shrink-0">
            <NavLink to="/" active={location.pathname === '/'}>TRANG CHỦ</NavLink>
            <NavLink to="/shop" active={location.pathname === '/shop'}>CỬA HÀNG</NavLink>
            
            {/* Mega Menu Trigger */}
            <div className="group relative">
              <NavLink to="/categories" active={location.pathname === '/categories'}>
                DANH MỤC <ChevronDown size={14} className="inline ml-1 group-hover:rotate-180 transition-transform duration-300" />
              </NavLink>
              
              {/* Mega Menu Content */}
              <div className="invisible absolute left-1/2 top-full z-50 w-[720px] -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10">
                  <div className="grid grid-cols-2 gap-2">
                  <MegaMenuColumn 
                    icon={<Watch size={24} className="text-blue-600" />}
                    title="Đồng hồ thể thao"
                    slug="dong-ho-the-thao"
                    description="GPS, luyện tập, theo dõi sức khỏe 24/7."
                    image="/assets/categories/sports_watch.png"
                  />

                  <MegaMenuColumn 
                    icon={<Headphones size={24} className="text-blue-600" />}
                    title="Tai nghe Bluetooth"
                    slug="tai-nghe-bluetooth"
                    description="Âm thanh gọn nhẹ cho làm việc và vận động."
                    image="/assets/categories/earbuds.png"
                  />

                  <MegaMenuColumn 
                    icon={<Activity size={24} className="text-blue-600" />}
                    title="Theo dõi sức khỏe"
                    slug="vong-theo-doi-suc-khoe"
                    description="Vòng đeo tay, nhịp tim, giấc ngủ, SpO2."
                    image="/assets/categories/health_band.png"
                  />

                  <MegaMenuColumn 
                    icon={<Tag size={24} className="text-blue-600" />}
                    title="Phụ kiện cao cấp"
                    slug="phu-kien-dong-ho"
                    description="Dây đeo, bảo vệ màn hình và dock sạc."
                    image="/assets/categories/straps.png"
                  />
                  </div>
                  <div className="mt-2 border-t border-slate-100 px-2 pt-3">
                    <Link
                      to="/categories"
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-700 hover:text-blue-800"
                    >
                      Xem tất cả danh mục
                      <ChevronDown size={14} className="-rotate-90" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 3. Search Pill (Compact) */}
          <div className="hidden lg:flex flex-grow max-w-md relative">
            <Input
              icon={Search}
              placeholder="Tìm sản phẩm…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-primary" size={16} />
              </div>
            )}
            {/* Compact Search Results */}
            <AnimatePresence>
              {(searchResults.length > 0 || (searchQuery.trim().length > 1 && !isSearching)) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 right-0 z-[60] mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
                >
                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug}`}
                          onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                          className="flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-all group/item"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-50 p-1 flex-shrink-0">
                            <img src={product.imageUrl || '/logo_final.png'} alt={product.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate group-hover/item:text-blue-600">{product.name}</h4>
                            <p className="text-xs font-black text-blue-600 mt-0.5">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-xs text-slate-400 font-bold">Không có kết quả</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link to="/cart" className="group relative rounded-xl bg-slate-50 p-2.5 transition-colors duration-200 hover:bg-blue-600" aria-label="Giỏ hàng">
              <ShoppingCart size={20} className="text-slate-900 group-hover:text-white transition-colors" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-[10px] flex items-center justify-center rounded-full text-white font-black border-2 border-white shadow-md"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {user ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 pr-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs overflow-hidden">
                    {user?.imageUrl ? (
                      <img src={resolveApiAssetUrl(user.imageUrl)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-900 hidden lg:inline">
                    {(user?.firstName && user.firstName !== 'null') ? user.firstName : user?.username}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
                    >
                      <div className="px-5 py-4 border-b border-slate-50 mb-1">
                        <p className="text-sm font-black text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer'}</p>
                      </div>
                      <div className="space-y-1">
                        {user.role === 'ROLE_ADMIN' && (
                          <Link to="/admin" className="flex items-center gap-3 p-3 rounded-2xl bg-blue-600 text-white text-[11px] font-black transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/20 mb-2" onClick={() => setIsUserMenuOpen(false)}>
                            <Settings size={16} /> QUẢN TRỊ HỆ THỐNG
                          </Link>
                        )}
                        <MenuOption to="/profile" icon={<User size={16} />} label="Trang cá nhân" onClick={() => setIsUserMenuOpen(false)} />
                        <MenuOption to="/orders" icon={<ShoppingCart size={16} />} label="Lịch sử đơn hàng" onClick={() => setIsUserMenuOpen(false)} />
                        <div className="h-px bg-slate-50 my-2 mx-3" />
                        <button 
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsLogoutConfirmOpen(true);
                          }} 
                          className="w-full flex items-center gap-3 p-3 rounded-2xl text-primary hover:bg-primary/5 text-[11px] font-black uppercase transition-all"
                        >
                          <LogOut size={16} /> Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="md" 
                onClick={() => navigate('/login')}
                className="hidden sm:flex"
              >
                Đăng nhập
              </Button>
            )}

            {/* Mobile Trigger */}
            <button
              type="button"
              className="rounded-xl bg-slate-50 p-2.5 text-slate-900 transition-transform active:scale-95 xl:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mở menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

	    </nav>
	    <AnimatePresence>
	      {isMobileMenuOpen && (
	        <>
	          <motion.div
	            initial={{ opacity: 0 }}
	            animate={{ opacity: 1 }}
	            exit={{ opacity: 0 }}
	            onClick={() => setIsMobileMenuOpen(false)}
	            className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-sm xl:hidden"
	          />
	          <motion.div
	            initial={{ y: 24, opacity: 0 }}
	            animate={{ y: 0, opacity: 1 }}
	            exit={{ y: 24, opacity: 0 }}
	            transition={{ duration: 0.2, ease: 'easeOut' }}
	            className="fixed inset-x-3 top-3 bottom-3 z-[120] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl xl:hidden"
	            role="dialog"
	            aria-modal="true"
	            aria-label="Menu điều hướng"
	          >
	            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
	              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex min-w-0 items-center gap-3">
	                <img src="/logo_final.png" alt="S-LIFE" className="h-9 w-9 shrink-0 object-contain" />
	                <span className="truncate text-xl font-black tracking-tight text-slate-950" translate="no">S-LIFE</span>
	              </Link>
	              <button
	                type="button"
	                onClick={() => setIsMobileMenuOpen(false)}
	                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
	                aria-label="Đóng menu"
	              >
	                <X size={20} />
	              </button>
	            </div>

	            <div className="flex-1 overflow-y-auto p-5">
	              <div className="mb-5">
	                <Input
	                  icon={Search}
	                  value={searchQuery}
	                  onChange={(event) => setSearchQuery(event.target.value)}
	                  placeholder="Tìm sản phẩm…"
	                  name="mobileSearch"
	                  autoComplete="off"
	                />
	              </div>

	              <div className="space-y-2">
	                <MobileNavLink to="/" active={location.pathname === '/'} onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</MobileNavLink>
	                <MobileNavLink to="/shop" active={location.pathname === '/shop'} onClick={() => setIsMobileMenuOpen(false)}>Cửa hàng</MobileNavLink>
	                <MobileNavLink to="/categories" active={location.pathname === '/categories'} onClick={() => setIsMobileMenuOpen(false)}>Danh mục</MobileNavLink>
	                {user && (
	                  <>
	                    <MobileNavLink to="/profile" active={location.pathname === '/profile'} onClick={() => setIsMobileMenuOpen(false)}>Trang cá nhân</MobileNavLink>
	                    <MobileNavLink to="/orders" active={location.pathname.startsWith('/orders')} onClick={() => setIsMobileMenuOpen(false)}>Lịch sử đơn hàng</MobileNavLink>
	                  </>
	                )}
	              </div>
	            </div>

	            <div className="border-t border-slate-100 p-5">
	              {!user ? (
	                <Link
	                  to="/login"
	                  onClick={() => setIsMobileMenuOpen(false)}
	                  className="flex items-center justify-center rounded-xl bg-slate-900 p-4 text-[11px] font-black uppercase tracking-widest text-white hover:bg-slate-800"
	                >
	                  Đăng nhập
	                </Link>
	              ) : (
	                <button
	                  type="button"
	                  onClick={() => {
	                    setIsMobileMenuOpen(false);
	                    setIsLogoutConfirmOpen(true);
	                  }}
	                  className="w-full rounded-xl bg-rose-50 p-4 text-[11px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100"
	                >
	                  Đăng xuất
	                </button>
	              )}
	            </div>
	          </motion.div>
	        </>
	      )}
	    </AnimatePresence>
    <ConfirmModal
      isOpen={isLogoutConfirmOpen}
      onClose={() => setIsLogoutConfirmOpen(false)}
      onConfirm={handleConfirmLogout}
      title="Xác nhận đăng xuất"
      message="Bạn có chắc chắn muốn rời khỏi tài khoản S-Life của mình không?"
      confirmText="Đăng xuất"
      variant="danger"
    />
    </>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link to={to} className={`relative py-1 text-sm font-black tracking-tight transition-all duration-300 group ${
    active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
  }`}>
    {children}
    <div className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
      active ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-40'
    }`} />
  </Link>
);

const MobileNavLink = ({ to, onClick, children, active = false }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`group flex items-center justify-between rounded-xl p-4 font-bold transition-colors ${
      active ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900 hover:bg-blue-50 hover:text-blue-700'
    }`}
  >
    <span className="text-xs uppercase tracking-widest">{children}</span>
    <ChevronDown size={18} className="-rotate-90 opacity-40" />
  </Link>
);

const MenuOption = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all group">
    <span className="text-slate-400 group-hover:text-blue-600 transition-colors">{icon}</span>
    {label}
  </Link>
);

const MegaMenuColumn = ({ icon, title, slug, description, image }) => (
  <Link
    to={`/shop?category=${slug}`}
    className="group/menu grid min-h-[130px] grid-cols-[1fr_92px] gap-3 rounded-xl border border-transparent bg-slate-50 p-4 transition-all hover:border-blue-200 hover:bg-white hover:shadow-sm"
  >
    <div className="min-w-0">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-colors group-hover/menu:bg-blue-50">
        {icon}
      </div>
      <h4 className="text-sm font-black uppercase leading-snug tracking-tight text-slate-950 transition-colors group-hover/menu:text-blue-700">
        {title}
      </h4>
      <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
    <div className="flex items-center justify-center rounded-xl bg-white p-2">
      <img src={image} alt={title} className="h-16 w-16 object-contain transition-transform group-hover/menu:scale-105" />
    </div>
  </Link>
);

export default Navbar;
