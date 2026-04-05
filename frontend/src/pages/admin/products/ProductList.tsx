import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp,
  AlertTriangle,
  Trash2,
  Edit,
  ExternalLink
} from 'lucide-react';
import apiClient from '../../../api/axios';
import { ProductIcon, CategoryIcon } from '../../../components/common/IconComponents';
import ProductModal from './ProductModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import Toast, { ToastType } from '../../../components/common/Toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stockQuantity: number;
  brandName?: string;
  categoryName?: string;
  status?: string;
  imageUrl: string;
  description: string;
  specs: string;
  isActive: boolean;
  categoryId: string;
  brandId: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as ToastType });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data.content || response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể kết nối API. Đang hiển thị dữ liệu mẫu.');
      setProducts([
        { id: '1', name: 'iPhone 15 Pro', slug: 'iphone-15-pro', price: 1099, stockQuantity: 42, brandName: 'Apple', categoryName: 'Điện thoại', imageUrl: '', description: '', specs: '', isActive: true, categoryId: '1', brandId: '1' },
        { id: '2', name: 'Samsung S24 Ultra', slug: 's24-ultra', price: 1199, stockQuantity: 15, brandName: 'Samsung', categoryName: 'Điện thoại', imageUrl: '', description: '', specs: '', isActive: true, categoryId: '1', brandId: '1' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await apiClient.delete(`/products/${productToDelete}`);
      setToast({ isVisible: true, message: 'Xoá sản phẩm thành công!', type: 'success' });
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setToast({ isVisible: true, message: 'Lỗi khi xoá sản phẩm.', type: 'error' });
    }
  };

  const handleSuccess = (message: string) => {
    setToast({ isVisible: true, message, type: 'success' });
    fetchProducts();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <ProductIcon size={40} />
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight italic uppercase">Sản phẩm</h1>
            <p className="text-slate-400 font-bold italic tracking-wide text-xs">Quản lý kho hàng và thông tin chi tiết.</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black italic uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
        >
          <Plus size={20} />
          Thêm Sản phẩm mới
        </button>
      </div>

      <div className="bg-white border border-slate-100 p-4 lg:p-6 rounded-[2rem] flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-14 pr-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white placeholder:text-slate-400 font-bold italic transition-all"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
            <button className="flex-1 md:flex-none p-3.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl transition-all">
                <Filter size={20} />
            </button>
            <button className="flex-[2] md:flex-none px-6 py-3.5 bg-white border border-slate-200 text-slate-900 font-black italic uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                Xuất file <TrendingUp size={16} />
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-700 text-xs font-bold">
            <AlertTriangle size={20} />
            {error}
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 shadow-[inset_0_-1px_0_0_#f1f5f9] text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black italic">
                <th className="px-10 py-6">Sản phẩm</th>
                <th className="px-10 py-6">Danh mục</th>
                <th className="px-10 py-6">Giá lẻ</th>
                <th className="px-10 py-6">Số lượng</th>
                <th className="px-10 py-6">Trạng thái</th>
                <th className="px-10 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-10 py-10 h-24 bg-white" />
                  </tr>
                ))
              ) : filteredProducts.map((product) => (
                  <tr key={product.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
                          {product.imageUrl ? (
                             <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                             <ProductIcon size={24} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 mb-1 tracking-tight italic uppercase">{product.name}</p>
                          <p className="text-[10px] text-slate-400 italic tracking-widest font-black uppercase">{product.brandName || 'Apple'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                             <CategoryIcon size={16} />
                             <span className="text-[10px] font-black italic uppercase text-slate-500">{product.categoryName || 'Mobile'}</span>
                        </div>
                    </td>
                    <td className="px-10 py-8 font-mono text-sm font-black text-emerald-600">
                      ${product.price.toLocaleString()}
                    </td>
                    <td className="px-10 py-8 text-sm font-black text-slate-900">
                      {product.stockQuantity} SP
                    </td>
                    <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-rose-500'}`} />
                            <span className="text-[10px] font-black uppercase italic text-slate-400 tracking-widest">
                                {product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                        </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 lg:group-hover:opacity-100 transition-all">
                        <button onClick={() => handleEdit(product)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteClick(product.id)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-sm"><Trash2 size={18} /></button>
                        <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm"><ExternalLink size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => handleSuccess(selectedProduct ? 'Cập nhật kho thành công!' : 'Đăng bán sản phẩm thành công!')}
        product={selectedProduct}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xoá"
        message="Sếp có chắc chắn muốn xoá sản phẩm này khỏi hệ thống không? Dữ liệu này sẽ biến mất vĩnh viễn khỏi Database."
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
