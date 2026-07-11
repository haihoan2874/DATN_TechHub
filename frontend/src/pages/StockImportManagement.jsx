import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, RefreshCw, PackagePlus, History, X, Search, CheckCircle2, ChevronLeft, ChevronRight, ArrowUpDown, TrendingUp, Box, DollarSign, Filter, Barcode, ShieldCheck, Copy, ShoppingBag, Tag, Clock, Info } from 'lucide-react';
import adminService from '../services/adminService';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/data/DataTable';
import EmptyState from '../components/feedback/EmptyState';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const tableColumns = [
  { key: 'product', label: 'Sản phẩm', sortable: false },
  { key: 'qty', label: 'Số lượng nhập', className: 'text-right', sortable: true },
  { key: 'importPrice', label: 'Giá vốn nhập', className: 'text-right', sortable: true },
  { key: 'totalPrice', label: 'Thành tiền', className: 'text-right', sortable: true },
  { key: 'note', label: 'Ghi chú', sortable: false },
  { key: 'importedAt', label: 'Ngày nhập', sortable: true },
  { key: 'action', label: 'Serial / SKU', className: 'text-center', sortable: false },
];

const fmtVND = (n) =>
  n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const formatVietnameseDateStr = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const CustomDatePicker = ({ placeholder, value, onChange }) => (
  <label className="relative flex h-12 w-[140px] cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 hover:bg-slate-50">
    <span className={`text-sm font-semibold truncate ${value ? 'text-slate-700' : 'text-slate-400'}`}>
      {value ? formatVietnameseDateStr(value) : placeholder}
    </span>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.target.showPicker && e.target.showPicker()}
      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      title={placeholder}
    />
  </label>
);

// ───────── Modal Form ─────────
const ImportModal = ({ products, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    productId: '',
    quantity: '',
    importPrice: '',
    note: '',
  });
  const [productQuery, setProductQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === form.productId),
    [form.productId, products]
  );
  const filteredProducts = useMemo(() => {
    const keyword = productQuery.trim().toLowerCase();
    return products
      .filter((product) => {
        if (!keyword) return true;
        return product.name?.toLowerCase().includes(keyword)
          || product.slug?.toLowerCase().includes(keyword)
          || product.brandName?.toLowerCase().includes(keyword);
      })
      .slice(0, 8);
  }, [productQuery, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.quantity || !form.importPrice) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    setSaving(true);
    try {
      await adminService.createStockImport({
        productId: form.productId,
        quantity: Number(form.quantity),
        importPrice: Number(form.importPrice),
        note: form.note || null,
        importedAt: new Date().toISOString(),
      });
      toast.success('Tạo phiếu nhập kho thành công!');
      onSuccess();
    } catch {
      toast.error('Không thể tạo phiếu nhập kho');
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
              <PackagePlus size={18} className="text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Tạo phiếu nhập kho</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Sản phẩm */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sản phẩm <span className="text-red-500">*</span>
            </label>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={productQuery}
                  onChange={e => setProductQuery(e.target.value)}
                  placeholder="Tìm theo tên, slug hoặc thương hiệu..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
                {filteredProducts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-sm font-semibold text-slate-400">
                    Không tìm thấy sản phẩm
                  </div>
                ) : (
                  filteredProducts.map(product => {
                    const selected = product.id === form.productId;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          set('productId', product.id);
                          setProductQuery(product.name || '');
                        }}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors ${
                          selected
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black">{product.name}</span>
                          <span className="block truncate text-xs font-semibold text-slate-400">
                            {product.brandName || 'Chưa có thương hiệu'} · {fmtVND(product.price)}
                          </span>
                        </span>
                        {selected && <CheckCircle2 size={18} className="ml-3 flex-shrink-0 text-emerald-600" />}
                      </button>
                    );
                  })
                )}
              </div>
              {selectedProduct && (
                <div className="mt-3 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs font-semibold text-emerald-700">
                  Đã chọn: {selectedProduct.name}
                </div>
              )}
            </div>
          </div>

          {/* Số lượng */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Số lượng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min="1"
              value={form.quantity}
              onChange={e => set('quantity', e.target.value)}
              placeholder="VD: 50"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              required
            />
          </div>

          {/* Giá vốn nhập */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Giá vốn nhập (1sp) (₫) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min="0"
              value={form.importPrice}
              onChange={e => set('importPrice', e.target.value)}
              placeholder="VD: 15000000"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              required
            />
            {form.importPrice && (
              <p className="mt-1 text-xs text-slate-400">{fmtVND(form.importPrice)}</p>
            )}
          </div>
          {selectedProduct && (
            <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
              <span className="font-medium text-slate-500">Giá bán hiện tại: </span>
              <span className="font-bold text-slate-900">{fmtVND(selectedProduct.price)}</span>
              <span className="ml-2 text-xs text-slate-400">(Sửa tại trang Quản lý Sản phẩm)</span>
            </div>
          )}

          {/* Thành tiền dự kiến */}
          {(form.quantity && form.importPrice) ? (
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-blue-800">Thành tiền dự kiến:</span>
              <span className="text-lg font-black text-blue-900">{fmtVND(Number(form.quantity) * Number(form.importPrice))}</span>
            </div>
          ) : null}

          {/* Ghi chú */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Ghi chú</label>
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="VD: Nhập từ nhà phân phối A, hàng mới 2024..."
              rows={2}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>


          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Huỷ
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {saving ? 'Đang lưu...' : 'Tạo phiếu nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

// ───────── Serial/IMEI & Định Danh Vòng Đời Modal (Sửa Phẫu Thuật Tối Ưu) ─────────
const SerialModal = ({ importItem, onClose }) => {
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (importItem?.id) {
      adminService.getSerialNumbersByImport(importItem.id)
        .then(res => setSerials(res || []))
        .catch(() => toast.error('Không thể tải danh sách IMEI/Serial'))
        .finally(() => setLoading(false));
    }
  }, [importItem]);

  const soldCount = useMemo(() => serials.filter(s => s.status === 'SOLD').length, [serials]);
  const availableCount = useMemo(() => serials.filter(s => s.status === 'AVAILABLE').length, [serials]);
  const reservedCount = useMemo(() => serials.filter(s => s.status === 'RESERVED').length, [serials]);
  const soldPercent = useMemo(() => serials.length > 0 ? Math.round((soldCount / serials.length) * 100) : 0, [serials, soldCount]);
  const availablePercent = useMemo(() => serials.length > 0 ? Math.round((availableCount / serials.length) * 100) : 0, [serials, availableCount]);
  const reservedPercent = useMemo(() => serials.length > 0 ? Math.round((reservedCount / serials.length) * 100) : 0, [serials, reservedCount]);

  // Tính toán hiệu quả kinh doanh lô hàng (ERP Batch Financial KPI - Option A)
  const importPrice = Number(importItem?.importPrice || 0);
  const estSellingPrice = importPrice > 0 ? importPrice / 0.7 : 0;
  const cogsSold = soldCount * importPrice;
  const revenueSold = soldCount * estSellingPrice;
  const grossProfit = revenueSold - cogsSold;
  const profitMarginPercent = revenueSold > 0 ? ((grossProfit / revenueSold) * 100).toFixed(1) : '0.0';

  const filteredSerials = useMemo(() => {
    return serials.filter(sn => {
      const matchStatus = filterStatus === 'ALL' || sn.status === filterStatus;
      const matchQuery = !searchQuery || 
        sn.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sn.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sn.orderId?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [serials, filterStatus, searchQuery]);

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label || 'IMEI'}: ${text}`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[88dvh] overflow-y-auto rounded-3xl bg-white p-4 sm:p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
              <Barcode size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Chi tiết Lô nhập & Quản lý Serial / SKU Tài Sản</h3>
              <p className="text-xs font-semibold text-slate-500">
                Lô: <span className="text-slate-800 font-bold">{importItem.productName}</span> (+{importItem.quantity} SP) • Ngày nhập: {fmtDate(importItem.importedAt)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Thống kê lô hàng (Summary Banner - Option A Chuẩn ERP) */}
        {!loading && serials.length > 0 && (
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 flex-1 text-left">
                <div className="border-b pb-2 sm:border-b-0 sm:pb-0 sm:border-r border-slate-700/80 pr-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tổng Lô Nhập</p>
                  <p className="text-xl font-black text-white mt-0.5">{serials.length} <span className="text-xs font-normal text-slate-300">máy (100%)</span></p>
                </div>
                <div className="border-b pb-2 sm:border-b-0 sm:pb-0 lg:border-r border-slate-700/80 pr-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Sẵn trong kho</p>
                  <p className="text-xl font-black text-emerald-300 mt-0.5">{availableCount} <span className="text-xs font-normal text-emerald-200">({availablePercent}%)</span></p>
                </div>
                <div className="border-b pb-2 sm:border-b-0 sm:pb-0 sm:border-r border-slate-700/80 pr-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">Đang giữ / Chờ giao</p>
                  <p className="text-xl font-black text-amber-300 mt-0.5">{reservedCount} <span className="text-xs font-normal text-amber-200">({reservedPercent}%)</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">Đã bán (Xuất kho)</p>
                  <p className="text-xl font-black text-rose-300 mt-0.5">{soldCount} <span className="text-xs font-normal text-rose-200">({soldPercent}%)</span></p>
                </div>
              </div>
            </div>
            {/* Thanh tiến độ 3 màu phân bổ kho hàng */}
            <div className="mt-3.5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-700/60 p-0.5 gap-0.5">
              {availableCount > 0 && (
                <div 
                  className="h-full rounded-l-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${(availableCount / serials.length) * 100}%` }}
                  title={`Sẵn kho: ${availableCount} máy (${availablePercent}%)`}
                />
              )}
              {reservedCount > 0 && (
                <div 
                  className="h-full bg-amber-500 transition-all duration-500" 
                  style={{ width: `${(reservedCount / serials.length) * 100}%` }}
                  title={`Đang giữ / Chờ giao: ${reservedCount} máy (${reservedPercent}%)`}
                />
              )}
              {soldCount > 0 && (
                <div 
                  className="h-full rounded-r-full bg-rose-500 transition-all duration-500" 
                  style={{ width: `${(soldCount / serials.length) * 100}%` }}
                  title={`Đã bán: ${soldCount} máy (${soldPercent}%)`}
                />
              )}
            </div>

            {/* Thẻ Kế toán Quản trị Lô hàng (Executive Batch Financial KPI - Option A) */}
            <div className="mt-4 pt-3.5 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Box 1: Vốn hàng đã bán */}
              <div className="relative group flex items-center gap-2.5 rounded-xl bg-slate-800/80 p-2.5 border border-slate-700/60 cursor-help transition-all hover:border-slate-500/80 hover:bg-slate-800">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-slate-300">
                  <Box size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Vốn hàng đã bán</p>
                    <Info size={12} className="text-slate-400 shrink-0 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm font-black text-white">{fmtVND(cogsSold)}</p>
                </div>

                {/* Popover giải thích công thức */}
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 max-w-[calc(100vw-32px)] rounded-xl bg-slate-900/95 p-3 text-xs text-slate-200 shadow-2xl border border-slate-700 backdrop-blur-md pointer-events-none transition-all animate-in fade-in zoom-in-95 duration-150">
                  <p className="font-bold text-white border-b border-slate-700/80 pb-1.5 mb-2 flex items-center gap-1.5">
                    <Info size={14} className="text-blue-400" /> Công thức Vốn đã bán
                  </p>
                  <div className="space-y-1.5 text-[11px] leading-relaxed">
                    <div className="flex justify-between"><span className="text-slate-400">Số lượng đã bán:</span> <span className="font-semibold text-white">{soldCount} máy</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Giá vốn 1 máy:</span> <span className="font-semibold text-white">{fmtVND(importPrice)}</span></div>
                    <div className="pt-1.5 mt-1 border-t border-slate-800/80 flex justify-between font-bold text-slate-100">
                      <span>Tổng tiền vốn:</span>
                      <span className="text-emerald-400">{fmtVND(cogsSold)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Doanh thu bán ra */}
              <div className="relative group flex items-center gap-2.5 rounded-xl bg-slate-800/80 p-2.5 border border-slate-700/60 cursor-help transition-all hover:border-blue-500/80 hover:bg-slate-800">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-900/50 text-blue-400">
                  <DollarSign size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-300">Doanh thu bán ra</p>
                    <Info size={12} className="text-blue-400 shrink-0 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm font-black text-blue-200">{fmtVND(revenueSold)}</p>
                </div>

                {/* Popover giải thích công thức */}
                <div className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 max-w-[calc(100vw-32px)] rounded-xl bg-slate-900/95 p-3 text-xs text-slate-200 shadow-2xl border border-slate-700 backdrop-blur-md pointer-events-none transition-all animate-in fade-in zoom-in-95 duration-150">
                  <p className="font-bold text-white border-b border-slate-700/80 pb-1.5 mb-2 flex items-center gap-1.5">
                    <Info size={14} className="text-blue-400" /> Công thức Doanh thu
                  </p>
                  <div className="space-y-1.5 text-[11px] leading-relaxed">
                    <div className="flex justify-between"><span className="text-slate-400">Số lượng đã bán:</span> <span className="font-semibold text-white">{soldCount} máy</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Giá bán thực tế (1 SP):</span> <span className="font-semibold text-white">{fmtVND(estSellingPrice)}</span></div>
                    <div className="pt-1.5 mt-1 border-t border-slate-800/80 flex justify-between font-bold text-slate-100">
                      <span>Tổng doanh thu:</span>
                      <span className="text-blue-400">{fmtVND(revenueSold)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 3: Lợi nhuận gộp */}
              <div className="relative group flex items-center gap-2.5 rounded-xl bg-emerald-950/40 p-2.5 border border-emerald-800/50 cursor-help transition-all hover:border-emerald-500/80 hover:bg-emerald-950/60">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-900/60 text-emerald-400">
                  <TrendingUp size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Lợi nhuận gộp</p>
                    <Info size={12} className="text-emerald-400 shrink-0 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm font-black text-emerald-300">
                    +{fmtVND(grossProfit)} <span className="text-xs font-semibold text-emerald-400">({profitMarginPercent}%)</span>
                  </p>
                </div>

                {/* Popover giải thích công thức */}
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 max-w-[calc(100vw-32px)] rounded-xl bg-slate-900/95 p-3 text-xs text-slate-200 shadow-2xl border border-slate-700 backdrop-blur-md pointer-events-none transition-all animate-in fade-in zoom-in-95 duration-150">
                  <p className="font-bold text-white border-b border-slate-700/80 pb-1.5 mb-2 flex items-center gap-1.5">
                    <Info size={14} className="text-emerald-400" /> Công thức Lợi nhuận
                  </p>
                  <div className="space-y-1.5 text-[11px] leading-relaxed">
                    <div className="flex justify-between"><span className="text-slate-400">Doanh thu bán ra:</span> <span className="font-semibold text-blue-300">{fmtVND(revenueSold)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Trừ Vốn đã bán:</span> <span className="font-semibold text-rose-400">-{fmtVND(cogsSold)}</span></div>
                    <div className="pt-1.5 mt-1 border-t border-slate-800/80 flex justify-between font-bold text-slate-100">
                      <span>Lãi thuần ({profitMarginPercent}%):</span>
                      <span className="text-emerald-400">+{fmtVND(grossProfit)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bộ lọc và Tìm kiếm */}
        <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-slate-100 p-1 text-xs font-bold">
            {[
              { id: 'ALL', label: `Tất cả (${serials.length})`, activeColor: 'bg-white text-slate-900 shadow-sm' },
              { id: 'AVAILABLE', label: `Sẵn kho (${availableCount})`, activeColor: 'bg-emerald-600 text-white shadow-sm' },
              { id: 'SOLD', label: `Đã bán (${soldCount})`, activeColor: 'bg-rose-600 text-white shadow-sm' },
              { id: 'RESERVED', label: `Đang giữ / Chờ giao (${reservedCount})`, activeColor: 'bg-amber-600 text-white shadow-sm' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`rounded-lg px-3 py-1.5 whitespace-nowrap transition-all ${
                  filterStatus === tab.id ? tab.activeColor : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Tìm Serial/SKU hoặc mã Đơn hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Danh sách Serial / SKU */}
        <div className="max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex justify-center py-12 text-slate-400 font-semibold text-sm">Đang tải số liệu Serial/SKU và đối soát đơn hàng...</div>
          ) : filteredSerials.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">
              {searchQuery || filterStatus !== 'ALL' ? 'Không tìm thấy mã Serial/SKU nào khớp với điều kiện lọc.' : 'Chưa có mã Serial/SKU nào cho lô này.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {filteredSerials.map((sn, idx) => (
                <div 
                  key={sn.id || idx} 
                  className={`flex flex-col justify-between rounded-2xl border p-3.5 transition-all ${
                    sn.status === 'SOLD' ? 'border-rose-200 bg-rose-50/40' : 
                    sn.status === 'RESERVED' ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-600 shadow-2xs">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 truncate" title={sn.serialNumber}>
                        {sn.serialNumber}
                      </span>
                      <button 
                        onClick={() => handleCopy(sn.serialNumber, 'Serial')}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="Sao chép Serial"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      sn.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 
                      sn.status === 'RESERVED' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {sn.status === 'AVAILABLE' ? 'Sẵn kho' : sn.status === 'RESERVED' ? 'Đang giữ (Chờ giao)' : 'Đã bán'}
                    </span>
                  </div>

                  {/* Phần hiển thị Đơn hàng nếu Đã Bán hoặc Đang Giữ */}
                  {(sn.status === 'SOLD' || sn.status === 'RESERVED') && (
                    <div className={`mt-2.5 flex items-center justify-between rounded-xl bg-white/80 border px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 ${
                      sn.status === 'SOLD' ? 'border-rose-100' : 'border-amber-100'
                    }`}>
                      <div className={`flex items-center gap-1.5 ${sn.status === 'SOLD' ? 'text-rose-700' : 'text-amber-700'}`}>
                        {sn.status === 'SOLD' ? (
                          <ShieldCheck size={14} className="flex-shrink-0 text-emerald-600" />
                        ) : (
                          <Clock size={14} className="flex-shrink-0 text-amber-600 animate-pulse" />
                        )}
                        <span className="truncate">
                          Đơn: <strong className="font-mono text-slate-900">{sn.orderNumber ? (sn.orderNumber.startsWith('#') ? sn.orderNumber : `#${sn.orderNumber}`) : (sn.orderId ? `#${sn.orderId.substring(0, 8).toUpperCase()}` : 'N/A')}</strong>
                        </span>
                      </div>
                      {(sn.orderNumber || sn.orderId) && (
                        <button 
                          onClick={() => handleCopy(sn.orderNumber || sn.orderId, 'Mã Đơn Hàng')}
                          className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                          title="Sao chép trọn bộ mã đơn hàng để đối soát kế toán"
                        >
                          Copy ID
                        </button>
                      )}
                    </div>
                  )}

                  {sn.status === 'AVAILABLE' && (
                    <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <CheckCircle2 size={13} className="flex-shrink-0" />
                      <span>Sẵn sàng xuất kho & định danh đơn bán</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4">
          <button onClick={onClose} className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

// ───────── Main Page ─────────
const StockImportManagement = () => {
  const [imports, setImports] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImportForSerial, setSelectedImportForSerial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'importedAt', direction: 'desc' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [importsRes, productsRes] = await Promise.all([
        adminService.getAllStockImports(),
        adminService.getProducts({ pageNo: 0, pageSize: 1000, isActive: true }),
      ]);
      setImports(importsRes || []);
      setProducts(productsRes?.contents || productsRes?.content || []);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowModal(false);
    fetchData();
  };

  const filteredImports = useMemo(() => {
    let result = [...imports];

    // Filter by Custom Date Range
    if (startDate || endDate) {
      result = result.filter(item => {
        if (!item.importedAt) return false;
        const itemDate = new Date(item.importedAt).getTime();
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
        return itemDate >= start && itemDate <= end;
      });
    }

    // Filter by Search Term
    const keyword = searchTerm.trim().toLowerCase();
    if (keyword) {
      result = result.filter((item) => {
        const date = fmtDate(item.importedAt).toLowerCase();
        return [
          item.productName,
          item.note,
          String(item.quantity || ''),
          String(item.importPrice || ''),
          date,
        ].some((value) => String(value || '').toLowerCase().includes(keyword));
      });
    }

    // Sort
    result.sort((a, b) => {
      let valA, valB;
      if (sortConfig.key === 'qty') {
        valA = a.quantity || 0;
        valB = b.quantity || 0;
      } else if (sortConfig.key === 'importPrice') {
        valA = a.importPrice || 0;
        valB = b.importPrice || 0;
      } else if (sortConfig.key === 'totalPrice') {
        valA = (a.quantity || 0) * (a.importPrice || 0);
        valB = (b.quantity || 0) * (b.importPrice || 0);
      } else {
        valA = new Date(a.importedAt || 0).getTime();
        valB = new Date(b.importedAt || 0).getTime();
      }
      
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [imports, searchTerm, startDate, endDate, sortConfig]);

  const summaryStats = useMemo(() => {
    return filteredImports.reduce((acc, item) => {
      acc.totalImports += 1;
      acc.totalQuantity += (item.quantity || 0);
      acc.totalValue += (item.quantity || 0) * (item.importPrice || 0);
      return acc;
    }, { totalImports: 0, totalQuantity: 0, totalValue: 0 });
  }, [filteredImports]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const columnsWithSort = useMemo(() => {
    return tableColumns.map(col => ({
      ...col,
      sortConfig,
      onSort: handleSort
    }));
  }, [sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredImports.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedImports = useMemo(
    () => filteredImports.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [filteredImports, pageSize, safePage]
  );
  const from = filteredImports.length === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min(filteredImports.length, (safePage + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, startDate, endDate, pageSize, sortConfig]);

  return (
    <PageShell>
      {showModal && (
        <ImportModal
          products={products}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
      {selectedImportForSerial && (
        <SerialModal
          importItem={selectedImportForSerial}
          onClose={() => setSelectedImportForSerial(null)}
        />
      )}

      <PageHeader
        eyebrow="Quản lý kho hàng"
        title="Nhập kho"
        description="Tạo phiếu nhập hàng mới và theo dõi toàn bộ lịch sử nhập kho."
        icon={PackagePlus}
        action={
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
              aria-label="Tải lại"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <Button
              onClick={() => setShowModal(true)}
              id="btn-create-stock-import"
              icon={Plus}
            >
              Tạo phiếu nhập
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <History size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Tổng số phiếu nhập</p>
              <p className="text-2xl font-black text-slate-900">{summaryStats.totalImports}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Box size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Tổng SP nhập</p>
              <p className="text-2xl font-black text-slate-900">{summaryStats.totalQuantity}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Tổng giá trị kho</p>
              <p className="text-2xl font-black text-slate-900">{fmtVND(summaryStats.totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo sản phẩm, ghi chú, ngày nhập..."
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-10 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Xóa từ khóa"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <CustomDatePicker
                placeholder="Từ ngày"
                value={startDate}
                onChange={setStartDate}
              />
              <span className="text-slate-400 font-medium">-</span>
              <CustomDatePicker
                placeholder="Đến ngày"
                value={endDate}
                onChange={setEndDate}
              />
            </div>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-12 w-28 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value={12}>12 dòng</option>
              <option value={24}>24 dòng</option>
              <option value={48}>48 dòng</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable columns={columnsWithSort}>
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td colSpan="6" className="px-5 py-4">
                <div className="h-5 w-full rounded bg-slate-100" />
              </td>
            </tr>
          ))
        ) : filteredImports.length === 0 ? (
          <tr>
            <td colSpan="6">
              <EmptyState
                title={imports.length === 0 ? 'Chưa có phiếu nhập kho' : 'Không tìm thấy phiếu nhập'}
                description={imports.length === 0 ? "Bấm 'Tạo phiếu nhập' để bắt đầu nhập lô hàng đầu tiên." : 'Thử đổi từ khóa tìm kiếm hoặc xóa bộ lọc hiện tại.'}
              />
            </td>
          </tr>
        ) : (
          pagedImports.map(item => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <History size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.productName}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  +{item.quantity}
                </span>
              </td>
              <td className="px-5 py-4 text-right text-sm font-semibold text-slate-700">
                {fmtVND(item.importPrice)}
              </td>
              <td className="px-5 py-4 text-right text-sm font-black text-blue-700">
                {fmtVND((item.quantity || 0) * (item.importPrice || 0))}
              </td>
              <td className="px-5 py-4 text-sm text-slate-500 max-w-[180px] truncate">
                {item.note || <span className="text-slate-300">—</span>}
              </td>
              <td className="px-5 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                {fmtDate(item.importedAt)}
              </td>
              <td className="px-5 py-4 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedImportForSerial(item)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all"
                  title="Xem danh sách Serial / SKU kho"
                >
                  <Barcode size={14} />
                  Xem Serial
                </button>
              </td>
            </tr>
          ))
        )}
      </DataTable>
      {!loading && filteredImports.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold text-slate-500">
            Hiển thị <span className="font-black text-slate-900">{from}-{to}</span> trong <span className="font-black text-slate-900">{filteredImports.length}</span> phiếu nhập
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={safePage === 0}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Trước
            </button>
            <div className="flex h-10 min-w-16 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 font-black text-slate-800">
              {safePage + 1}/{totalPages}
            </div>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
              disabled={safePage >= totalPages - 1}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default StockImportManagement;
