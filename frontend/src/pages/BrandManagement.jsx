import React, { useState, useEffect } from 'react';
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
import EmptyState from '../components/feedback/EmptyState';
import toast from 'react-hot-toast';
import ImageUpload from '../components/admin/ImageUpload';

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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  
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

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <button onClick={fetchBrands} className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
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
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="3"><EmptyState title="Không có thương hiệu" description="Thử đổi từ khóa tìm kiếm hoặc tạo thương hiệu mới." /></td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                          {brand.logoUrl ? (
                            <img src={brand.logoUrl.startsWith('http') ? brand.logoUrl : `http://localhost:8089${brand.logoUrl}`} alt={brand.name} className="w-full h-full object-contain" />
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
                        <button onClick={() => handleOpenModal(brand)} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { setBrandToDelete(brand.id); setIsDeleteConfirmOpen(true); }} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700">
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Input 
                label="Tên thương hiệu"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="VD: Samsung, Omron..."
                icon={Building2}
              />
              <Input 
                label="Đường dẫn tĩnh (Slug)"
                name="slug"
                required
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="vd: samsung-galaxy"
                icon={Link}
                className="font-mono text-[11px]"
              />
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mô tả đối tác</label>
                <textarea 
                  name="description" rows="4"
                  value={formData.description} onChange={handleInputChange}
                  placeholder="Giới thiệu ngắn về lịch sử và thế mạnh của thương hiệu..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-sm font-medium leading-relaxed outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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

export default BrandManagement;
