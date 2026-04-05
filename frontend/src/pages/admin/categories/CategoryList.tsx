import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../../api/axios';
import { CategoryIcon } from '../../../components/common/IconComponents';
import CategoryModal from './CategoryModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import Toast, { ToastType } from '../../../components/common/Toast';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  productCount?: number;
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as ToastType });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data.content || response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback for demo if API fails
      setCategories([
        { id: '1', name: 'Điện thoại', description: 'Các mẫu smartphone mới nhất', icon: 'phone', productCount: 156 },
        { id: '2', name: 'Máy tính', description: 'Laptop và máy tính bàn hiệu năng cao', icon: 'laptop', productCount: 84 },
        { id: '3', name: 'Phụ kiện', description: 'Sạc dự phòng, ốp lưng và nhiều hơn nữa', icon: 'bolt', productCount: 312 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await apiClient.delete(`/categories/${categoryToDelete}`);
      setToast({ isVisible: true, message: 'Đã xoá danh mục thành công!', type: 'success' });
      fetchCategories(); // Refresh list
    } catch (err) {
      console.error('Error deleting category:', err);
      setToast({ isVisible: true, message: 'Không thể xoá danh mục này. Kiểm tra ràng buộc dữ liệu.', type: 'error' });
    }
  };

  const handleSuccess = (message: string) => {
    setToast({ isVisible: true, message, type: 'success' });
    fetchCategories();
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <CategoryIcon size={40} />
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight italic uppercase">Danh mục</h1>
            <p className="text-slate-400 font-bold italic tracking-wide text-xs lg:text-sm text-center md:text-left">Cấu trúc và hiệu suất của từng danh mục sản phẩm.</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black italic uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group"
        >
          <Plus size={18} />
          Tạo Danh mục mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
        {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-white border border-slate-100 animate-pulse rounded-[2.5rem]" />
             ))
        ) : categories.map((category) => (
          <motion.div 
            key={category.id}
            whileHover={{ y: -8 }}
            className="bg-white border border-slate-100 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[50px] rounded-full -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center text-blue-600 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <FolderOpen size={32} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(category)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteClick(category.id)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight italic uppercase">{category.name}</h4>
            <p className="text-slate-400 text-sm mb-8 line-clamp-2 italic font-medium leading-relaxed">{category.description}</p>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 italic">Sản phẩm</span>
                    <span className="text-slate-900 font-black text-lg">{category.productCount || 0} SP</span>
                </div>
                <button className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 group-hover:rotate-45 transition-all duration-500">
                    <ChevronRight size={24} />
                </button>
            </div>
          </motion.div>
        ))}

        <motion.button 
          onClick={handleAdd}
          whileHover={{ scale: 1.02, y: -8 }}
          className="bg-slate-50/50 border-2 border-dashed border-slate-200 p-10 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 text-slate-400 hover:text-blue-600 hover:border-blue-300/50 hover:bg-white hover:shadow-xl transition-all duration-500 group"
        >
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-300 group-hover:rotate-90 transition-all duration-500 font-bold">
            <Plus size={36} />
          </div>
          <p className="font-black italic uppercase tracking-[0.2em] text-[10px]">Tạo danh mục mới</p>
        </motion.button>
      </div>

      <CategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => handleSuccess(selectedCategory ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục mới thành công!')}
        category={selectedCategory}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xoá"
        message="Sếp có chắc chắn muốn xoá danh mục này không? Hành động này không thể hoàn tác và chỉ có thể thực hiện nếu danh mục không có sản phẩm nào."
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

export default CategoryList;
