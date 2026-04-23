import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Menu, 
  X, 
} from 'lucide-react';
import { SearchIcon } from './IconComponents';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Apple Watch Series 9', price: '9.990.000₫', image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=200' },
  { id: '2', name: 'Garmin Fenix 7 Pro', price: '18.490.000₫', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200' },
  { id: '3', name: 'Fitbit Charge 6 Smart', price: '3.990.000₫', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=200' },
  { id: '4', name: 'Samsung Galaxy Watch 6', price: '6.490.000₫', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=200' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const token = localStorage.getItem('slife_token');
    const storedUsername = localStorage.getItem('slife_username');
    const storedRole = localStorage.getItem('slife_role');
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUsername || 'Member');
      setRole(storedRole || 'ROLE_USER');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const filteredProducts = searchQuery.length > 0 
    ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const navLinks = [
    { name: 'Đồng hồ', path: '/shop?category=smartwatch' },
    { name: 'Vòng đeo tay', path: '/shop?category=fitness-band' },
    { name: 'Phụ kiện thể thao', path: '/shop?category=accessories' },
  ];

  return (
    <>
      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-[300px] bg-white z-[70] p-10 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-16">
                <img src="/logo_final.png" alt="S-Life Logo" className="h-20 w-auto drop-shadow-md mix-blend-multiply" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-all">
                  <X size={28} />
                </button>
              </div>
              <nav className="flex flex-col gap-8">
                {navLinks.map((item) => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-black italic uppercase tracking-tighter text-slate-400 hover:text-blue-600 transition-all"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto space-y-4">
                {isLoggedIn ? (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Chào mừng</p>
                      <p className="text-sm font-black text-slate-900 italic">{username}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full py-5 bg-rose-500 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-rose-500/20"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full py-5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20">
                        Đăng nhập
                      </button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full py-5 bg-slate-50 text-slate-900 font-black italic uppercase tracking-widest text-xs rounded-2xl border border-slate-200">
                        Đăng ký
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3 border-b border-slate-100 bg-white/80 backdrop-blur-xl shadow-sm' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img 
                src="/logo_final.png" 
                alt="S-Life Logo" 
                className="h-14 w-auto drop-shadow-sm group-hover:scale-105 transition-transform duration-300 mix-blend-multiply" 
              />
              <span className="text-3xl font-black tracking-tighter text-slate-900 italic">S-Life</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`nav-link text-[10px] uppercase tracking-[0.2em] font-black italic transition-colors whitespace-nowrap ${location.pathname === link.path ? 'text-blue-600' : 'text-slate-900'}`}
                >
                  {link.name}
                </Link>
              ))}
              {isLoggedIn && role === 'ROLE_ADMIN' && (
                <Link to="/admin" className="text-[10px] uppercase tracking-[0.2em] font-black italic text-rose-500 hover:text-rose-600 transition-colors">
                  Quản trị
                </Link>
              )}
            </div>
          </div>

          {/* Inline Search Bar */}
          <div className="hidden md:block relative flex-1 max-w-sm mx-8">
            <div className={`relative flex items-center transition-all duration-300 ${showResults && searchQuery ? 'bg-white shadow-xl' : 'bg-slate-100/50 hover:bg-slate-100'} rounded-2xl px-4 py-2 border border-transparent focus-within:border-blue-600/20`}>
              <SearchIcon size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm thiết bị..." 
                className="bg-transparent border-none focus:ring-0 w-full text-xs font-bold italic text-slate-900 placeholder-slate-400 px-3 py-1 outline-none"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Live Search Dropdown */}
            <AnimatePresence>
              {showResults && searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100]"
                >
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Kết quả tìm kiếm ({filteredProducts.length})</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => (
                        <Link 
                          key={p.id} 
                          to={`/product/${p.id}`} 
                          className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-none group"
                        >
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 border border-slate-100 group-hover:border-blue-200 transition-colors">
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-black italic uppercase text-slate-900 truncate group-hover:text-blue-600 transition-colors">{p.name}</h4>
                            <p className="text-[10px] font-black italic text-blue-600 mt-0.5">{p.price}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-10 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <SearchIcon size={24} className="text-slate-200" />
                        </div>
                        <p className="text-[11px] font-black italic uppercase text-slate-400">Không tìm thấy sản phẩm nào</p>
                      </div>
                    )}
                  </div>
                  {filteredProducts.length > 0 && (
                    <Link to={`/shop?q=${searchQuery}`} className="block p-4 bg-blue-600 text-white text-center text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-blue-700 transition-colors">
                      Xem tất cả kết quả
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative p-2.5 text-slate-400 hover:text-blue-600 transition-colors">
              <ShoppingCart size={22} />
              <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-[10px] flex items-center justify-center rounded-full text-white font-bold">0</span>
            </Link>
            <button className="md:hidden p-2.5 text-slate-400 hover:text-blue-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black italic uppercase text-slate-400 tracking-widest">{role === 'ROLE_ADMIN' ? 'Administrator' : 'Member'}</span>
                    <span className="text-[11px] font-black italic uppercase text-slate-900 tracking-tighter">{username}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-slate-50 text-slate-400 font-black italic uppercase tracking-widest text-[10px] rounded-full border border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <button className="px-5 py-2.5 text-slate-900 font-black italic uppercase tracking-widest text-[10px] hover:text-blue-600 transition-all">
                      Đăng nhập
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-5 py-2.5 bg-blue-600 text-white font-black italic uppercase tracking-widest text-[10px] rounded-full shadow-lg shadow-blue-500/20 hover:scale-105 transition-all active:scale-95">
                      Đăng ký ngay
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
