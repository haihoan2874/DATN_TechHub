import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Info, Layout, Settings, Save, Package, CheckCircle2, AlertCircle, List 
} from 'lucide-react';
import adminService from '../../../services/adminService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import ImageUpload from '../../../components/admin/ImageUpload';
import SpecsEditor from './SpecsEditor';
import FeaturesEditor from './FeaturesEditor';
import ProductGalleryEditor from './ProductGalleryEditor';
import { resolveApiAssetUrl } from '../../../config/api';
import { formatCurrency } from '../../../utils/formatters';
import toast from 'react-hot-toast';

const getLocalDateTimeInputValue = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const ProductFormModal = ({ isOpen, onClose, onSuccess, currentProduct, categories, brands }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const contentRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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

  useEffect(() => {
    if (isOpen) {
      setActiveTab('basic');
      setFormErrors({});
      if (currentProduct) {
        // Safe parsing helper
        const safeParse = (val, fallback) => {
          if (!val) return fallback;
          if (typeof val !== 'string') return val;
          try {
            const parsed = JSON.parse(val);
            return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
          } catch (e) {
            console.error('JSON Parse error:', e);
            return fallback;
          }
        };

        setFormData({
          name: currentProduct.name,
          slug: currentProduct.slug,
          price: currentProduct.price,
          stockQuantity: currentProduct.stockQuantity ?? 0,
          initialImportPrice: '',
          initialImportedAt: getLocalDateTimeInputValue(),
          initialImportNote: '',
          imageUrl: currentProduct.imageUrl,
          categoryId: currentProduct.category?.id || currentProduct.categoryId || '',
          brandId: currentProduct.brand?.id || currentProduct.brandId || '',
          isActive: currentProduct.isActive,
          description: currentProduct.description || '',
          specs: safeParse(currentProduct.specs, {}),
          features: safeParse(currentProduct.features, [])
        });
      } else {
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
    }
  }, [isOpen, currentProduct, categories, brands]);

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

  const validateProductForm = (data) => {
    const errors = {};
    if (!data.name?.trim()) errors.name = 'Vui lòng nhập tên sản phẩm.';
    if (!data.slug?.trim()) errors.slug = 'Vui lòng nhập đường dẫn sản phẩm.';
    if (!data.categoryId) errors.categoryId = 'Vui lòng chọn danh mục sản phẩm.';
    if (!data.brandId) errors.brandId = 'Vui lòng chọn thương hiệu.';
    if (Number(data.price) <= 0) errors.price = 'Giá bán phải lớn hơn 0.';
    if (Number(data.stockQuantity) < 0) errors.stockQuantity = 'Số lượng kho không được âm.';
    
    if (!currentProduct) {
      if (Number(data.stockQuantity) > 0 && Number(data.initialImportPrice) <= 0) {
        errors.initialImportPrice = 'Vui lòng nhập giá nhập khi có số lượng nhập ban đầu.';
      }
      if (data.initialImportPrice && Number(data.initialImportPrice) < 0) {
        errors.initialImportPrice = 'Giá nhập không được âm.';
      }
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const validationErrors = validateProductForm(formData);
    setFormErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) {
      toast.error('Vui lòng kiểm tra lại các trường báo đỏ!');
      const firstErrorTab = getFirstErrorTab(validationErrors);
      setActiveTab(firstErrorTab);
      
      setTimeout(() => {
        const firstErrorEl = contentRef.current?.querySelector('.text-rose-600, .border-rose-500');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const el = document.getElementById(`section-${firstErrorTab}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
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
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ScrollSpy
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => {
      if (!contentRef.current) return;
      const sections = ['basic', 'details', 'settings'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${sections[i]}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const containerRect = contentRef.current.getBoundingClientRect();
          if (rect.top <= containerRect.top + 150) {
            setActiveTab(sections[i]);
            break;
          }
        }
      }
    };
    const scrollContainer = contentRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, formData]);

  const getProductReadiness = (data) => [
    { label: 'Tên và đường dẫn', done: Boolean(data.name?.trim() && data.slug?.trim()) },
    { label: 'Danh mục và thương hiệu', done: Boolean(data.categoryId && data.brandId) },
    { label: 'Giá bán hợp lệ', done: Number(data.price) > 0 },
    ...(currentProduct ? [] : [{ label: 'Lô nhập ban đầu', done: Number(data.stockQuantity || 0) === 0 || Number(data.initialImportPrice) > 0 }]),
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
              onClick={onClose}
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
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:grid-cols-1 lg:space-y-1">
                    {[
                      { id: 'basic', label: 'Bán hàng', icon: Info },
                      { id: 'details', label: 'Chi tiết sản phẩm', icon: Layout },
                      { id: 'settings', label: 'Hiển thị', icon: Settings }
                    ].map(tab => (
                      <a
                        key={tab.id}
                        href={`#section-${tab.id}`}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                        onClick={() => setActiveTab(tab.id)}
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

          <div ref={contentRef} className="flex-1 bg-slate-50 max-h-[calc(100dvh-180px)] overflow-y-auto scroll-smooth">
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
                             <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={`form-select w-full h-10 border-slate-300 rounded-lg px-3 ${formErrors.categoryId ? 'border-rose-500 bg-rose-50' : ''}`}>
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                             </select>
                             {formErrors.categoryId && (
                               <p className="text-xs font-semibold text-rose-600">{formErrors.categoryId}</p>
                             )}
                          </div>
                          <div className="space-y-3">
                             <label className="form-label-strong">Thương hiệu</label>
                             <select name="brandId" value={formData.brandId} onChange={handleInputChange} className={`form-select w-full h-10 border-slate-300 rounded-lg px-3 ${formErrors.brandId ? 'border-rose-500 bg-rose-50' : ''}`}>
                                <option value="">-- Chọn thương hiệu --</option>
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
                            className={`w-full border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 ${formErrors.description ? 'border-rose-500 bg-rose-50/30' : ''}`}
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
  );
};

export default ProductFormModal;
