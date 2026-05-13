import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../services/adminService';
import { 
  Plus, Search, Filter, RefreshCw, 
  Info, List, Layout, Settings, Save, Trash2, Package
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import ImageUpload from '../components/admin/ImageUpload';
import ProductTable from './ProductManagement/components/ProductTable';
import SpecsEditor from './ProductManagement/components/SpecsEditor';
import FeaturesEditor from './ProductManagement/components/FeaturesEditor';

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
      toast.error('Không thể tải dữ liệu');
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa sản phẩm"
        message="Hành động này sẽ xóa vĩnh viễn sản phẩm khỏi hệ thống. Bạn có chắc chắn muốn thực hiện?"
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

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
              <Package size={14} />
              Quản lý kho hàng
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Danh sách thiết bị</h1>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus} className="shadow-xl shadow-blue-600/20">Thiết lập sản phẩm mới</Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
               type="text" 
               placeholder="Tìm kiếm theo tên sản phẩm, SKU hoặc mô tả..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium text-sm"
            />
         </div>
         <div className="flex gap-4 w-full lg:w-auto">
            <select className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-black/5">
               <option>Tất cả danh mục</option>
               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={fetchData} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-black transition-colors shadow-sm">
               <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
         </div>
      </div>

      {/* Table */}
      <ProductTable 
        products={filteredProducts} 
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={(id) => { setProductToDelete(id); setIsDeleteConfirmOpen(true); }}
        onUpdateStock={handleUpdateStock}
      />

      {/* Builder Modal - Redesigned as a Full-Screen Builder */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={currentProduct ? 'Hệ thống thiết lập thiết bị' : 'Kiến tạo thiết bị mới'}
        size="full"
        footer={
          <div className="flex items-center justify-between w-full px-10 py-6 bg-slate-900 text-white rounded-t-[3rem]">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-black italic">S</div>
               <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Trạng thái</div>
                  <div className="text-xs font-bold">{currentProduct ? 'Đang cập nhật phiên bản' : 'Bản nháp mới'}</div>
               </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Đóng lại
              </button>
              <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} icon={Save} className="shadow-2xl shadow-blue-500/40">
                {currentProduct ? 'Cập nhật & Xuất bản' : 'Khởi tạo & Đăng bán'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex h-[80vh] overflow-hidden bg-slate-50">
          {/* Left Sidebar - Navigation & Quick Info */}
          <div className="w-80 flex flex-col border-r border-slate-200 bg-white">
            <div className="p-8 space-y-6 flex-1">
               <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Điều hướng thiết lập</p>
                 <div className="space-y-1">
                    {[
                      { id: 'basic', label: 'Thông tin cốt lõi', icon: Info },
                      { id: 'specs', label: 'Cấu hình kỹ thuật', icon: List },
                      { id: 'landing', label: 'Thiết kế Story', icon: Layout },
                      { id: 'settings', label: 'Cấu hình nâng cao', icon: Settings }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
                          activeTab === tab.id 
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1' 
                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <tab.icon size={18} />
                        {tab.label}
                      </button>
                    ))}
                 </div>
               </div>

               <div className="pt-8 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Xem trước nhanh</p>
                  <div className="aspect-square rounded-3xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-center overflow-hidden">
                     {formData.imageUrl ? (
                       <img src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `http://localhost:8089${formData.imageUrl}`} className="w-full h-full object-contain" alt="" />
                     ) : (
                       <Package size={48} className="text-slate-200" />
                     )}
                  </div>
                  <div className="space-y-1 px-2">
                     <div className="text-sm font-black text-slate-900 italic uppercase truncate">{formData.name || 'Tên thiết bị'}</div>
                     <div className="text-[11px] font-black text-blue-600 italic">{(formData.price || 0).toLocaleString()} ₫</div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-blue-50/50">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Auto-save Enabled</span>
               </div>
               <p className="text-[10px] text-blue-400 font-medium leading-relaxed italic">Hệ thống tự động đồng bộ hóa các thuộc tính kỹ thuật khi bạn nhập liệu.</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
            <div className="max-w-4xl mx-auto py-12 px-12">
               {activeTab === 'basic' && (
                 <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                    <section className="space-y-6">
                       <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Thông tin định danh</h2>
                       <div className="grid grid-cols-1 gap-8 p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
                          <Input label="Tên gọi thiết bị" name="name" required value={formData.name} onChange={handleInputChange} placeholder="VD: Garmin Forerunner 265..." />
                          <Input label="Đường dẫn tĩnh (Slug)" name="slug" required value={formData.slug} onChange={handleInputChange} className="font-mono text-[10px] uppercase tracking-tighter bg-slate-50 border-none" />
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Giá trị & Kho vận</h2>
                       <div className="grid grid-cols-2 gap-10 p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
                          <Input label="Giá niêm yết (₫)" type="number" name="price" required value={formData.price} onChange={handleInputChange} />
                          <Input label="Số lượng tồn kho" type="number" name="stockQuantity" required value={formData.stockQuantity} onChange={handleInputChange} />
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Hình ảnh đại diện</h2>
                       <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
                          <ImageUpload 
                            label="Tải lên hình ảnh sản phẩm chất lượng cao" 
                            value={formData.imageUrl} 
                            onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} 
                            folder="products"
                          />
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Phân loại & Thương hiệu</h2>
                       <div className="grid grid-cols-2 gap-10 p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Danh mục hệ thống</label>
                             <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Hãng sản xuất</label>
                             <select name="brandId" value={formData.brandId} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all">
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                             </select>
                          </div>
                       </div>
                    </section>
                 </div>
               )}

               {activeTab === 'specs' && (
                 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <SpecsEditor specs={formData.specs} setSpecs={(s) => setFormData(prev => ({ ...prev, specs: s }))} />
                 </div>
               )}

               {activeTab === 'landing' && (
                 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <FeaturesEditor features={formData.features} setFeatures={(f) => setFormData(prev => ({ ...prev, features: f }))} />
                 </div>
               )}

               {activeTab === 'settings' && (
                 <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                    <section className="space-y-6">
                       <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Cấu hình hiển thị</h2>
                       <div className="p-10 bg-slate-900 rounded-[3.5rem] text-white shadow-2xl shadow-slate-900/20">
                          <label className="flex items-center justify-between cursor-pointer group">
                             <div className="space-y-2">
                                <p className="text-sm font-black uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">Kích hoạt sản phẩm</p>
                                <p className="text-xs text-white/40 font-medium">Sản phẩm sẽ ngay lập tức có mặt trên hệ thống bán lẻ sau khi xuất bản.</p>
                             </div>
                             <div className="relative">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="sr-only" />
                                <div className={`w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-slate-700'}`} />
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${formData.isActive ? 'translate-x-6' : ''}`} />
                             </div>
                          </label>
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Tiếp thị & SEO</h2>
                       <div className="space-y-3 p-10 bg-white rounded-[3.5rem] border border-slate-200 shadow-sm">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mô tả tóm tắt</label>
                          <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange} 
                            rows="8" 
                            className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-medium outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none leading-relaxed" 
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
    </div>
  );
};

export default ProductManagement;
