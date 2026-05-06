import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, LogOut, Settings, Loader2, Heart, Watch, Headphones, Tag, Smartphone, Activity } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ConfirmModal from '../ui/ConfirmModal';

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
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] py-3 border-b border-slate-200/50' 
        : 'bg-white py-5 border-b border-slate-200/60'
    }`}>
      <div className="container mx-auto px-4 lg:px-10">
        <div className="flex items-center justify-between gap-6 lg:gap-12">
          
          {/* 1. Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 lg:w-12 lg:h-12 overflow-hidden transform group-hover:scale-110 transition-transform duration-500">
              <img src="/logo_final.png" alt="S-Life Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-2xl lg:text-3xl tracking-tighter text-slate-900 group-hover:text-blue-600 transition-all duration-300">S-LIFE</span>
          </Link>

          {/* 2. Navigation Links (Desktop) */}
          <div className="hidden xl:flex items-center gap-10 shrink-0">
            <NavLink to="/" active={location.pathname === '/'}>TRANG CHỦ</NavLink>
            <NavLink to="/shop" active={location.pathname === '/shop'}>CỬA HÀNG</NavLink>
            
            {/* Mega Menu Trigger */}
            <div className="group relative">
              <NavLink to="/categories" active={location.pathname === '/categories'}>
                DANH MỤC <ChevronDown size={14} className="inline ml-1 group-hover:rotate-180 transition-transform duration-300" />
              </NavLink>
              
              {/* Mega Menu Content */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-10 min-w-[800px] flex gap-12">
                  
                  {/* Category Column 1: Watches */}
                  <MegaMenuColumn 
                    icon={<Watch size={24} className="text-blue-600" />}
                    title="Đồng hồ thể thao"
                    slug="dong-ho-the-thao"
                    items={["Garmin Series", "Apple Watch", "Samsung Galaxy", "Suunto / Coros"]}
                  />

                  {/* Category Column 2: Audio */}
                  <MegaMenuColumn 
                    icon={<Headphones size={24} className="text-blue-600" />}
                    title="Tai nghe Bluetooth"
                    slug="tai-nghe-bluetooth"
                    items={["Sony Audio", "Apple AirPods", "Jabra Sports", "JBL / Marshall"]}
                  />

                  {/* Category Column 3: Health */}
                  <MegaMenuColumn 
                    icon={<Activity size={24} className="text-blue-600" />}
                    title="Theo dõi sức khỏe"
                    slug="vong-theo-doi-suc-khoe"
                    items={["Fitbit Band", "Xiaomi Smartband", "Whoop Strap", "Oura Ring"]}
                  />

                  {/* Category Column 4: Accessories */}
                  <MegaMenuColumn 
                    icon={<Tag size={24} className="text-blue-600" />}
                    title="Phụ kiện cao cấp"
                    slug="phu-kien-dong-ho"
                    items={["Dây da thủ công", "Dây Nylon / Silicon", "Cường lực & Bảo vệ", "Dock sạc thông minh"]}
                  />

                </div>
              </div>
            </div>

          </div>

          {/* 3. Search Pill (Compact) */}
          <div className="hidden lg:flex flex-grow max-w-sm relative">
            <Input
              icon={Search}
              placeholder="Tìm sản phẩm..."
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
                  className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[60] p-2"
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
            <Link to="/cart" className="relative p-3 group bg-slate-50 rounded-xl hover:bg-blue-600 transition-all duration-300">
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
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 pr-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs overflow-hidden">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl.startsWith('http') ? user.imageUrl : `http://localhost:8089${user.imageUrl}`} alt="Avatar" className="w-full h-full object-cover" />
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
                      className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-slate-50 mb-1">
                        <p className="text-sm font-black text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer'}</p>
                      </div>
                      <div className="space-y-1">
                        {user.role === 'ROLE_ADMIN' && (
                          <Link to="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-2xl bg-blue-600 text-white text-[11px] font-black transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/20 mb-2" onClick={() => setIsUserMenuOpen(false)}>
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
            <button className="xl:hidden p-3 bg-slate-50 rounded-xl text-slate-900 active:scale-90 transition-transform" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] xl:hidden" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 bottom-0 w-full max-w-[300px] bg-white z-[120] xl:hidden shadow-2xl flex flex-col p-8" >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <img src="/logo_final.png" alt="Logo" className="w-10 h-10" />
                  <span className="font-black text-2xl tracking-tighter text-slate-900">S-LIFE</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-xl"><X size={20} /></button>
              </div>

              <div className="space-y-2 mb-12">
                <MobileNavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</MobileNavLink>
                <MobileNavLink to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Cửa hàng</MobileNavLink>
                <MobileNavLink to="/categories" onClick={() => setIsMobileMenuOpen(false)}>Danh mục</MobileNavLink>
              </div>

              <div className="mt-auto">
                {!user ? (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center p-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] tracking-widest">
                    ĐĂNG NHẬP
                  </Link>
                ) : (
                  <button 
                    onClick={() => { 
                      setIsMobileMenuOpen(false);
                      setIsLogoutConfirmOpen(true);
                    }} 
                    className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-[11px]"
                  >
                    ĐĂNG XUẤT
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Logout Confirmation Modal */}
      <ConfirmModal 
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={async () => {
          setIsLogoutConfirmOpen(false);
          await logout();
          navigate('/');
        }}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn rời khỏi tài khoản S-Life của mình không?"
        confirmText="Đăng xuất"
        variant="danger"
      />
    </nav>
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

const MobileNavLink = ({ to, onClick, children }) => (
  <Link to={to} onClick={onClick} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-900 font-bold hover:bg-blue-600 hover:text-white transition-all group">
    <span className="text-xs uppercase tracking-widest">{children}</span>
    <ChevronDown size={18} className="-rotate-90 opacity-30" />
  </Link>
);

const MenuOption = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all group">
    <span className="text-slate-400 group-hover:text-blue-600 transition-colors">{icon}</span>
    {label}
  </Link>
);

const MegaMenuColumn = ({ icon, title, slug, items }) => (
  <div className="flex-1 space-y-6">
    <Link to={`/shop?category=${slug}`} className="flex items-center gap-3 group/title">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover/title:bg-blue-600 group-hover/title:text-white transition-all">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover/title:text-blue-600 transition-colors">{title}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Khám phá ngay</p>
      </div>
    </Link>
    <div className="space-y-3 pl-15">
      {items.map((item, i) => (
        <Link 
          key={i} 
          to={`/shop?category=${slug}&search=${item.split(' ')[0]}`} 
          className="block text-xs font-bold text-slate-500 hover:text-blue-600 hover:translate-x-1 transition-all"
        >
          {item}
        </Link>
      ))}
    </div>
  </div>
);

export default Navbar;
