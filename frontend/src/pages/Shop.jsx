import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid, List, ChevronDown, SlidersHorizontal, Search, X, Check, Star, Tag, Smartphone, Watch, Headphones, Activity } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import productService from '../services/productService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmModal from '../components/ui/ConfirmModal';

const PRICE_RANGES = [
  { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { label: '1 - 3 triệu', min: 1000000, max: 3000000 },
  { label: '3 - 5 triệu', min: 3000000, max: 5000000 },
  { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
  { label: 'Trên 10 triệu', min: 10000000, max: 100000000 },
];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  
  // States for filters
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const location = useLocation();
  
  useEffect(() => {
    // Handle category and search from URL if present
    const params = new URLSearchParams(location.search);
    const categorySlug = params.get('category');
    const searchParam = params.get('search');
    
    if (categorySlug && categories.length > 0) {
      const foundCategory = categories.find(c => c.slug === categorySlug);
      if (foundCategory) {
        setSelectedCategory(foundCategory.id);
      }
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search, categories]);

  useEffect(() => {
    fetchInitialData();
  }, [selectedCategory, selectedBrand, selectedPriceRange, sortOrder, sortDirection, currentPage, searchQuery]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const params = {
        categoryId: selectedCategory,
        brandId: selectedBrand,
        minPrice: selectedPriceRange ? selectedPriceRange.min : null,
        maxPrice: selectedPriceRange ? selectedPriceRange.max : null,
        name: searchQuery || null,
        sortBy: sortOrder,
        sortOrder: sortDirection,
        pageNo: currentPage,
        pageSize: pageSize
      };
      
      const response = await productService.getAllProducts(params);
      
      if (response && response.contents) {
        setProducts(response.contents);
        setTotalPages(response.totalPages || 1);
      } else {
        setProducts([]);
        setTotalPages(0);
      }
      
      const cats = await productService.getCategories();
      setCategories(cats?.contents || cats || []);
      
      const brs = await productService.getBrands();
      setBrands(brs || []);
      
    } catch (error) {
      console.error('Failed to fetch shop data:', error);
      setProducts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedPriceRange(null);
    setSearchQuery('');
    setCurrentPage(0);
    setIsConfirmClearOpen(false);
    setIsFilterOpen(false);
  };

  const SidebarContent = () => (
    <div className="space-y-8">
      {/* Search Bar - Desktop Sidebar */}
      <div className="hidden lg:block">
        <Input 
          icon={Search}
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Tìm sản phẩm..." 
          className="w-full"
        />
      </div>

      <FilterSection title="LỌC NHANH" isOpen={true}>
         <div className="flex flex-col gap-1">
            <FilterItem 
              label="Tất cả sản phẩm" 
              active={!selectedCategory && !selectedBrand && !selectedPriceRange} 
              onClick={() => {
                if (selectedCategory || selectedBrand || selectedPriceRange) {
                  setIsConfirmClearOpen(true);
                }
              }}
              icon={<Grid size={16} />}
            />
         </div>
      </FilterSection>

      <FilterSection title="HÃNG SẢN XUẤT">
        <div className="grid grid-cols-2 gap-2">
          {brands.map(brand => (
            <button 
              key={brand.id}
              onClick={() => {
                setSelectedBrand(brand.id === selectedBrand ? null : brand.id);
                setCurrentPage(0);
              }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left truncate ${
                selectedBrand === brand.id 
                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="DANH MỤC">
        <div className="flex flex-col gap-2">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => {
                setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                setCurrentPage(0);
              }}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                selectedCategory === cat.id
                ? 'bg-primary/5 border-primary text-primary'
                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="text-xs font-black uppercase tracking-tight">{cat.name}</span>
              </div>
              <ChevronDown size={14} className={selectedCategory === cat.id ? 'text-primary' : 'text-slate-300'} />
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="GIÁ BÁN">
        <div className="flex flex-col gap-2">
          {PRICE_RANGES.map((range, index) => (
            <button 
              key={index}
              onClick={() => {
                setSelectedPriceRange(selectedPriceRange === range ? null : range);
                setCurrentPage(0);
              }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                selectedPriceRange === range
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedPriceRange === range ? 'border-white bg-primary' : 'border-slate-200 bg-white'
              }`}>
                {selectedPriceRange === range && <Check size={10} strokeWidth={4} />}
              </div>
              <span className="text-sm font-bold">{range.label}</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 lg:pt-44 pb-20 bg-[#f8fafc]">
      <ConfirmModal 
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={clearFilters}
        title="Xác nhận xóa bộ lọc"
        message="Bạn có chắc chắn muốn xóa toàn bộ các tiêu chí tìm kiếm đang chọn không?"
        confirmText="Xác nhận xóa"
      />

      <div className="container mx-auto px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <span>Trang chủ</span>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900">Tất cả sản phẩm</span>
        </div>

        {/* Page Title & Sort */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
              S-<span className="text-primary">LIFE</span> KHÁM PHÁ
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Trang bị những công nghệ đeo tay tiên tiến nhất. Từ Garmin đến Apple, mọi thứ bạn cần để nâng tầm lối sống năng động.
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => { setSortOrder('price'); setSortDirection('asc'); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${sortOrder === 'price' && sortDirection === 'asc' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Giá thấp
                </button>
                <button 
                  onClick={() => { setSortOrder('price'); setSortDirection('desc'); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${sortOrder === 'price' && sortDirection === 'desc' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Giá cao
                </button>
                <button 
                  onClick={() => { setSortOrder('updatedAt'); setSortDirection('desc'); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${sortOrder === 'updatedAt' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Mới nhất
                </button>
             </div>
             
             <Button 
               variant="outline" 
               size="icon"
               onClick={() => setIsFilterOpen(true)}
               className="lg:hidden"
               icon={SlidersHorizontal}
             />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Mobile Filter Sidebar Drawer */}
          <AnimatePresence>
            {isFilterOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFilterOpen(false)}
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] lg:hidden"
                />
                <motion.aside 
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed top-0 left-0 bottom-0 w-[90%] max-w-sm bg-white z-[70] p-8 overflow-y-auto lg:hidden flex flex-col"
                >
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-slate-900 uppercase">BỘ LỌC <span className="text-primary">S-LIFE</span></h2>
                    <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <SidebarContent />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-[300px] shrink-0">
            <div className="sticky top-44">
              <SidebarContent />
            </div>
          </aside>

          {/* Product Grid & Pagination */}
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
                >
                  {[...Array(pageSize)].map((_, i) => <SkeletonCard key={i} />)}
                </motion.div>
              ) : (
                <div className="flex flex-col gap-16">
                  <motion.div 
                    key="products"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
                  >
                    {products.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination UI */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 py-12 border-t border-slate-200">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        <ChevronDown className="rotate-90" size={20} />
                      </button>
                      
                      <div className="flex items-center gap-2">
                        {renderPaginationItems(currentPage, totalPages, handlePageChange)}
                      </div>

                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        <ChevronDown className="-rotate-90" size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
            
            {!loading && products.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-32 bg-white rounded-[40px] border border-slate-100 shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-400 mb-8 max-w-xs mx-auto">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn xem sao.</p>
                <Button 
                  variant="primary" 
                  onClick={() => setIsConfirmClearOpen(true)}
                >
                  Xóa tất cả bộ lọc
                </Button>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const FilterSection = ({ title, children, isOpen = true }) => {
  const [open, setOpen] = useState(isOpen);
  return (
    <div className="border-b border-slate-200 pb-8 last:border-0">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center mb-6 group"
      >
        <h4 className="text-slate-900 font-black text-sm uppercase tracking-[0.2em]">
          {title}
        </h4>
        <ChevronDown size={18} className={`text-slate-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

const FilterItem = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-sm font-bold transition-all ${
      active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-white hover:text-slate-900'
    }`}
  >
    {icon}
    {label}
  </button>
);

const getCategoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('đồng hồ')) return <Watch size={18} />;
  if (n.includes('tai nghe')) return <Headphones size={18} />;
  if (n.includes('phụ kiện')) return <Tag size={18} />;
  if (n.includes('sức khỏe')) return <Activity size={18} />;
  return <Smartphone size={18} />;
};

const renderPaginationItems = (currentPage, totalPages, handlePageChange) => {
  const items = [];
  const maxVisible = 4;
  
  for (let i = 0; i < totalPages; i++) {
    if (
      i === 0 || 
      i === totalPages - 1 || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      items.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
            currentPage === i 
            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
            : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary shadow-sm'
          }`}
        >
          {i + 1}
        </button>
      );
    } else if (i === 1 || i === totalPages - 2) {
      items.push(<span key={i} className="text-slate-300 font-black px-1">...</span>);
    }
  }
  
  return items;
};

const SkeletonCard = () => (
  <div className="bg-white rounded-[40px] p-6 h-[450px] border border-slate-100 shadow-sm flex flex-col gap-4">
    <div className="w-full h-64 bg-slate-50 rounded-[32px] animate-pulse" />
    <div className="h-6 w-3/4 bg-slate-50 rounded-full animate-pulse" />
    <div className="h-4 w-1/2 bg-slate-50 rounded-full animate-pulse" />
    <div className="mt-auto flex justify-between">
      <div className="h-8 w-24 bg-slate-50 rounded-full animate-pulse" />
      <div className="h-10 w-10 bg-slate-50 rounded-xl animate-pulse" />
    </div>
  </div>
);

export default Shop;
