import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, Image as ImageIcon } from 'lucide-react';
import apiClient from '../../../api/axios';
import { ProductIcon } from '../../../components/common/IconComponents';

const ProductModal = ({ isOpen, onClose, onSuccess, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 0,
    stockQuantity: 0,
    description: '',
    imageUrl: '',
    categoryId: '',
    brandId: '',
    isActive: true,
    specs: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (product) {
        setFormData({
            ...product,
            categoryId: product.category?.id || product.categoryId || '',
            brandId: product.brand?.id || product.brandId || '',
            specs: typeof product.specs === 'object' ? JSON.stringify(product.specs) : product.specs || ''
        });
      } else {
        setFormData({
          name: '',
          slug: '',
          price: 0,
          stockQuantity: 0,
          description: '',
          imageUrl: '',
          categoryId: '',
          brandId: '',
          isActive: true,
          specs: ''
        });
      }
    }
    setError(null);
  }, [product, isOpen]);

  const fetchData = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get('/brands')
      ]);
      setCategories(catRes.data.content || catRes.data || []);
      setBrands(brandRes.data.content || brandRes.data || []);
    } catch (err) {
      console.error('Error fetching categories/brands:', err);
      // Fallback for UI if API fails
      setCategories([{ id: 'default-cat', name: 'Mặc định' }]);
      setBrands([{ id: 'default-brand', name: 'Mặc định' }]);
    }
  };

  const handleNameChange = (name) => {
    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.categoryId || !formData.brandId) {
        setError('Vui lòng chọn Danh mục và Thương hiệu.');
        setLoading(false);
        return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        specs: formData.specs ? JSON.parse(formData.specs) : {}
      };

      if (product?.id) {
        await apiClient.put(`/products/${product.id}`, dataToSubmit);
      } else {
        await apiClient.post('/products', dataToSubmit);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm. Vui lòng kiểm tra dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-8 border-b border-slate-50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <ProductIcon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">
                    {product ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic mt-1">Thông tin chi tiết thiết bị</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-8">
              {error && (
                <div className="p-4 mb-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-shake">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Column Info */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Tên Sản phẩm</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ví dụ: iPhone 15 Pro Max" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-bold italic"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Danh mục</label>
                        <select 
                            required
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Thương hiệu</label>
                        <select 
                            required
                            value={formData.brandId}
                            onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                        >
                            <option value="">Chọn hãng</option>
                            {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                        </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Giá bán (₫)</label>
                        <input 
                            required
                            type="number" 
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500/50 transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Số lượng kho</label>
                        <input 
                            required
                            type="number" 
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500/50 transition-all font-bold"
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Link Ảnh Sản phẩm</label>
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="Dán link ảnh tại đây..." 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 outline-none focus:border-blue-500/50 transition-all font-mono text-xs"
                            />
                        </div>
                        {formData.imageUrl && (
                            <div className="w-14 h-14 rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex-shrink-0">
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Right Column & Desc */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Slug (Đường dẫn)</label>
                    <input 
                      disabled
                      type="text" 
                      value={formData.slug}
                      className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 text-slate-400 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Mô tả sản phẩm</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Thông tin giới thiệu về sản phẩm..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500/50 transition-all font-medium italic resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Thông số kỹ thuật (JSON)</label>
                    <textarea 
                      rows={4}
                      value={formData.specs}
                      onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                      placeholder='{"ram": "8GB", "cpu": "A17 Pro"}' 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500/50 transition-all font-mono text-xs resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-12 py-6 border-t border-slate-50">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      {product ? 'Cập nhật kho' : 'Đăng bán SP'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
