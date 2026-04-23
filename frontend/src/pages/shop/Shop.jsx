import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  SlidersHorizontal,
  X,
  Star,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/axios';

const ProductSkeleton = () => (
  <div className="p-8 bg-white/50 backdrop-blur-sm border border-white/20 rounded-[2.5rem] shadow-sm animate-pulse">
    <div className="aspect-square bg-slate-200/50 rounded-3xl mb-8" />
    <div className="h-4 bg-slate-200/50 rounded w-2/3 mb-4" />
    <div className="h-3 bg-slate-200/50 rounded w-1/4 mb-6" />
    <div className="pt-6 border-t border-slate-100/50 flex justify-between items-center">
      <div className="h-6 bg-slate-200/50 rounded w-1/3" />
      <div className="h-10 w-10 bg-slate-200/50 rounded-xl" />
    </div>
  </div>
);

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');

  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { label: "Tất cả", value: "Tất cả" },
    { label: "Đồng hồ thông minh", value: "Smartwatch" },
    { label: "Vòng đeo tay", value: "Fitness Band" },
    { label: "Thiết bị y tế", value: "Health Monitor" },
    { label: "Phụ kiện thể thao", value: "Accessories" }
  ];

  useEffect(() => {
    if (urlCategory) {
      const match = categories.find(c => c.value.toLowerCase() === urlCategory.toLowerCase());
      if (match) {
        setActiveCategory(match.value);
      } else {
        setActiveCategory("Tất cả");
      }
    } else {
      setActiveCategory("Tất cả");
    }
  }, [urlCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/products');
        const productData = response.data.contents || response.data.content || response.data;
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryChange = (val) => {
    setActiveCategory(val);
    if (val === "Tất cả") {
      searchParams.delete('category');
    } else {
      searchParams.set('category', val.toLowerCase());
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => {
      const matchesCategory = activeCategory === "Tất cả" || 
        (p.categoryName && p.categoryName.toLowerCase() === activeCategory.toLowerCase());
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <MainLayout>
      <div className="bg-[#FAFBFD] min-h-screen">
        {/* Elite Hero Section */}
        <section className="relative pt-32 pb-12 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/5 rounded-full border border-blue-600/10 mb-8">
                  <Sparkles size={14} className="text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-blue-600">S-Life Elite Edition 2026</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter italic uppercase leading-[0.85] mb-8">
                  Kỷ Nguyên <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Thiết Bị AI</span>
                </h1>
                <p className="text-slate-500 text-lg font-medium italic mb-10 max-w-lg leading-relaxed">
                  Trải nghiệm sự giao thoa giữa công nghệ AI đỉnh cao và phong cách sống thượng lưu. Hệ sinh thái sức khỏe thông minh chuẩn S-Life.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black italic uppercase tracking-widest text-xs hover:bg-blue-600 hover:scale-105 transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group">
                    Sở hữu ngay <ArrowRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black italic uppercase tracking-widest text-xs hover:border-blue-600 hover:text-blue-600 transition-all">
                    Tìm hiểu AI Advisor
                  </button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative hidden lg:block"
              >
                <div className="w-[500px] h-[500px] bg-gradient-to-tr from-blue-100 to-emerald-50 rounded-full blur-[100px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=1000" 
                  alt="Elite AI Device" 
                  className="w-full max-w-[400px] h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] floating-animation"
                />
              </motion.div>
            </div>
          </div>
          
          <div className="absolute top-40 right-[-10%] text-[20vw] font-black text-slate-100/50 select-none pointer-events-none italic uppercase tracking-tighter -z-10">
            S-LIFE
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 pb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                <span>Trang chủ</span>
                <ChevronRight size={10} />
                <span className="text-slate-900">Elite Collection</span>
              </nav>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-4">
                Bộ sưu tập Thiết bị
                <span className="text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {filteredProducts.length}
                </span>
              </h2>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative group flex-grow md:flex-grow-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm siêu phẩm AI..." 
                  className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold italic w-full md:w-[400px] focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/30 transition-all shadow-sm"
                />
              </div>
              <button 
                onClick={() => setShowMobileFilter(true)}
                className="lg:hidden p-4 bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-sm"
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-16">
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-32 space-y-12">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 italic mb-8 flex items-center gap-3">
                    <span className="w-4 h-[2px] bg-blue-600" /> Phân loại
                  </h3>
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <button 
                        key={cat.value}
                        onClick={() => handleCategoryChange(cat.value)}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all group ${
                          activeCategory === cat.value 
                          ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/10" 
                          : "text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-lg hover:bg-slate-100/50"
                        }`}
                      >
                        {cat.label}
                        <ArrowRight size={12} className={`transition-transform duration-300 ${activeCategory === cat.value ? "translate-x-0" : "-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                   <div className="relative z-10">
                    <h4 className="text-xl font-black italic uppercase leading-none mb-4">S-Life AI <br/> Advisor</h4>
                    <p className="text-[10px] font-medium italic text-blue-100 mb-6 leading-relaxed">Đội ngũ trợ lý AI luôn sẵn sàng tư vấn thiết bị phù hợp nhất với thể trạng của bạn.</p>
                    <button className="w-full py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:bg-white hover:text-blue-600 transition-all">
                      Trò chuyện ngay
                    </button>
                   </div>
                   <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>
              </div>
            </aside>

            <div className="flex-grow">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-10">
                  {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                  {filteredProducts.map((product) => (
                    <motion.div 
                      key={product.id}
                      variants={itemVariants}
                      whileHover={{ y: -4 }}
                      className="group bg-white rounded-lg overflow-hidden transition-all duration-200 border border-slate-100 flex flex-col cursor-pointer shadow-sm"
                      onClick={() => navigate(`/product/${product.slug || product.id}`)}
                    >
                      <div className="aspect-square bg-[#f5f5f5] relative overflow-hidden">
                        <img 
                          src={product.imageUrl || 'https://via.placeholder.com/300?text=S-Life+Elite'} 
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300?text=S-Life+Elite';
                          }}
                        />
                        <div className="absolute top-0 left-0">
                           <div className="bg-[#d0011b] text-white px-1.5 py-0.5 text-[8px] font-bold uppercase rounded-br-md flex items-center gap-1">
                            <Sparkles size={8} /> Mall
                          </div>
                        </div>
                      </div>

                      <div className="p-3 flex flex-col flex-grow bg-white">
                        <h4 className="text-xs font-medium text-slate-800 line-clamp-2 mb-2 min-h-[32px] leading-relaxed group-hover:text-orange-500 transition-colors">
                          {product.name}
                        </h4>
                        
                        <div className="flex items-center gap-1 mb-2">
                           <div className="flex text-amber-400">
                             <Star size={8} fill="currentColor" />
                             <Star size={8} fill="currentColor" />
                             <Star size={8} fill="currentColor" />
                             <Star size={8} fill="currentColor" />
                             <Star size={8} fill="currentColor" />
                           </div>
                           <span className="text-[9px] text-slate-400">({product.reviewCount || 10})</span>
                        </div>

                        <div className="mt-auto space-y-1">
                           <p className="text-[16px] font-bold text-[#f57224] leading-none tracking-tight">
                             {product.price.toLocaleString('vi-VN')}₫
                           </p>
                           <div className="flex items-center justify-between">
                              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Freeship Elite</span>
                              <div className="bg-slate-50 p-1 rounded-md text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <ShoppingBag size={12} />
                              </div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              {!loading && filteredProducts.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 text-center"
                >
                  <div className="w-24 h-24 bg-white border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-100">
                    <Search size={40} className="text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-4 tracking-tighter">Bộ sưu tập chưa cập nhật</h3>
                  <p className="text-slate-400 text-sm font-medium italic max-w-sm mx-auto">
                    Danh mục này hiện chưa có siêu phẩm AI phù hợp. Hãy thử tham khảo các bộ sưu tập khác tại S-Life.
                  </p>
                  <button 
                    onClick={() => handleCategoryChange("Tất cả")}
                    className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all"
                  >
                    Xem tất cả sản phẩm
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floating {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .floating-animation {
          animation: floating 6s ease-in-out infinite;
        }
      `}</style>
      
      <AnimatePresence>
        {showMobileFilter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setShowMobileFilter(false)} />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-10 pb-16 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Bộ lọc Elite</h3>
                <button onClick={() => setShowMobileFilter(false)}><X size={24} /></button>
              </div>
              <div className="space-y-4">
                {categories.map((cat) => (
                  <button 
                    key={cat.value}
                    onClick={() => { handleCategoryChange(cat.value); setShowMobileFilter(false); }}
                    className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all ${
                      activeCategory === cat.value ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default Shop;
