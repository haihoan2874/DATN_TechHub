import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import apiClient from '../../../api/axios';
import { CategoryIcon } from '../../../components/common/IconComponents';

interface Category {
  id?: string;
  name: string;
  description: string;
  icon: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSuccess, category }) => {
  const [formData, setFormData] = useState<Category>({
    name: '',
    description: '',
    icon: 'folder'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({ name: '', description: '', icon: 'folder' });
    }
    setError(null);
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (category?.id) {
        // Update
        await apiClient.put(`/categories/${category.id}`, formData);
      } else {
        // Create
        await apiClient.post('/categories', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.');
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
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <CategoryIcon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">
                    {category ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic mt-1">Quản trị nội dung</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-shake">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Tên Danh mục</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Điện thoại, Laptop..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-bold italic"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Mô tả chi tiết</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn về danh mục này..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-medium italic resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Đường dẫn Icon (SVG)</label>
                <input 
                  type="text" 
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Ví dụ: phone, laptop, monitor..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-mono text-xs"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-200"
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
                      {category ? 'Lưu thay đổi' : 'Tạo danh mục'}
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

export default CategoryModal;
