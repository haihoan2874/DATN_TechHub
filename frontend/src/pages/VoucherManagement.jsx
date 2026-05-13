import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, TicketPercent } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Input from '../components/ui/Input';

const emptyForm = {
  code: '',
  discountType: 'PERCENT',
  discountValue: '',
  minOrderAmount: '0',
  usageLimit: '',
  expiresAt: '',
  isActive: true
};

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const data = await adminService.getAllVouchers();
      setVouchers(data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));
  };

  const formatDateTimeLocal = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const openCreateModal = () => {
    setSelectedVoucher(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (voucher) => {
    setSelectedVoucher(voucher);
    setForm({
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderAmount: voucher.minOrderAmount,
      usageLimit: voucher.usageLimit || '',
      expiresAt: formatDateTimeLocal(voucher.expiresAt),
      isActive: voucher.isActive
    });
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const buildPayload = () => ({
    code: form.code.trim().toUpperCase(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    minOrderAmount: Number(form.minOrderAmount || 0),
    usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
    expiresAt: form.expiresAt,
    isActive: form.isActive
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = buildPayload();
      if (selectedVoucher) {
        await adminService.updateVoucher(selectedVoucher.id, payload);
        toast.success('Cập nhật voucher thành công');
      } else {
        await adminService.createVoucher(payload);
        toast.success('Tạo voucher thành công');
      }
      setShowModal(false);
      fetchVouchers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu voucher');
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteVoucher(deleteTarget.id);
      toast.success('Đã xóa voucher');
      setDeleteTarget(null);
      fetchVouchers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa voucher');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa voucher"
        message={`Bạn có chắc chắn muốn xóa mã ${deleteTarget?.code || ''}?`}
        confirmText="Xóa"
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedVoucher ? 'Cập nhật voucher' : 'Tạo voucher'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Mã voucher" name="code" value={form.code} onChange={handleChange} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Loại giảm</span>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold"
              >
                <option value="PERCENT">Phần trăm</option>
                <option value="AMOUNT">Số tiền</option>
              </select>
            </label>
            <Input label="Giá trị giảm" type="number" name="discountValue" min="1" value={form.discountValue} onChange={handleChange} required />
            <Input label="Đơn tối thiểu" type="number" name="minOrderAmount" min="0" value={form.minOrderAmount} onChange={handleChange} required />
            <Input label="Số lượt dùng" type="number" name="usageLimit" min="0" value={form.usageLimit} onChange={handleChange} />
            <div className="md:col-span-2">
              <Input label="Ngày hết hạn" type="datetime-local" name="expiresAt" value={form.expiresAt} onChange={handleChange} required />
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-5 h-5 accent-blue-600" />
            Đang hoạt động
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button type="submit">{selectedVoucher ? 'Lưu thay đổi' : 'Tạo mã'}</Button>
          </div>
        </form>
      </Modal>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">
            <TicketPercent size={16} />
            <span>Khuyến mãi</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Voucher</h1>
        </div>
        <Button onClick={openCreateModal} icon={Plus}>Tạo mã mới</Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Mã</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Giảm</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Điều kiện</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Lượt dùng</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Hết hạn</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="px-6 py-5 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-slate-400 font-bold">Đang tải...</td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-slate-400 font-bold">Chưa có voucher nào</td></tr>
              ) : vouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-5 font-black text-slate-900">{voucher.code}</td>
                  <td className="px-6 py-5 font-bold text-blue-600">
                    {voucher.discountType === 'PERCENT' ? `${voucher.discountValue}%` : formatPrice(voucher.discountValue)}
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">Từ {formatPrice(voucher.minOrderAmount)}</td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-700">{voucher.usedCount}/{voucher.usageLimit || '∞'}</td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">{new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${voucher.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {voucher.isActive ? 'Hoạt động' : 'Tạm tắt'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(voucher)} className="p-2 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => setDeleteTarget(voucher)} className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VoucherManagement;
