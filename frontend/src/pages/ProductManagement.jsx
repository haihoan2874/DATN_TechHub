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

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [stockError, setStockError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [stockModal, setStockModal] = useState({
    isOpen: false,
    product: null,
    quantity: ''
  });
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 0,
    stockQuantity: 100,
    imageUrl: '',
    categoryId: '',
    brandId: '',
    isActive: true,
    description: '',
    specs: {},
    features: []
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productRes, catRes, brandRes] = await Promise.all([
        adminService.getProducts({ page: 0, size: 100 }),
        adminService.getCategories(),
        adminService.getBrands()
      ]);
      const categoryList = catRes.contents || catRes.content || catRes || [];
      setProducts(productRes.contents || productRes.content || []);
      setCategories(categoryList);
      setBrands(brandRes.contents || brandRes.content || brandRes || []);
      
      setFormData(prev => (
        prev.categoryId || categoryList.length === 0
          ? prev
          : { ...prev, categoryId: categoryList[0].id }
      ));
    } catch (err) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        stockQuantity: product.stockQuantity,
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
        stockQuantity: 100,
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
        specs: typeof formData.specs === 'object' ? JSON.stringify(formData.specs) : formData.specs,
        features: typeof formData.features === 'object' ? JSON.stringify(formData.features) : formData.features
      };

      if (currentProduct) {
        await adminService.updateProduct(currentProduct.id, payload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await adminService.createProduct(payload);
        toast.success('Thêm sản phẩm mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
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
      fetchData();
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleUpdateStock = async (product) => {
    setStockError('');
    setStockModal({
      isOpen: true,
      product,
      quantity: String(product.stockQuantity ?? 0)
    });
  };

  const submitStockUpdate = async () => {
    const stockNum = parseInt(stockModal.quantity, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setStockError('Số lượng tồn kho phải là số lớn hơn hoặc bằng 0.');
      return;
    }

    setIsUpdatingStock(true);
    try {
      await adminService.updateStock(stockModal.product.id, stockNum);
      toast.success('Cập nhật tồn kho thành công');
      setStockModal({ isOpen: false, product: null, quantity: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật tồn kho');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesKeyword = !keyword || product.name.toLowerCase().includes(keyword) || product.slug?.toLowerCase().includes(keyword);
      const productCategoryId = product.category?.id || product.categoryId;
      const matchesCategory = categoryFilter === 'all' || productCategoryId === categoryFilter;
      return matchesKeyword && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

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

      <Modal
        isOpen={stockModal.isOpen}
        onClose={() => setStockModal({ isOpen: false, product: null, quantity: '' })}
        title="Cập nhật tồn kho"
        size="sm"
        closeOnOverlay={!isUpdatingStock}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setStockModal({ isOpen: false, product: null, quantity: '' })}
              disabled={isUpdatingStock}
            >
              Hủy
            </Button>
            <Button onClick={submitStockUpdate} isLoading={isUpdatingStock}>
              Lưu tồn kho
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sản phẩm</p>
            <h4 className="text-base font-black text-slate-900">{stockModal.product?.name}</h4>
          </div>
          <Input
            label="Số lượng tồn kho mới"
            type="number"
            min="0"
            value={stockModal.quantity}
            onChange={(event) => {
              setStockModal(prev => ({ ...prev, quantity: event.target.value }));
              if (stockError) setStockError('');
            }}
            error={stockError}
          />
        </div>
      </Modal>

      <PageHeader
        eyebrow="Quản lý kho hàng"
        title="Sản phẩm và tồn kho"
        description="Theo dõi danh sách thiết bị, giá bán, phân loại và số lượng tồn kho."
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-select lg:w-56"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          {filteredProducts.length} sản phẩm
        </span>
        <button type="button" onClick={fetchData} aria-label="Tải lại danh sách sản phẩm" className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </Toolbar>

      <ProductTable 
        products={paginatedProducts}
        loading={loading}
        footer={!loading && filteredProducts.length > 0 ? (
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredProducts.length}
            onPageChange={setCurrentPage}
          />
        ) : null}
        onEdit={handleOpenModal}
        onDelete={(id) => { setProductToDelete(id); setIsDeleteConfirmOpen(true); }}
        onUpdateStock={handleUpdateStock}
      />

      {/* Product form modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={currentProduct ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}
        size="full"
        footer={
          <div className="flex w-full flex-col gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">{currentProduct ? 'Lưu thay đổi sản phẩm' : 'Tạo sản phẩm'}</div>
              <div className="text-xs text-slate-500">Kiểm tra đủ ảnh, giá, tồn kho, phân loại và mô tả trước khi mở bán.</div>
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
        <div className="flex max-h-[80vh] flex-col overflow-hidden bg-slate-50 lg:h-[80vh] lg:flex-row">
          <div className="flex w-full flex-col border-b border-slate-200 bg-white lg:w-72 lg:border-b-0 lg:border-r">
            <div className="flex-1 space-y-5 p-4 sm:p-5 lg:space-y-6 lg:p-6">
               <div className="space-y-2">
                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nhóm thông tin</p>
                 <div className="grid grid-cols-2 gap-2 lg:block lg:space-y-1">
                    {[
                      { id: 'basic', label: 'Bán hàng', icon: Info },
                      { id: 'specs', label: 'Thông số', icon: List },
                      { id: 'landing', label: 'Mô tả chi tiết', icon: Layout },
                      { id: 'settings', label: 'Hiển thị', icon: Settings }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                          activeTab === tab.id 
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <tab.icon size={17} />
                        {tab.label}
                      </button>
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

          <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
            <div className="mx-auto max-w-4xl space-y-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
               {activeTab === 'basic' && (
                 <div className="space-y-8">
                    <section className="space-y-6">
                       <h2 className="text-lg font-bold text-slate-950">Thông tin bán hàng</h2>
                       <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <Input label="Tên sản phẩm" name="name" value={formData.name} onChange={handleInputChange} placeholder="VD: Garmin Forerunner 265..." error={formErrors.name} />
                          <Input label="Đường dẫn sản phẩm" name="slug" value={formData.slug} onChange={handleInputChange} className="font-mono text-xs" error={formErrors.slug} />
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-lg font-bold text-slate-950">Giá bán và kho</h2>
                       <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
                          <Input label="Giá bán (₫)" type="number" min="0" name="price" value={formData.price} onChange={handleInputChange} error={formErrors.price} />
                          <Input label="Số lượng tồn kho" type="number" min="0" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} error={formErrors.stockQuantity} />
                       </div>
                    </section>

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
               )}

               {activeTab === 'specs' && (
                 <div>
                    <SpecsEditor specs={formData.specs} setSpecs={(s) => setFormData(prev => ({ ...prev, specs: s }))} />
                 </div>
               )}

               {activeTab === 'landing' && (
                 <div>
                    <FeaturesEditor features={formData.features} setFeatures={(f) => setFormData(prev => ({ ...prev, features: f }))} />
                 </div>
               )}

               {activeTab === 'settings' && (
                 <div className="space-y-8">
                    <section className="space-y-6">
                       <h2 className="text-lg font-bold text-slate-950">Cấu hình hiển thị</h2>
                       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <label className="flex items-center justify-between cursor-pointer group">
                             <div className="space-y-2">
                                <p className="text-sm font-semibold text-slate-950">Kích hoạt sản phẩm</p>
                                <p className="text-xs text-slate-500">Sản phẩm sẽ hiển thị cho khách hàng nếu đang hoạt động.</p>
                             </div>
                             <div className="relative">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="sr-only" />
                                <div className={`w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${formData.isActive ? 'translate-x-6' : ''}`} />
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
               )}
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
  if (Number(data.stockQuantity) < 0) errors.stockQuantity = 'Tồn kho không được âm.';
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
  { label: 'Tồn kho hợp lệ', done: Number(data.stockQuantity) >= 0 },
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
