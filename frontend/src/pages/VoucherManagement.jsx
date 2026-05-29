import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Search, Trash2, TicketPercent, RefreshCw, CheckCircle2, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Input from '../components/ui/Input';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import Toolbar from '../components/layout/Toolbar';
import DataTable from '../components/data/DataTable';
import MetricCard from '../components/data/MetricCard';
import Pagination from '../components/data/Pagination';
import EmptyState from '../components/feedback/EmptyState';
import StatusBadge from '../components/status/StatusBadge';

const PAGE_SIZE = 8;

const tableColumns = [
  { key: 'code', label: 'Mã' },
  { key: 'discount', label: 'Giảm' },
  { key: 'condition', label: 'Điều kiện' },
  { key: 'usage', label: 'Lượt dùng' },
  { key: 'expiry', label: 'Hết hạn' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Thao tác', className: 'text-right' }
];

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
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

  const isExpired = (voucher) => voucher.expiresAt && new Date(voucher.expiresAt) < new Date();

  const getVoucherStatus = (voucher) => {
    if (!voucher.isActive) {
      return { label: 'Tạm tắt', tone: 'slate', icon: XCircle };
    }
    if (isExpired(voucher)) {
      return { label: 'Hết hạn', tone: 'red', icon: Clock };
    }
    return { label: 'Hoạt động', tone: 'green', icon: CheckCircle2 };
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

  const metrics = useMemo(() => [
    { label: 'Tổng mã', value: vouchers.length, icon: TicketPercent, tone: 'blue' },
    { label: 'Đang hoạt động', value: vouchers.filter((voucher) => voucher.isActive && !isExpired(voucher)).length, icon: CheckCircle2, tone: 'green' },
    { label: 'Hết hạn', value: vouchers.filter((voucher) => isExpired(voucher)).length, icon: Clock, tone: 'red' },
    { label: 'Tạm tắt', value: vouchers.filter((voucher) => !voucher.isActive).length, icon: XCircle, tone: 'slate' }
  ], [vouchers]);

  const filteredVouchers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return vouchers.filter((voucher) => {
      const status = getVoucherStatus(voucher).label;
      const matchesKeyword = !keyword || voucher.code?.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [vouchers, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / PAGE_SIZE));
  const paginatedVouchers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredVouchers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredVouchers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <PageShell>
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
              <span className="form-label mb-2 block">Loại giảm</span>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="form-select"
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

      <PageHeader
        eyebrow="Khuyến mãi"
        title="Mã giảm giá"
        description="Quản lý mã giảm giá dùng trong quá trình thanh toán của khách hàng."
        icon={TicketPercent}
        action={<Button onClick={openCreateModal} icon={Plus}>Tạo mã mới</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <Toolbar>
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo mã giảm giá..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div className="flex w-full items-center gap-2 overflow-x-auto lg:w-auto">
          {['ALL', 'Hoạt động', 'Tạm tắt', 'Hết hạn'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? 'Tất cả' : status}
            </button>
          ))}
        </div>
        <span className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          {filteredVouchers.length} mã
        </span>
        <button type="button" onClick={fetchVouchers} className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </Toolbar>

      <DataTable
        columns={tableColumns}
        footer={!loading && filteredVouchers.length > 0 ? (
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredVouchers.length}
            onPageChange={setCurrentPage}
          />
        ) : null}
      >
              {loading ? (
                Array(5).fill(0).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td colSpan="7" className="px-5 py-4"><div className="h-5 w-full rounded bg-slate-100"></div></td>
                  </tr>
                ))
              ) : filteredVouchers.length === 0 ? (
                <tr><td colSpan="7"><EmptyState title="Không có mã giảm giá" description="Thử đổi bộ lọc hoặc tạo mã giảm giá mới." /></td></tr>
              ) : paginatedVouchers.map((voucher) => {
                const status = getVoucherStatus(voucher);
                return (
                <tr key={voucher.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-mono text-sm font-bold text-slate-950">{voucher.code}</td>
                  <td className="px-5 py-4 text-sm font-bold text-blue-700">
                    {voucher.discountType === 'PERCENT' ? `${voucher.discountValue}%` : formatPrice(voucher.discountValue)}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-500">Từ {formatPrice(voucher.minOrderAmount)}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{voucher.usedCount}/{voucher.usageLimit || '∞'}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-500">{new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={status.tone} icon={status.icon}>{status.label}</StatusBadge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(voucher)} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(voucher)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
      </DataTable>
    </PageShell>
  );
};

export default VoucherManagement;
