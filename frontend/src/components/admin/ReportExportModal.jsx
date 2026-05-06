import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, 
  ChevronRight, BarChart3, Users, 
  Package, ShoppingCart, CheckCircle2 
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const ReportExportModal = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState('SALES');
  const [period, setPeriod] = useState('MONTH');
  const [format, setFormat] = useState('EXCEL');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { id: 'SALES', label: 'Báo cáo doanh thu', icon: <BarChart3 size={18} />, desc: 'Tổng hợp dòng tiền, lợi nhuận và tăng trưởng.' },
    { id: 'ORDERS', label: 'Báo cáo đơn hàng', icon: <ShoppingCart size={18} />, desc: 'Chi tiết trạng thái vận hành và vận chuyển.' },
    { id: 'PRODUCTS', label: 'Báo cáo kho hàng', icon: <Package size={18} />, desc: 'Thống kê tồn kho, sản phẩm bán chạy nhất.' },
    { id: 'USERS', label: 'Báo cáo người dùng', icon: <Users size={18} />, desc: 'Phân tích hành vi và tăng trưởng khách hàng.' }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2500)),
      {
        loading: 'Hệ thống đang trích xuất dữ liệu...',
        success: 'Đã tạo báo cáo thành công!',
        error: 'Có lỗi trong quá trình tạo báo cáo.',
      }
    ).then(() => {
      setIsGenerating(false);
      onClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="TRUNG TÂM KHỞI TẠO BÁO CÁO"
      size="xl"
      footer={
        <div className="flex gap-4 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1">Hủy bỏ</Button>
          <Button 
            onClick={handleGenerate} 
            isLoading={isGenerating} 
            icon={Download}
            className="flex-1 bg-slate-900 hover:bg-black"
          >
            Bắt đầu trích xuất
          </Button>
        </div>
      }
    >
      <div className="space-y-8 py-2">
        {/* 1. Select Report Type */}
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">1. Loại báo cáo cần xuất</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`flex items-start gap-4 p-5 rounded-[2rem] border-2 transition-all text-left group ${
                  reportType === type.id 
                    ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/5' 
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                  reportType === type.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                }`}>
                  {type.icon}
                </div>
                <div>
                  <h4 className={`text-sm font-black uppercase tracking-tight mb-1 ${
                    reportType === type.id ? 'text-blue-600' : 'text-slate-900'
                  }`}>
                    {type.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{type.desc}</p>
                </div>
                {reportType === type.id && (
                  <CheckCircle2 size={16} className="text-blue-600 ml-auto mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* 2. Select Period */}
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">2. Khoảng thời gian</label>
            <div className="bg-slate-50 p-2 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-2">
              {[
                { id: 'DAY', label: 'Hôm nay' },
                { id: 'WEEK', label: 'Tuần này' },
                { id: 'MONTH', label: 'Tháng này' },
                { id: 'CUSTOM', label: 'Tùy chọn' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    period === p.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {period === 'CUSTOM' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 pt-2"
              >
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                  <input type="date" className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none appearance-none" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                  <input type="date" className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none appearance-none" />
                </div>
              </motion.div>
            )}
          </div>

          {/* 3. Select Format */}
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">3. Định dạng tệp tin</label>
            <div className="flex gap-4">
              <button
                onClick={() => setFormat('EXCEL')}
                className={`flex-1 flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all gap-3 ${
                  format === 'EXCEL' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' : 'border-slate-100 hover:border-slate-200 bg-white text-slate-400'
                }`}
              >
                <FileText size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Microsoft Excel</span>
              </button>
              <button
                onClick={() => setFormat('PDF')}
                className={`flex-1 flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all gap-3 ${
                  format === 'PDF' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-100 hover:border-slate-200 bg-white text-slate-400'
                }`}
              >
                <FileText size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Adobe PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Warning Note */}
        <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4 items-center">
           <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Calendar size={20} />
           </div>
           <p className="text-[11px] text-amber-800 font-bold leading-relaxed italic">
             Lưu ý: Dữ liệu báo cáo được trích xuất trực tiếp từ cơ sở dữ liệu thời gian thực. Vui lòng kiểm tra kỹ các tiêu chí trước khi khởi tạo.
           </p>
        </div>
      </div>
    </Modal>
  );
};
1 
export default ReportExportModal;
