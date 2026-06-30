import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import productService from '../services/productService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmModal from '../components/ui/ConfirmModal';
import ShopSidebar, { PRICE_RANGES } from './ShopComponents/ShopSidebar';
import ShopProductGrid from './ShopComponents/ShopProductGrid';

const PAGE_SIZE = 12;
const DEFAULT_SORT = 'updatedAt';
const DEFAULT_DIRECTION = 'desc';

const SortButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-w-0 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 ${
      active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {children}
  </button>
);

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isUrlHydrated, setIsUrlHydrated] = useState(false);
  const lastSyncedSearchRef = useRef('');
  const isHydratingFromUrlRef = useRef(false);

  // States for filters
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortOrder, setSortOrder] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!categories.length && !brands.length) return;

    isHydratingFromUrlRef.current = true;
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const brandParam = params.get('brand');
    const priceParam = params.get('price');
    const searchParam = params.get('search');
    const sortParam = params.get('sort');
    const dirParam = params.get('dir');
    const pageParam = Number(params.get('page'));
    
    const nextCategory = categoryParam
      ? categories.find(c => c.slug === categoryParam || c.id === categoryParam)?.id || null
      : null;
    const nextBrand = brandParam
      ? brands.find(b => b.slug === brandParam || b.id === brandParam || b.name === brandParam)?.id || null
      : null;
    const nextPriceRange = priceParam
      ? PRICE_RANGES.find((range) => range.key === priceParam) || null
      : null;

    setSelectedCategory(nextCategory);
    setSelectedBrand(nextBrand);
    setSelectedPriceRange(nextPriceRange);
    setSearchKeyword((searchParam || '').trim());
    setSearchInput((searchParam || '').trim());
    setSortOrder(sortParam === 'price' ? 'price' : DEFAULT_SORT);
    setSortDirection(dirParam === 'asc' ? 'asc' : DEFAULT_DIRECTION);
    setCurrentPage(Number.isInteger(pageParam) && pageParam > 1 ? pageParam - 1 : 0);
    setIsUrlHydrated(true);
  }, [brands, categories, location.search]);

  const buildShopSearch = useCallback(() => {
    const params = new URLSearchParams();
    const category = categories.find((item) => item.id === selectedCategory);
    const brand = brands.find((item) => item.id === selectedBrand);

    if (searchKeyword) params.set('search', searchKeyword);
    if (category) params.set('category', category.slug || category.id);
    if (brand) params.set('brand', brand.slug || brand.name || brand.id);
    if (selectedPriceRange) params.set('price', selectedPriceRange.key);
    if (sortOrder !== DEFAULT_SORT) params.set('sort', sortOrder);
    if (sortDirection !== DEFAULT_DIRECTION) params.set('dir', sortDirection);
    if (currentPage > 0) params.set('page', String(currentPage + 1));

    return params.toString();
  }, [
    brands,
    categories,
    currentPage,
    searchKeyword,
    selectedBrand,
    selectedCategory,
    selectedPriceRange,
    sortDirection,
    sortOrder
  ]);

  useEffect(() => {
    if (!isUrlHydrated) return;

    if (isHydratingFromUrlRef.current) {
      isHydratingFromUrlRef.current = false;
      lastSyncedSearchRef.current = location.search.replace(/^\?/, '');
      return;
    }

    const nextSearch = buildShopSearch();
    const currentSearch = location.search.replace(/^\?/, '');

    if (nextSearch !== currentSearch && nextSearch !== lastSyncedSearchRef.current) {
      lastSyncedSearchRef.current = nextSearch;
      navigate(
        { pathname: location.pathname, search: nextSearch ? `?${nextSearch}` : '' },
        { replace: true }
      );
    }
  }, [buildShopSearch, isUrlHydrated, location.pathname, location.search, navigate]);

  const fetchFilterData = useCallback(async () => {
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
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        categoryId: selectedCategory,
        brandId: selectedBrand,
        minPrice: selectedPriceRange ? selectedPriceRange.min : null,
        maxPrice: selectedPriceRange ? selectedPriceRange.max : null,
        name: searchKeyword || null,
        sortBy: sortOrder,
        sortOrder: sortDirection,
        pageNo: currentPage,
        pageSize: PAGE_SIZE,
        isActive: true
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
  }, [
    currentPage,
    searchKeyword,
    selectedBrand,
    selectedCategory,
    selectedPriceRange,
    sortDirection,
    sortOrder
  ]);

  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData]);

  useEffect(() => {
    if (!isUrlHydrated) return;
    fetchProducts();
  }, [fetchProducts, isUrlHydrated]);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (selectedCategory) {
      const category = categories.find((item) => item.id === selectedCategory);
      filters.push({ key: 'category', label: category?.name || 'Danh mục' });
    }
    if (selectedBrand) {
      const brand = brands.find((item) => item.id === selectedBrand);
      filters.push({ key: 'brand', label: brand?.name || 'Thương hiệu' });
    }
    if (selectedPriceRange) {
      filters.push({ key: 'price', label: selectedPriceRange.label });
    }
    if (searchKeyword) {
      filters.push({ key: 'search', label: searchKeyword });
    }
    return filters;
  }, [brands, categories, searchKeyword, selectedBrand, selectedCategory, selectedPriceRange]);

  const removeFilter = (key) => {
    if (key === 'category') setSelectedCategory(null);
    if (key === 'brand') setSelectedBrand(null);
    if (key === 'price') setSelectedPriceRange(null);
    if (key === 'search') {
      setSearchKeyword('');
      setSearchInput('');
    }
    setCurrentPage(0);
  };

  const handleProductSearchSubmit = (event) => {
    event.preventDefault();
    setSearchKeyword(searchInput.trim());
    setCurrentPage(0);
  };

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedPriceRange(null);
    setSearchKeyword('');
    setSearchInput('');
    setCurrentPage(0);
    setIsConfirmClearOpen(false);
    setIsFilterOpen(false);
  };



  return (
    <div className="min-h-screen bg-transparent py-6 sm:py-8 lg:py-10">
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={clearFilters}
        title="Xác nhận xóa bộ lọc"
        message="Bạn có chắc chắn muốn xóa toàn bộ các tiêu chí tìm kiếm đang chọn không?"
        confirmText="Xác nhận xóa"
      />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>Trang chủ</span>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900">Tất cả sản phẩm</span>
        </div>

        <div className="mb-5 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
              Khám phá sản phẩm S-LIFE
            </h1>
            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              Tìm kiếm thiết bị sức khỏe, công nghệ đeo và phụ kiện phù hợp với nhu cầu của bạn.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
            {loading ? 'Đang tải sản phẩm...' : `${products.length} sản phẩm đang hiển thị`}
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
          {isFilterOpen && (
            <>
                <div
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 z-[110] bg-slate-900/50 lg:hidden"
              />
              <aside className="fixed bottom-0 left-0 top-0 z-[120] flex w-[90%] max-w-sm flex-col overflow-y-auto bg-white p-5 lg:hidden">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-950">Bộ lọc S-LIFE</h2>
                    <button type="button" aria-label="Đóng bộ lọc" onClick={() => setIsFilterOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900">
                      <X size={20} />
                    </button>
                  </div>
                  <ShopSidebar 
                    categories={categories}
                    brands={brands}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedPriceRange={selectedPriceRange}
                    setSelectedPriceRange={setSelectedPriceRange}
                    searchKeyword={searchKeyword}
                    setCurrentPage={setCurrentPage}
                    setIsConfirmClearOpen={setIsConfirmClearOpen}
                  />
              </aside>
            </>
          )}

          <aside className="hidden shrink-0 lg:block lg:w-[300px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <ShopSidebar 
                categories={categories}
                brands={brands}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={setSelectedPriceRange}
                searchKeyword={searchKeyword}
                setCurrentPage={setCurrentPage}
                setIsConfirmClearOpen={setIsConfirmClearOpen}
              />
            </div>
          </aside>

          <main className="min-w-0 flex-grow">
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleProductSearchSubmit} className="flex min-w-0 flex-1 gap-2">
                  <Input
                    icon={Search}
                    name="shopSearch"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Tìm sản phẩm theo tên..."
                    className="min-w-0 flex-1"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="hidden px-4 sm:inline-flex"
                  >
                    Tìm
                  </Button>
                </form>
                <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center sm:overflow-x-auto">
                  <SortButton
                    active={sortOrder === 'updatedAt'}
                    onClick={() => { setSortOrder('updatedAt'); setSortDirection('desc'); setCurrentPage(0); }}
                  >
                    Mới nhất
                  </SortButton>
                  <SortButton
                    active={sortOrder === 'price' && sortDirection === 'asc'}
                    onClick={() => { setSortOrder('price'); setSortDirection('asc'); setCurrentPage(0); }}
                  >
                    Giá thấp
                  </SortButton>
                  <SortButton
                    active={sortOrder === 'price' && sortDirection === 'desc'}
                    onClick={() => { setSortOrder('price'); setSortDirection('desc'); setCurrentPage(0); }}
                  >
                    Giá cao
                  </SortButton>
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterOpen(true)}
                    icon={SlidersHorizontal}
                    className="min-w-0 px-3 lg:hidden"
                  >
                    <span className="hidden min-[420px]:inline">Lọc</span>
                  </Button>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Đang lọc</span>
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => removeFilter(filter.key)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
                    >
                      {filter.label}
                      <X size={13} />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsConfirmClearOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>

            <ShopProductGrid 
              loading={loading}
              products={products}
              totalPages={totalPages}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
              PAGE_SIZE={PAGE_SIZE}
              setIsConfirmClearOpen={setIsConfirmClearOpen}
            />
            
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
