import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../services/adminService';
import { 
  Plus, Search, Edit2, Trash2, 
  RefreshCw, Building2, Save, ExternalLink, Link
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import ImageUpload from '../components/admin/ImageUpload';

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
      toast.error('Không thể xóa thương hiệu này');
    }
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa thương hiệu"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa không?"
        variant="danger"
      />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
            <Building2 size={14} />
            Hệ thống đối tác
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Thương hiệu</h1>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>Tạo thương hiệu mới</Button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium"
          />
        </div>
        <button onClick={fetchBrands} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="pl-10 pr-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thương hiệu</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô tả đối tác</th>
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
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="pl-10 pr-6 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center p-2 overflow-hidden shadow-sm">
                          {brand.logoUrl ? (
                            <img src={brand.logoUrl.startsWith('http') ? brand.logoUrl : `http://localhost:8089${brand.logoUrl}`} alt={brand.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building2 size={24} className="text-slate-200" />
                          )}
                        </div>
                        <span className="font-bold text-slate-900 text-lg tracking-tight">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm text-slate-500 line-clamp-1 max-w-lg">
                        {brand.description || 'Đối tác chiến lược của TechHub trong lĩnh vực thiết bị y tế.'}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(brand)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => { setBrandToDelete(brand.id); setIsDeleteConfirmOpen(true); }} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
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
        title={currentBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
            <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} icon={Save}>Lưu & Cập nhật</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
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
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-medium outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none leading-relaxed"
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
    </div>
  );
};

export default BrandManagement;
