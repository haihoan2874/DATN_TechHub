import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search,
  Grid
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../../api/axios';
import { CategoryIcon } from '../../../components/common/IconComponents';
import SLButton from '../../../components/ui/SLButton';
import Toast from '../../../components/common/Toast';
import ConfirmModal from '../../../components/common/ConfirmModal';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback for demo
      setCategories([
        { id: '1', name: 'Điện thoại', description: 'Các loại smartphone đời mới nhất', productCount: 156, isActive: true },
        { id: '2', name: 'Máy tính', description: 'Laptop, PC và linh kiện máy tính', productCount: 84, isActive: true },
        { id: '3', name: 'Phụ kiện', description: 'Tai nghe, cáp sạc, ốp lưng', productCount: 320, isActive: true },
        { id: '4', name: 'Máy tính bảng', description: 'iPad và các loại tablet Android', productCount: 42, isActive: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600">
            <CategoryIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Danh mục</h1>
            <p className="text-slate-400 font-medium text-sm">Tổ chức sản phẩm theo nhóm và thuộc tính.</p>
          </div>
        </div>
        <SLButton 
          leftIcon={<Plus size={20} />}
          size="lg"
          className="shadow-xl shadow-blue-500/20 btn-premium py-4"
        >
          Thêm danh mục mới
        </SLButton>
      </div>

      <div className="bg-white border border-slate-100 p-4 lg:p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm theo tên danh mục..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-16 pr-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white placeholder:text-slate-400 font-semibold transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-white border border-slate-100 animate-pulse rounded-[2.5rem]" />
            ))
        ) : filteredCategories.map((category) => (
          <motion.div 
            key={category.id}
            whileHover={{ y: -8 }}
            className="bg-white border border-slate-100 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={`p-4 rounded-2xl shadow-sm ${category.isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                    <Grid size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 rounded-xl transition-all shadow-sm">
                        <Edit3 size={16} />
                    </button>
                    <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 rounded-xl transition-all shadow-sm">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <h4 className="text-xl font-bold text-slate-900 tracking-tight uppercase mb-2 relative z-10">{category.name}</h4>
            <p className="text-sm text-slate-500 font-medium mb-8 line-clamp-2 relative z-10">{category.description}</p>
            
            <div className="flex items-center justify-between pt-8 border-t border-slate-100 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Số sản phẩm</span>
                    <span className="text-slate-900 font-bold text-lg">{category.productCount}</span>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border shadow-sm
                    ${category.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                    {category.isActive ? 'Hoạt động' : 'Đã khóa'}
                </span>
            </div>
          </motion.div>
        ))}
      </div>

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
