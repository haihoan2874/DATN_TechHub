import React, { useState, useEffect, useMemo } from 'react';
import adminService from '../services/adminService';
import { 
  Plus, Search, RefreshCw,
  Info, List, Layout, Settings, Save, Package
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
import { resolveApiAssetUrl } from '../config/api';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productRes, catRes, brandRes] = await Promise.all([
        adminService.getProducts({ page: 0, size: 100 }),
        adminService.getCategories(),
        adminService.getBrands()
      ]);
      setProducts(productRes.contents || productRes.content || []);
      setCategories(catRes.contents || catRes.content || catRes || []);
      setBrands(brandRes.contents || brandRes.content || brandRes || []);
      
      if (catRes.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: catRes[0].id }));
      }
    } catch (err) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    setActiveTab('basic');
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
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
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
    setStockModal({
      isOpen: true,
      product,
      quantity: String(product.stockQuantity ?? 0)
    });
  };

  const submitStockUpdate = async () => {
    const stockNum = parseInt(stockModal.quantity, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Số lượng không hợp lệ (Phải là số >= 0)');
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
            onChange={(event) => setStockModal(prev => ({ ...prev, quantity: event.target.value }))}
            required
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
        <button type="button" onClick={fetchData} className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
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
              <div className="text-sm font-semibold text-slate-900">{currentProduct ? 'Lưu thay đổi sản phẩm' : 'Tạo sản phẩm và mở bán'}</div>
              <div className="text-xs text-slate-500">Thông tin sản phẩm, phân loại và tồn kho sẽ được cập nhật sau khi lưu.</div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
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
        <div className="flex h-[80vh] overflow-hidden bg-slate-50">
          <div className="flex w-72 flex-col border-r border-slate-200 bg-white">
            <div className="flex-1 space-y-6 p-6">
               <div className="space-y-2">
                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nhóm thông tin</p>
                 <div className="space-y-1">
                    {[
                      { id: 'basic', label: 'Thông tin cơ bản', icon: Info },
                      { id: 'specs', label: 'Cấu hình kỹ thuật', icon: List },
                      { id: 'landing', label: 'Tính năng nổi bật', icon: Layout },
                      { id: 'settings', label: 'Hiển thị và mô tả', icon: Settings }
                    ].map(tab => (
                      <button
                        key={tab.id}
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Xem trước nhanh</p>
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
                     {formData.imageUrl ? (
                       <img src={resolveApiAssetUrl(formData.imageUrl)} className="h-full w-full object-contain" alt="" />
                     ) : (
                       <Package size={48} className="text-slate-200" />
                     )}
                  </div>
                  <div className="space-y-1 px-2">
                     <div className="truncate text-sm font-semibold text-slate-950">{formData.name || 'Tên sản phẩm'}</div>
                     <div className="text-sm font-bold text-blue-700">{(formData.price || 0).toLocaleString()} ₫</div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
            <div className="mx-auto max-w-4xl space-y-8 px-8 py-8">
               {activeTab === 'basic' && (
                 <div className="space-y-8">
                    <section className="space-y-6">
                       <h2 className="text-lg font-bold text-slate-950">Thông tin định danh</h2>
                       <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <Input label="Tên gọi thiết bị" name="name" required value={formData.name} onChange={handleInputChange} placeholder="VD: Garmin Forerunner 265..." />
                          <Input label="Đường dẫn tĩnh (Slug)" name="slug" required value={formData.slug} onChange={handleInputChange} className="font-mono text-xs" />
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-lg font-bold text-slate-950">Giá bán và tồn kho</h2>
                       <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
                          <Input label="Giá niêm yết (₫)" type="number" name="price" required value={formData.price} onChange={handleInputChange} />
                          <Input label="Số lượng tồn kho" type="number" name="stockQuantity" required value={formData.stockQuantity} onChange={handleInputChange} />
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-lg font-bold text-slate-950">Hình ảnh đại diện</h2>
                       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <ImageUpload 
                            label="Tải lên hình ảnh sản phẩm chất lượng cao" 
                            value={formData.imageUrl} 
                            onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} 
                            folder="products"
                          />
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-lg font-bold text-slate-950">Phân loại và thương hiệu</h2>
                       <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
                          <div className="space-y-3">
                             <label className="form-label-strong">Danh mục sản phẩm</label>
                             <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="form-select">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="form-label-strong">Hãng sản xuất</label>
                             <select name="brandId" value={formData.brandId} onChange={handleInputChange} className="form-select">
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                             </select>
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
                       <h2 className="text-lg font-bold text-slate-950">Mô tả sản phẩm</h2>
                       <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <label className="form-label-strong">Mô tả tóm tắt</label>
                          <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange} 
                            rows="8" 
                            className="form-textarea"
                            placeholder="Nhập nội dung tiếp thị ngắn gọn cho sản phẩm này..."
                          />
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

export default ProductManagement;
