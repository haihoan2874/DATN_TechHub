import React, { useCallback, useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
import { 
  Plus, Search, RefreshCw,
  Info, List, Layout, Settings, Save, Package, CheckCircle2, AlertCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import Toolbar from '../components/layout/Toolbar';
import Pagination from '../components/data/Pagination';
import toast from 'react-hot-toast';
import ImageUpload from '../components/admin/ImageUpload';
import ProductTable from './ProductManagement/components/ProductTable';
import SpecsEditor from './ProductManagement/components/SpecsEditor';
import FeaturesEditor from './ProductManagement/components/FeaturesEditor';
import ProductGalleryEditor from './ProductManagement/components/ProductGalleryEditor';
import { resolveApiAssetUrl } from '../config/api';
import { formatCurrency } from '../utils/formatters';

const PAGE_SIZE = 8;
const getLocalDateTimeInputValue = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 0,
    stockQuantity: 0,
    initialImportPrice: '',
    initialImportedAt: getLocalDateTimeInputValue(),
    initialImportNote: '',
    imageUrl: '',
    categoryId: '',
    brandId: '',
    isActive: true,
    description: '',
    specs: {},
    features: []
  });

  const fetchFilters = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        adminService.getCategories(),
        adminService.getBrands()
      ]);
      const categoryList = catRes.contents || catRes.content || catRes || [];
      setCategories(categoryList);
      setBrands(brandRes.contents || brandRes.content || brandRes || []);

      setFormData(prev => (
        prev.categoryId || categoryList.length === 0
          ? prev
          : { ...prev, categoryId: categoryList[0].id }
      ));
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
        name: searchTerm.trim() || null,
        categoryId: categoryFilter === 'all' ? null : categoryFilter,
        brandId: brandFilter === 'all' ? null : brandFilter,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
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
  }, [brandFilter, categoryFilter, currentPage, searchTerm]);

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
    setActiveTab('basic');
    setFormErrors({});
    if (product) {
      setCurrentProduct(product);
      
      // Safe parsing helper
      const safeParse = (val, fallback) => {
        if (!val) return fallback;
        if (typeof val !== 'string') return val;
        try {
          const parsed = JSON.parse(val);
          // If it's still a string (double escaped), parse again
          return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
        } catch (e) {
          console.error('JSON Parse error:', e);
          return fallback;
        }
      };

      setFormData({
        name: product.name,
        slug: product.slug,
        price: product.price,
        stockQuantity: product.stockQuantity ?? 0,
        initialImportPrice: '',
        initialImportedAt: getLocalDateTimeInputValue(),
        initialImportNote: '',
        imageUrl: product.imageUrl,
        categoryId: product.category?.id || product.categoryId || '',
        brandId: product.brand?.id || product.brandId || '',
        isActive: product.isActive,
        description: product.description || '',
        specs: safeParse(product.specs, {}),
        features: safeParse(product.features, [])
      });
    } else {
      setCurrentProduct(null);
      setFormData({
        name: '',
        slug: '',
        price: 0,
        stockQuantity: 0,
        initialImportPrice: '',
        initialImportedAt: getLocalDateTimeInputValue(),
        initialImportNote: '',
        imageUrl: '',
        categoryId: categories[0]?.id || '',
        brandId: brands[0]?.id || '',
        isActive: true,
        description: '',
        specs: {},
        features: []
      });
    }
    setIsModalOpen(true);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'name' && !currentProduct) {
      setFormData(prev => ({ 
        ...prev, 
        [name]: val, 
        slug: generateSlug(value) 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const validationErrors = validateProductForm(formData);
    setFormErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) {
      setActiveTab(getFirstErrorTab(validationErrors));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        initialImportPrice: formData.initialImportPrice ? Number(formData.initialImportPrice) : null,
        initialImportedAt: new Date().toISOString(),
        initialImportNote: formData.initialImportNote?.trim() || null,
        specs: typeof formData.specs === 'object' ? JSON.stringify(formData.specs) : formData.specs,
        features: typeof formData.features === 'object' ? JSON.stringify(formData.features) : formData.features
      };

      if (currentProduct) {
        const { initialImportPrice, initialImportedAt, initialImportNote, ...updatePayload } = payload;
        await adminService.updateProduct(currentProduct.id, updatePayload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await adminService.createProduct(payload);
        toast.success('Thêm sản phẩm mới thành công');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
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

  const readinessItems = useMemo(() => getProductReadiness(formData), [formData]);
  const readyCount = readinessItems.filter((item) => item.done).length;
  const galleryImages = useMemo(() => getGalleryImages(formData.features), [formData.features]);

  const setGalleryImages = (images) => {
    setFormData(prev => ({
      ...prev,
      features: setGalleryImagesInFeatures(prev.features, images)
    }));
  };

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

      <Toolbar>
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc slug sản phẩm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="form-select lg:w-56"
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
          className="form-select lg:w-44"
        >
          <option value="all">Tất cả thương hiệu</option>
          {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
        <span className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          {totalProducts} sản phẩm
        </span>
        <button type="button" onClick={refreshData} aria-label="Tải lại danh sách sản phẩm" className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </Toolbar>

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
        onEdit={handleOpenModal}
        onDelete={(id) => { setProductToDelete(id); setIsDeleteConfirmOpen(true); }}
      />

    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={currentProduct ? 'Sửa sản phẩm' : 'Tạo sản phẩm mới'}
      size="6xl"
      contentClassName="p-0"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="hidden sm:block">
            <h4 className="text-sm font-bold text-slate-900">
              {currentProduct ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </h4>
            <p className="mt-0.5 text-xs text-slate-500">
              Kiểm tra đủ ảnh, giá bán, phân loại và mô tả trước khi mở bán.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} icon={Save}>
              {currentProduct ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col bg-slate-50 lg:flex-row">
        <div className="w-full shrink-0 border-b border-slate-200 bg-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="sticky top-0 h-max space-y-5 p-4 sm:p-5 lg:space-y-6 lg:p-6">
               <div className="space-y-2">
                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nhóm thông tin</p>
                 <div className="grid grid-cols-2 gap-2 lg:block lg:space-y-1">
                    {[
                      { id: 'basic', label: 'Bán hàng', icon: Info },
                      { id: 'details', label: 'Chi tiết sản phẩm', icon: Layout },
                      { id: 'settings', label: 'Hiển thị', icon: Settings }
                    ].map(tab => (
                      <a
                        key={tab.id}
                        href={`#section-${tab.id}`}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      >
                        <tab.icon size={17} />
                        {tab.label}
                      </a>
                    ))}
                 </div>
               </div>

               <div className="space-y-4 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Xem trước bán hàng</p>
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:aspect-square">
                     {formData.imageUrl ? (
                       <img src={resolveApiAssetUrl(formData.imageUrl)} className="h-full w-full object-contain" alt="Xem trước sản phẩm" loading="lazy" decoding="async" />
                     ) : (
                       <Package size={48} className="text-slate-200" />
                     )}
                  </div>
                  <div className="space-y-1 px-2">
                     <div className="truncate text-sm font-semibold text-slate-950">{formData.name || 'Tên sản phẩm'}</div>
                     <div className="text-sm font-bold text-blue-700">{formatCurrency(formData.price)}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Độ sẵn sàng</span>
                      <span className="text-xs font-bold text-slate-900">{readyCount}/{readinessItems.length}</span>
                    </div>
                    <div className="space-y-2">
                      {readinessItems.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-xs font-semibold">
                          {item.done ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <AlertCircle size={14} className="text-amber-500" />
                          )}
                          <span className={item.done ? 'text-slate-700' : 'text-slate-400'}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-50">
            <div className="mx-auto max-w-4xl space-y-12 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                 <div id="section-basic" className="space-y-8 scroll-mt-24">
                    <section className="space-y-6">
                       <h2 className="text-xl font-black text-slate-950 flex items-center gap-2"><Info className="text-slate-400" /> Bán hàng</h2>
                       <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <Input label="Tên sản phẩm" name="name" value={formData.name} onChange={handleInputChange} placeholder="VD: Garmin Forerunner 265..." error={formErrors.name} />
                          <Input label="Đường dẫn sản phẩm" name="slug" value={formData.slug} onChange={handleInputChange} className="font-mono text-xs" error={formErrors.slug} />
                       </div>
                    </section>

                    {currentProduct ? (
                      <section className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-950">Giá bán</h2>
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <Input label="Giá bán (₫)" type="number" min="0" name="price" value={formData.price} onChange={handleInputChange} error={formErrors.price} />
                        </div>
                      </section>
                    ) : (
                      <section className="space-y-6">
                        <div>
                          <h2 className="text-lg font-bold text-slate-950">Giá bán & Lô nhập đầu tiên</h2>
                          <p className="mt-1 text-sm text-slate-500">
                            Hệ thống sẽ tự động tạo phiếu nhập kho nếu bạn điền giá nhập và số lượng.
                          </p>
                        </div>
                        <div className="space-y-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Input
                              label="Giá nhập / SP (₫)"
                              type="number"
                              min="0"
                              name="initialImportPrice"
                              value={formData.initialImportPrice}
                              onChange={handleInputChange}
                              placeholder="15,000,000"
                              error={formErrors.initialImportPrice}
                            />
                            <Input
                              label="Giá bán (₫)"
                              type="number"
                              min="0"
                              name="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              placeholder="20,000,000"
                              error={formErrors.price}
                            />
                            <Input
                              label="Số lượng nhập"
                              type="number"
                              min="0"
                              name="stockQuantity"
                              value={formData.stockQuantity}
                              onChange={handleInputChange}
                              placeholder="VD: 20"
                              error={formErrors.stockQuantity}
                            />
                          </div>

                          <div className="rounded-xl bg-white px-4 py-3 border border-emerald-200 shadow-sm flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Lãi gộp dự kiến (trên mỗi SP)</p>
                            <p className="text-lg font-black text-slate-950">
                              {formData.initialImportPrice && Number(formData.price) > 0
                                ? formatCurrency(Number(formData.price) - Number(formData.initialImportPrice))
                                : '—'}
                            </p>
                          </div>
                        </div>
                      </section>
                    )}

                    <section className="space-y-6">
                       <h2 className="text-lg font-bold text-slate-950">Ảnh đại diện</h2>
                       <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <ImageUpload 
                            label="Ảnh chính hiển thị trên cửa hàng"
                            value={formData.imageUrl} 
                            onChange={(url) => {
                              setFormData(prev => ({ ...prev, imageUrl: url }));
                              if (formErrors.imageUrl) setFormErrors((prev) => ({ ...prev, imageUrl: '' }));
                            }}
                            folder="products"
                          />
                          {formErrors.imageUrl && (
                            <p className="text-xs font-semibold text-rose-600">{formErrors.imageUrl}</p>
                          )}
                          <ProductGalleryEditor images={galleryImages} onChange={setGalleryImages} />
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-lg font-bold text-slate-950">Phân loại</h2>
                       <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
                          <div className="space-y-3">
                             <label className="form-label-strong">Danh mục sản phẩm</label>
                             <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="form-select">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                             </select>
                             {formErrors.categoryId && (
                               <p className="text-xs font-semibold text-rose-600">{formErrors.categoryId}</p>
                             )}
                          </div>
                          <div className="space-y-3">
                             <label className="form-label-strong">Thương hiệu</label>
                             <select name="brandId" value={formData.brandId} onChange={handleInputChange} className="form-select">
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                             </select>
                             {formErrors.brandId && (
                               <p className="text-xs font-semibold text-rose-600">{formErrors.brandId}</p>
                             )}
                          </div>
                       </div>
                    </section>
                 </div>

                 <div id="section-details" className="space-y-8 scroll-mt-24 pt-4 border-t border-slate-200">
                    <section className="space-y-6">
                       <h2 className="text-xl font-black text-slate-950 flex items-center gap-2"><List className="text-slate-400" /> Thông số kỹ thuật</h2>
                       <SpecsEditor specs={formData.specs} setSpecs={(s) => setFormData(prev => ({ ...prev, specs: s }))} />
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-xl font-black text-slate-950 flex items-center gap-2"><Layout className="text-slate-400" /> Mô tả chi tiết</h2>
                       <FeaturesEditor features={formData.features} setFeatures={(f) => setFormData(prev => ({ ...prev, features: f }))} />
                    </section>
                 </div>

                 <div id="section-settings" className="space-y-8 scroll-mt-24 pt-4 border-t border-slate-200 pb-10">
                    <section className="space-y-6">
                       <h2 className="text-xl font-black text-slate-950 flex items-center gap-2"><Settings className="text-slate-400" /> Cấu hình hiển thị</h2>
                       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <label className="flex items-center justify-between cursor-pointer group">
                             <div className="space-y-2">
                                <p className="text-sm font-semibold text-slate-950">Kích hoạt sản phẩm</p>
                                <p className="text-xs text-slate-500 max-w-[85%]">Sản phẩm sẽ được hiển thị trên cửa hàng và cho phép khách hàng đặt mua.</p>
                             </div>
                             <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                               <input type="checkbox" className="sr-only peer" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                               <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                             </div>
                          </label>
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-lg font-bold text-slate-950">Mô tả ngắn</h2>
                       <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <label className="form-label-strong">Nội dung hiển thị cạnh giá bán</label>
                          <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange} 
                            rows="8" 
                            className={`form-textarea ${formErrors.description ? 'border-rose-500 bg-rose-50/30' : ''}`}
                            aria-invalid={Boolean(formErrors.description)}
                            placeholder="Tóm tắt điểm mạnh, đối tượng phù hợp, bảo hành hoặc lợi ích nổi bật..."
                          />
                          {formErrors.description && (
                            <p className="text-xs font-semibold text-rose-600">{formErrors.description}</p>
                          )}
                       </div>
                     </section>
                  </div>
               </div>
            </div>
          </div>
        </Modal>
    </PageShell>
  );
};

const validateProductForm = (data) => {
  const errors = {};
  if (!data.name?.trim()) errors.name = 'Vui lòng nhập tên sản phẩm.';
  if (!data.slug?.trim()) errors.slug = 'Vui lòng nhập đường dẫn sản phẩm.';
  if (!data.categoryId) errors.categoryId = 'Vui lòng chọn danh mục sản phẩm.';
  if (!data.brandId) errors.brandId = 'Vui lòng chọn thương hiệu.';
  if (Number(data.price) <= 0) errors.price = 'Giá bán phải lớn hơn 0.';
  if (Number(data.stockQuantity) < 0) errors.stockQuantity = 'Số lượng kho không được âm.';
  if (Number(data.stockQuantity) > 0 && Number(data.initialImportPrice) <= 0) {
    errors.initialImportPrice = 'Vui lòng nhập giá nhập khi có số lượng nhập ban đầu.';
  }
  if (data.initialImportPrice && Number(data.initialImportPrice) < 0) {
    errors.initialImportPrice = 'Giá nhập không được âm.';
  }
  if (data.isActive && !data.imageUrl?.trim()) {
    errors.imageUrl = 'Sản phẩm đang mở bán cần có ảnh chính.';
  }
  if (data.isActive && (!data.description?.trim() || data.description.trim().length < 20)) {
    errors.description = 'Sản phẩm đang mở bán cần mô tả ngắn ít nhất 20 ký tự.';
  }
  return errors;
};

const getFirstErrorTab = (errors) => {
  if (errors.description) return 'settings';
  return 'basic';
};

const getProductReadiness = (data) => [
  { label: 'Tên và đường dẫn', done: Boolean(data.name?.trim() && data.slug?.trim()) },
  { label: 'Danh mục và thương hiệu', done: Boolean(data.categoryId && data.brandId) },
  { label: 'Giá bán hợp lệ', done: Number(data.price) > 0 },
  { label: 'Lô nhập ban đầu', done: Number(data.stockQuantity || 0) === 0 || Number(data.initialImportPrice) > 0 },
  { label: 'Ảnh chính', done: Boolean(data.imageUrl?.trim()) },
  { label: 'Mô tả ngắn', done: Boolean(data.description?.trim() && data.description.trim().length >= 20) }
];

const getGalleryImages = (features) => {
  const parsed = Array.isArray(features) ? features : [];
  return parsed.find((block) => block?.type === 'gallery')?.images || [];
};

const setGalleryImagesInFeatures = (features, images) => {
  const parsed = Array.isArray(features) ? features : [];
  const contentBlocks = parsed.filter((block) => block?.type !== 'gallery');
  if (images.length === 0) return contentBlocks;

  return [
    { type: 'gallery', images },
    ...contentBlocks
  ];
};

export default ProductManagement;
