import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { 
  Plus, Search, Edit2, Trash2, 
  Tag, RefreshCw, Layers, Save, Link
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import Toolbar from '../components/layout/Toolbar';
import DataTable from '../components/data/DataTable';
import EmptyState from '../components/feedback/EmptyState';
import toast from 'react-hot-toast';

const tableColumns = [
  { key: 'name', label: 'Tên danh mục' },
  { key: 'slug', label: 'Đường dẫn' },
  { key: 'actions', label: 'Hành động', className: 'text-right' }
];

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
      toast.error(err.response?.data?.message || 'Không thể xóa danh mục này');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageShell>
      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa danh mục"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa không?"
        variant="danger"
      />
      
      <PageHeader
        eyebrow="Phân loại sản phẩm"
        title="Danh mục"
        description="Quản lý nhóm sản phẩm hiển thị trên cửa hàng S-LIFE."
        icon={Layers}
        action={<Button onClick={() => handleOpenModal()} icon={Plus}>Tạo danh mục</Button>}
      />

      <Toolbar>
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <button onClick={fetchCategories} className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </Toolbar>

      <DataTable columns={tableColumns}>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="3" className="px-5 py-4"><div className="h-4 w-full rounded bg-slate-100"></div></td>
                  </tr>
                ))
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="3"><EmptyState title="Không có danh mục" description="Thử đổi từ khóa tìm kiếm hoặc tạo danh mục mới." /></td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                          {category.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-950">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(category)} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { setCategoryToDelete(category.id); setIsDeleteConfirmOpen(true); }} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
      </DataTable>

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
              className="w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-sm font-medium leading-relaxed outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </form>
      </Modal>
    </PageShell>
  );
};

export default CategoryManagement;
