import React, { useState, useEffect, useMemo } from 'react';
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
import Pagination from '../components/data/Pagination';
import EmptyState from '../components/feedback/EmptyState';
import toast from 'react-hot-toast';

const PAGE_SIZE = 8;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
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
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
    const validationErrors = validateCategoryForm(formData);
    setFormErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) {
      return;
    }

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

  const filteredCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(keyword));
  }, [categories, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCategories.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCategories, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
        <span className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          {filteredCategories.length} danh mục
        </span>
        <button type="button" onClick={fetchCategories} aria-label="Tải lại danh sách danh mục" className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </Toolbar>

      <DataTable
        columns={tableColumns}
        footer={!loading && filteredCategories.length > 0 ? (
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredCategories.length}
            onPageChange={setCurrentPage}
          />
        ) : null}
      >
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
                paginatedCategories.map((category) => (
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
                        <button type="button" onClick={() => handleOpenModal(category)} aria-label={`Sửa danh mục ${category.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700">
                          <Edit2 size={16} />
                        </button>
                        <button type="button" onClick={() => { setCategoryToDelete(category.id); setIsDeleteConfirmOpen(true); }} aria-label={`Xóa danh mục ${category.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700">
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
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <Input 
            label="Tên danh mục"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="VD: Máy đo huyết áp..."
            icon={Tag}
            error={formErrors.name}
          />
          <Input 
            label="Đường dẫn tĩnh (Slug)"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="vd: may-do-huyet-ap"
            icon={Link}
            className="font-mono text-[11px]"
            error={formErrors.slug}
          />
          <div className="space-y-3">
            <label className="form-label-strong">Mô tả chi tiết</label>
            <textarea 
              name="description" rows="4"
              value={formData.description} onChange={handleInputChange}
              className="form-textarea"
            />
          </div>
        </form>
      </Modal>
    </PageShell>
  );
};

const validateCategoryForm = (data) => {
  const errors = {};
  if (!data.name?.trim()) {
    errors.name = 'Vui lòng nhập tên danh mục.';
  }
  if (!data.slug?.trim()) {
    errors.slug = 'Vui lòng nhập đường dẫn tĩnh.';
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug.trim())) {
    errors.slug = 'Slug chỉ gồm chữ thường, số và dấu gạch ngang.';
  }
  return errors;
};

export default CategoryManagement;
