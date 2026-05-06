import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../services/adminService';
import { 
  Plus, Search, Edit2, Trash2, 
  Tag, RefreshCw, Layers, ChevronRight, Info, Save, Link
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCategories();
      setCategories(res?.contents || res || []);
    } catch (err) {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
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

  const handleOpenModal = (category = null) => {
    if (category) {
      setCurrentCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || ''
      });
    } else {
      setCurrentCategory(null);
      setFormData({ name: '', slug: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name' && !currentCategory) {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentCategory) {
        await adminService.updateCategory(currentCategory.id, formData);
        toast.success('Cập nhật thành công');
      } else {
        await adminService.createCategory(formData);
        toast.success('Thêm mới thành công');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await adminService.deleteCategory(categoryToDelete);
      toast.success('Đã xóa danh mục');
      fetchCategories();
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      toast.error('Không thể xóa danh mục này');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa danh mục"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa không?"
        variant="danger"
      />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
            <Layers size={14} />
            Phân loại hệ thống
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Danh mục</h1>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>Tạo danh mục mới</Button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium"
          />
        </div>
        <button onClick={fetchCategories} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="pl-10 pr-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên danh mục</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Đường dẫn (Slug)</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="3" className="px-10 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="pl-10 pr-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                          {category.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 text-lg">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(category)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => { setCategoryToDelete(category.id); setIsDeleteConfirmOpen(true); }} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
            <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} icon={Save}>Lưu thông tin</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Tên danh mục"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            placeholder="VD: Máy đo huyết áp..."
            icon={Tag}
          />
          <Input 
            label="Đường dẫn tĩnh (Slug)"
            name="slug"
            required
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="vd: may-do-huyet-ap"
            icon={Link}
            className="font-mono text-[11px]"
          />
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mô tả chi tiết</label>
            <textarea 
              name="description" rows="4"
              value={formData.description} onChange={handleInputChange}
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-medium outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none leading-relaxed"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
