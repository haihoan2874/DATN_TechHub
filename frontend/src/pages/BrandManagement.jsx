import React, { useState, useEffect, useMemo } from 'react';
import adminService from '../services/adminService';
import { 
  Plus, Search, Edit2, Trash2, 
  RefreshCw, Building2, Save, Link
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
import ImageUpload from '../components/admin/ImageUpload';
import { resolveApiAssetUrl } from '../config/api';

const PAGE_SIZE = 8;

const tableColumns = [
  { key: 'brand', label: 'Thương hiệu' },
  { key: 'description', label: 'Mô tả' },
  { key: 'actions', label: 'Hành động', className: 'text-right' }
];

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: ''
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await adminService.getBrands();
      setBrands(res?.contents || res || []);
    } catch (err) {
      toast.error('Không thể tải danh sách thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setCurrentBrand(brand);
      setFormData({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || '',
        logoUrl: brand.logoUrl || ''
      });
    } else {
      setCurrentBrand(null);
      setFormData({ name: '', slug: '', description: '', logoUrl: '' });
    }
    setFormErrors({});
    setIsModalOpen(true);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (name === 'name' && !currentBrand) {
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
    const validationErrors = validateBrandForm(formData);
    setFormErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentBrand) {
        await adminService.updateBrand(currentBrand.id, formData);
        toast.success('Cập nhật thương hiệu thành công');
      } else {
        await adminService.createBrand(formData);
        toast.success('Thêm thương hiệu mới thành công');
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await adminService.deleteBrand(brandToDelete);
      toast.success('Đã xóa thương hiệu');
      fetchBrands();
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa thương hiệu này');
    }
  };

  const filteredBrands = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return brands;
    return brands.filter((brand) => brand.name.toLowerCase().includes(keyword));
  }, [brands, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredBrands.length / PAGE_SIZE));
  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredBrands.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBrands, currentPage]);

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
        title="Xác nhận xóa thương hiệu"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa không?"
        variant="danger"
      />
      
      <PageHeader
        eyebrow="Phân loại sản phẩm"
        title="Thương hiệu"
        description="Quản lý thương hiệu sản phẩm dùng trong cửa hàng S-LIFE."
        icon={Building2}
        action={<Button onClick={() => handleOpenModal()} icon={Plus}>Tạo thương hiệu</Button>}
      />

      <Toolbar>
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <span className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          {filteredBrands.length} thương hiệu
        </span>
        <button type="button" onClick={fetchBrands} aria-label="Tải lại danh sách thương hiệu" className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </Toolbar>

      <DataTable
        columns={tableColumns}
        footer={!loading && filteredBrands.length > 0 ? (
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredBrands.length}
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
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="3"><EmptyState title="Không có thương hiệu" description="Thử đổi từ khóa tìm kiếm hoặc tạo thương hiệu mới." /></td>
                </tr>
              ) : (
                paginatedBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                          {brand.logoUrl ? (
                            <img src={resolveApiAssetUrl(brand.logoUrl)} alt={brand.name} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                          ) : (
                            <Building2 size={24} className="text-slate-200" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-950">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="line-clamp-1 max-w-lg text-sm text-slate-500">
                        {brand.description || 'Đối tác chiến lược của S-LIFE trong lĩnh vực thiết bị y tế.'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => handleOpenModal(brand)} aria-label={`Sửa thương hiệu ${brand.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700">
                          <Edit2 size={16} />
                        </button>
                        <button type="button" onClick={() => { setBrandToDelete(brand.id); setIsDeleteConfirmOpen(true); }} aria-label={`Xóa thương hiệu ${brand.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700">
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
        title={currentBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
            <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} icon={Save}>Lưu & Cập nhật</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Input 
                label="Tên thương hiệu"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="VD: Samsung, Omron..."
                icon={Building2}
                error={formErrors.name}
              />
              <Input 
                label="Đường dẫn tĩnh (Slug)"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="vd: samsung-galaxy"
                icon={Link}
                className="font-mono text-[11px]"
                error={formErrors.slug}
              />
              <div className="space-y-3">
                <label className="form-label-strong">Mô tả đối tác</label>
                <textarea 
                  name="description" rows="4"
                  value={formData.description} onChange={handleInputChange}
                  placeholder="Giới thiệu ngắn về lịch sử và thế mạnh của thương hiệu..."
                  className="form-textarea"
                />
              </div>
            </div>
            <div>
              <ImageUpload 
                label="Logo thương hiệu"
                value={formData.logoUrl}
                onChange={(val) => setFormData(prev => ({ ...prev, logoUrl: val }))}
                folder="brands"
              />
              <p className="mt-4 text-[10px] text-slate-400 font-medium italic leading-relaxed">
                * Logo nên có nền trong suốt (PNG/SVG) để đạt hiệu quả thẩm mỹ cao nhất trên mọi giao diện.
              </p>
            </div>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
};

const validateBrandForm = (data) => {
  const errors = {};
  if (!data.name?.trim()) {
    errors.name = 'Vui lòng nhập tên thương hiệu.';
  }
  if (!data.slug?.trim()) {
    errors.slug = 'Vui lòng nhập đường dẫn tĩnh.';
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug.trim())) {
    errors.slug = 'Slug chỉ gồm chữ thường, số và dấu gạch ngang.';
  }
  return errors;
};

export default BrandManagement;
