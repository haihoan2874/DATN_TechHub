import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, BarChart3, CheckCircle2
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const PERIOD_OPTIONS = [
  { id: 'TODAY', label: 'Hôm nay', desc: 'Từ 00:00 đến hiện tại' },
  { id: 'WEEK', label: 'Tuần này', desc: 'Từ thứ Hai đến hiện tại' },
  { id: 'MONTH', label: 'Tháng này', desc: 'Từ ngày 01 đến hiện tại' },
  { id: 'QUARTER', label: 'Quý này', desc: 'Từ đầu quý đến hiện tại' },
  { id: 'YEAR', label: 'Năm nay', desc: 'Từ 01/01 đến hiện tại' },
  { id: 'CUSTOM', label: 'Tùy chọn', desc: 'Chọn khoảng ngày cụ thể' }
];

const buildFilename = (period) => {
  const today = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `s-life-order-report-${period.toLowerCase()}-${today}.xlsx`;
};

const formatVietnameseDate = (isoDate) => {
  if (!isoDate) {
    return '';
  }
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const DatePickerField = ({ label, value, onChange }) => (
  <label className="group relative block cursor-pointer">
    <Calendar className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-300 group-hover:text-blue-500" size={14} />
    <div className="form-input flex items-center pl-10 text-xs font-bold">
      <span className={value ? 'text-slate-900' : 'text-slate-400'}>
        {value ? formatVietnameseDate(value) : label}
      </span>
    </div>
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      aria-label={label}
    />
  </label>
);

const ReportExportModal = ({ isOpen, onClose }) => {
  const [period, setPeriod] = useState('MONTH');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (period === 'CUSTOM' && (!fromDate || !toDate)) {
      toast.error('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
      return;
    }

    if (period === 'CUSTOM') {
      if (fromDate > toDate) {
        toast.error('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
        return;
      }
    }

    setIsGenerating(true);

    try {
      const params = { period };
      if (period === 'CUSTOM') {
        params.fromDate = fromDate;
        params.toDate = toDate;
      }

      const blob = await adminService.exportOrderReport(params);
      downloadBlob(blob, buildFilename(period));
      toast.success('Đã tải báo cáo Excel.');
      if (period === 'CUSTOM') {
        setFromDate('');
        setToDate('');
      }
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể xuất báo cáo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xuất báo cáo thống kê"
      size="xl"
      footer={
        <div className="flex gap-4 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
          <Button 
            onClick={handleGenerate} 
            isLoading={isGenerating} 
            icon={Download}
            className="flex-1 bg-slate-900 hover:bg-black"
          >
            Tải file Excel
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        <div className="space-y-4">
          <label className="form-label ml-2">1. Nội dung báo cáo</label>
          <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <BarChart3 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight text-blue-700">
                Báo cáo đơn hàng và doanh thu
              </h4>
              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
                File Excel gồm mã đơn, khách hàng, thời gian đặt, trạng thái, phương thức thanh toán,
                danh sách sản phẩm, số lượng, tổng tiền, giảm giá và tổng kết cuối báo cáo.
              </p>
            </div>
            <CheckCircle2 size={18} className="ml-auto mt-1 text-blue-600" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="form-label ml-2">2. Kỳ báo cáo</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PERIOD_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => setPeriod(option.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  period === option.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="block text-sm font-black">{option.label}</span>
                <span className={`mt-1 block text-xs font-medium ${
                  period === option.id ? 'text-slate-300' : 'text-slate-400'
                }`}>
                  {option.desc}
                </span>
              </button>
            ))}
          </div>

          {period === 'CUSTOM' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"
            >
              <DatePickerField label="Từ ngày (dd/mm/yyyy)" value={fromDate} onChange={setFromDate} />
              <DatePickerField label="Đến ngày (dd/mm/yyyy)" value={toDate} onChange={setToDate} />
            </motion.div>
          )}
        </div>

        <div className="space-y-3">
          <label className="form-label ml-2">3. Định dạng tệp tin</label>
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-800">Excel (.xlsx)</p>
              <p className="text-xs font-semibold text-emerald-700/70">Có header nổi bật, định dạng tiền, freeze dòng tiêu đề và tổng kết rõ ràng.</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Calendar size={18} />
          </div>
          <p className="text-sm font-semibold leading-relaxed text-amber-800">
            Báo cáo được tổng hợp theo số liệu đơn hàng trong kỳ đã chọn. Các đơn đã hủy vẫn xuất trong file để đối soát trạng thái.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ReportExportModal;
