import React, { useState, useEffect, useMemo } from 'react';
import { Plus, RefreshCw, PackagePlus, History, X, Search, CheckCircle2, ChevronLeft, ChevronRight, ArrowUpDown, TrendingUp, Box, DollarSign, Filter } from 'lucide-react';
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
};

// ───────── Main Page ─────────
const StockImportManagement = () => {
  const [imports, setImports] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
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

    // Filter by Date
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(item => {
        if (!item.importedAt) return false;
        const itemDate = new Date(item.importedAt);
        if (dateFilter === 'thisMonth') {
          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        }
        if (dateFilter === 'lastMonth') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
        }
        if (dateFilter === 'thisYear') {
          return itemDate.getFullYear() === now.getFullYear();
        }
        return true;
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
  }, [imports, searchTerm, dateFilter, sortConfig]);

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
  }, [searchTerm, dateFilter, pageSize, sortConfig]);

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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
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
            <div className="relative flex items-center">
              <Filter size={16} className="absolute left-3 text-slate-400" />
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="h-12 w-36 rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="all">Tất cả</option>
                <option value="thisMonth">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
                <option value="thisYear">Năm nay</option>
              </select>
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
