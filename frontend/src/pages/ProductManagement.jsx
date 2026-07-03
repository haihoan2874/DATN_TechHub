import React, { useCallback, useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
import { 
  Plus, Search, RefreshCw, Package, CheckCircle2, AlertCircle, X 
} from 'lucide-react';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/data/MetricCard';
import Pagination from '../components/data/Pagination';
import toast from 'react-hot-toast';
import ProductTable from './ProductManagement/components/ProductTable';
import ProductFormModal from './ProductManagement/components/ProductFormModal';
import ProductFinanceModal from './ProductManagement/components/ProductFinanceModal';
import useDebounce from '../hooks/useDebounce';

const PAGE_SIZE = 8;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchFilters = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        adminService.getCategories(),
        adminService.getBrands()
      ]);
      setCategories(catRes.contents || catRes.content || catRes || []);
      setBrands(brandRes.contents || brandRes.content || brandRes || []);
    } catch (err) {
      toast.error('Không thể tải bộ lọc sản phẩm');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const productRes = await adminService.getProducts({
        pageNo: currentPage - 1,
        pageSize: PAGE_SIZE,
        name: debouncedSearchTerm.trim() || null,
        categoryId: categoryFilter === 'all' ? null : categoryFilter,
        brandId: brandFilter === 'all' ? null : brandFilter,
        isActive: statusFilter === 'all' ? null : (statusFilter === 'active'),
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      });

      setProducts(productRes.contents || productRes.content || []);
      setTotalProducts(productRes.total || 0);
    } catch (err) {
      toast.error('Không thể tải danh sách sản phẩm');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [brandFilter, categoryFilter, statusFilter, currentPage, debouncedSearchTerm, sortConfig]);

  const refreshData = useCallback(() => {
    fetchFilters();
    fetchProducts();
  }, [fetchFilters, fetchProducts]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleViewStats = (product) => {
    setCurrentProduct(product);
    setIsFinanceModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await adminService.deleteProduct(productToDelete);
      toast.success('Đã xóa sản phẩm');
      fetchProducts();
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const displayProducts = useMemo(() => {
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const brandById = new Map(brands.map((brand) => [brand.id, brand]));

    return products.map((product) => ({
      ...product,
      categoryName: product.categoryName || categoryById.get(product.categoryId)?.name,
      brandName: product.brandName || brandById.get(product.brandId)?.name
    }));
  }, [brands, categories, products]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const metrics = useMemo(() => [
    { label: 'Tổng số thiết bị', value: totalProducts, icon: Package, tone: 'blue' },
    { label: 'Sản phẩm hết hàng (Trang này)', value: products.filter(p => p.stockQuantity === 0).length, icon: AlertCircle, tone: 'red' },
    { label: 'Đang hiển thị (Trang này)', value: products.filter(p => p.isActive).length, icon: CheckCircle2, tone: 'green' }
  ], [totalProducts, products]);

  return (
    <PageShell>
      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa sản phẩm"
        message="Sản phẩm sẽ bị xóa vĩnh viễn khỏi danh sách bán hàng. Bạn có chắc chắn muốn thực hiện?"
        variant="danger"
      />

      <PageHeader
        eyebrow="Quản lý kho"
        title="Sản phẩm và kho"
        description="Theo dõi danh sách thiết bị, giá bán, phân loại và số lượng trong kho."
        icon={Package}
        action={<Button onClick={() => handleOpenModal()} icon={Plus}>Tạo sản phẩm</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1 xl:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc slug sản phẩm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-10 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-12 w-full sm:w-auto min-w-[140px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-12 w-full sm:w-auto min-w-[140px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">Tất cả thương hiệu</option>
              {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-12 w-full sm:w-auto min-w-[130px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Đã ẩn</option>
            </select>
            <button type="button" onClick={refreshData} aria-label="Tải lại danh sách sản phẩm" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <ProductTable 
        products={displayProducts}
        loading={loading}
        footer={!loading && totalProducts > 0 ? (
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={totalProducts}
            onPageChange={setCurrentPage}
          />
        ) : null}
        sortConfig={sortConfig}
        onSort={handleSort}
        onEdit={handleOpenModal}
        onViewStats={handleViewStats}
        onDelete={(id) => { setProductToDelete(id); setIsDeleteConfirmOpen(true); }}
      />

      {isModalOpen && (
        <ProductFormModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setCurrentProduct(null); }}
          onSuccess={() => {
            setIsModalOpen(false);
            refreshData();
          }}
          currentProduct={currentProduct}
          categories={categories}
          brands={brands}
        />
      )}

      <ProductFinanceModal
        isOpen={isFinanceModalOpen}
        onClose={() => { setIsFinanceModalOpen(false); setCurrentProduct(null); }}
        product={currentProduct}
      />
    </PageShell>
  );
};

export default ProductManagement;
