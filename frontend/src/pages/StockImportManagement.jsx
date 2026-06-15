import React, { useState, useEffect, useMemo } from 'react';
import { Plus, RefreshCw, PackagePlus, History, X, Search, CheckCircle2 } from 'lucide-react';
import adminService from '../services/adminService';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/data/DataTable';
import EmptyState from '../components/feedback/EmptyState';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const tableColumns = [
  { key: 'product', label: 'Sản phẩm' },
  { key: 'qty', label: 'Số lượng nhập', className: 'text-right' },
  { key: 'importPrice', label: 'Giá vốn nhập', className: 'text-right' },
  { key: 'note', label: 'Ghi chú' },
  { key: 'importedAt', label: 'Ngày nhập' },
];

const fmtVND = (n) =>
  n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
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
              Giá vốn nhập (₫) <span className="text-red-500">*</span>
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
};

// ───────── Main Page ─────────
const StockImportManagement = () => {
  const [imports, setImports] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

  return (
    <PageShell>
      {showModal && (
        <ImportModal
          products={products}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
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

      <DataTable columns={tableColumns}>
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td colSpan="6" className="px-5 py-4">
                <div className="h-5 w-full rounded bg-slate-100" />
              </td>
            </tr>
          ))
        ) : imports.length === 0 ? (
          <tr>
            <td colSpan="4">
              <EmptyState
                title="Chưa có phiếu nhập kho"
                description="Bấm 'Tạo phiếu nhập' để bắt đầu nhập lô hàng đầu tiên."
              />
            </td>
          </tr>
        ) : (
          imports.map(item => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                    <History size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.productName}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                  +{item.quantity}
                </span>
              </td>
              <td className="px-5 py-4 text-right text-sm font-semibold text-slate-700">
                {fmtVND(item.importPrice)}
              </td>
              <td className="px-5 py-4 text-sm text-slate-500 max-w-[180px] truncate">
                {item.note || <span className="text-slate-300">—</span>}
              </td>
              <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                {fmtDate(item.importedAt)}
              </td>
            </tr>
          ))
        )}
      </DataTable>
    </PageShell>
  );
};

export default StockImportManagement;
