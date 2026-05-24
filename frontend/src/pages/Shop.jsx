import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid, ChevronDown, SlidersHorizontal, Search, X, Check, Tag, Smartphone, Watch, Headphones, Activity } from 'lucide-react';
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
  const pageSize = 12;

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
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, selectedPriceRange, sortOrder, sortDirection, currentPage, searchQuery]);

  const fetchFilterData = async () => {
    try {
      const [cats, brs] = await Promise.all([
        productService.getCategories(),
        productService.getBrands()
      ]);
      setCategories(cats?.contents || cats || []);
      setBrands(brs || []);
    } catch (error) {
      console.error('Failed to fetch shop filters:', error);
    }
  };

  const fetchProducts = async () => {
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
    <div className="min-h-screen bg-slate-50 pb-16 pt-28 lg:pt-36">
      <ConfirmModal 
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={clearFilters}
        title="Xác nhận xóa bộ lọc"
        message="Bạn có chắc chắn muốn xóa toàn bộ các tiêu chí tìm kiếm đang chọn không?"
        confirmText="Xác nhận xóa"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>Trang chủ</span>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900">Tất cả sản phẩm</span>
        </div>

        <div className="mb-8 flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
              Khám phá sản phẩm S-LIFE
            </h1>
            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              Tìm kiếm thiết bị sức khỏe, công nghệ đeo và phụ kiện phù hợp với nhu cầu của bạn.
            </p>
          </div>
          
          <div className="flex w-full items-center gap-3 overflow-x-auto lg:w-auto">
             <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                <button 
                  onClick={() => { setSortOrder('price'); setSortDirection('asc'); }}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${sortOrder === 'price' && sortDirection === 'asc' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Giá thấp
                </button>
                <button 
                  onClick={() => { setSortOrder('price'); setSortDirection('desc'); }}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${sortOrder === 'price' && sortDirection === 'desc' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Giá cao
                </button>
                <button 
                  onClick={() => { setSortOrder('updatedAt'); setSortDirection('desc'); }}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${sortOrder === 'updatedAt' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
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

        <div className="flex flex-col gap-8 lg:flex-row">
          {isFilterOpen && (
            <>
                <div
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 z-[60] bg-slate-900/50 lg:hidden"
              />
              <aside className="fixed bottom-0 left-0 top-0 z-[70] flex w-[90%] max-w-sm flex-col overflow-y-auto bg-white p-6 lg:hidden">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-950">Bộ lọc S-LIFE</h2>
                    <button onClick={() => setIsFilterOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900">
                      <X size={20} />
                    </button>
                  </div>
                  <SidebarContent />
              </aside>
            </>
          )}

          <aside className="hidden shrink-0 lg:block lg:w-[300px]">
            <div className="sticky top-32 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SidebarContent />
            </div>
          </aside>

          <main className="flex-grow">
              {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(pageSize)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <div key={product.id}>
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 border-t border-slate-200 py-8">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDown className="rotate-90" size={20} />
                      </button>
                      
                      <div className="flex items-center gap-2">
                        {renderPaginationItems(currentPage, totalPages, handlePageChange)}
                      </div>

                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDown className="-rotate-90" size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            
            {!loading && products.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white py-24 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                  <Search size={32} className="text-slate-300" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-950">Không tìm thấy sản phẩm</h3>
                <p className="mx-auto mb-8 max-w-xs text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                <Button 
                  variant="primary" 
                  onClick={() => setIsConfirmClearOpen(true)}
                >
                  Xóa tất cả bộ lọc
                </Button>
              </div>
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
          className={`h-11 w-11 rounded-xl text-sm font-semibold transition-colors ${
            currentPage === i 
            ? 'bg-slate-900 text-white'
            : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700'
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
  <div className="flex h-[390px] flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="h-56 w-full animate-pulse rounded-xl bg-slate-100" />
    <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
    <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
    <div className="mt-auto flex justify-between">
      <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />
      <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
    </div>
  </div>
);

export default Shop;
