import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../api/axios';
import { ProductIcon } from '../../../components/common/IconComponents';
import SLButton from '../../../components/ui/SLButton';
import ProductModal from './ProductModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import Toast from '../../../components/common/Toast';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      // Fallback for demo
      setProducts([
        { id: '1', name: 'iPhone 15 Pro Max', price: 1299, stockQuantity: 45, status: 'ACTIVE', categoryName: 'Điện thoại', brandName: 'Apple', imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=400', isActive: true },
        { id: '2', name: 'MacBook Pro M3', price: 2499, stockQuantity: 12, status: 'ACTIVE', categoryName: 'Máy tính', brandName: 'Apple', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400', isActive: true },
        { id: '3', name: 'Samsung Galaxy S24 Ultra', price: 1199, stockQuantity: 28, status: 'INACTIVE', categoryName: 'Điện thoại', brandName: 'Samsung', imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=400', isActive: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/products/${deleteConfirm.id}`);
      setToast({ isVisible: true, message: 'Đã xóa sản phẩm thành công.', type: 'success' });
      fetchProducts();
    } catch (err) {
      setToast({ isVisible: true, message: 'Lỗi khi xóa sản phẩm.', type: 'error' });
    }
  };

  const handleSuccess = (message) => {
    setToast({ isVisible: true, message, type: 'success' });
    fetchProducts();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600">
            <ProductIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Sản phẩm</h1>
            <p className="text-slate-400 font-medium text-sm">Quản lý kho hàng, giá cả và thông tin chi tiết.</p>
          </div>
        </div>
        <SLButton 
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus size={20} />}
          size="lg"
          className="shadow-xl shadow-blue-500/20 btn-premium py-4"
        >
          Thêm sản phẩm mới
        </SLButton>
      </div>

      <div className="bg-white border border-slate-100 p-4 lg:p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm theo tên sản phẩm, hãng, danh mục..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-16 pr-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white placeholder:text-slate-400 font-semibold transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 shadow-[inset_0_-1px_0_0_#f1f5f9] text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-10 py-6">Sản phẩm</th>
                <th className="px-10 py-6">Danh mục / Hãng</th>
                <th className="px-10 py-6">Giá</th>
                <th className="px-10 py-6">Kho hàng</th>
                <th className="px-10 py-6">Trạng thái</th>
                <th className="px-10 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-10 py-8 h-24 bg-white" />
                  </tr>
                ))
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all duration-300">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200">
                            <ImageIcon size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1 tracking-tight uppercase">{product.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{product.categoryName}</p>
                      <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{product.brandName}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-lg font-bold text-slate-900 tracking-tight">${product.price.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${product.stockQuantity < 10 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-sm font-bold text-slate-700">{product.stockQuantity}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest ml-1">Đơn vị</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase border shadow-sm
                      ${product.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                      {product.isActive ? 'Đang bán' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(product.id)}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-rose-500/10"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        product={editingProduct}
      />

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={confirmDelete}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
      />

      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
};

export default ProductList;
