import React, { useEffect, useState } from 'react';
import { X, TrendingUp, DollarSign, PackageOpen, Tag, ShoppingCart, Info } from 'lucide-react';
import adminService from '../../../services/adminService';
import { formatCurrency } from '../../../utils/formatters';
import toast from 'react-hot-toast';

const ProductFinanceModal = ({ isOpen, onClose, product }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!product || !isOpen) return;
      setLoading(true);
      try {
        const response = await adminService.getProductFinance(product.id);
        setStats(response);
      } catch (error) {
        toast.error('Không thể lấy dữ liệu thống kê sản phẩm');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [product, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className="relative w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl transition-all"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hiệu quả kinh doanh</h3>
            <p className="mt-1 text-sm text-slate-500 line-clamp-1">{product?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                    <PackageOpen size={20} />
                  </div>
                  <h4 className="font-semibold text-slate-900">Đầu vào (Nhập kho)</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Tổng SL đã nhập:</span>
                    <span className="font-semibold text-slate-900">{stats.quantityImported} cái</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-3 relative group cursor-help">
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      Giá nhập bình quân (1 cái):
                      <Info size={13} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                    </span>
                    <span className="font-semibold text-slate-900">
                      {stats.quantityImported > 0 
                        ? formatCurrency(stats.totalImportCost / stats.quantityImported) 
                        : '0 ₫'}
                    </span>
                    {/* Tooltip công thức Light Glass Ledger */}
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 max-w-[calc(100vw-32px)] rounded-xl bg-white/98 backdrop-blur-md p-3 text-xs text-slate-700 shadow-2xl border border-slate-200 pointer-events-none transition-all">
                      <div className="font-semibold text-orange-600 border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5 text-[11px]">
                        <Info size={13} /> Phép tính Giá nhập bình quân
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tổng vốn đã chi:</span>
                          <span className="font-medium text-slate-900">{formatCurrency(stats.totalImportCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Chia cho tổng SL nhập:</span>
                          <span className="font-medium text-slate-900">÷ {stats.quantityImported} cái</span>
                        </div>
                        <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold text-orange-600">
                          <span>Đơn giá bình quân:</span>
                          <span>{stats.quantityImported > 0 ? formatCurrency(stats.totalImportCost / stats.quantityImported) : '0 ₫'} / SP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="text-sm font-medium text-slate-700">Tổng vốn đã chi (Tất cả):</span>
                    <span className="font-bold text-orange-600">{formatCurrency(stats.totalImportCost)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                    <ShoppingCart size={20} />
                  </div>
                  <h4 className="font-semibold text-slate-900">Đầu ra (Đã giao)</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Tổng SL đã bán:</span>
                    <span className="font-semibold text-slate-900">{stats.quantitySold} cái</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-3 relative group cursor-help">
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      Giá bán bình quân (1 cái):
                      <Info size={13} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </span>
                    <span className="font-semibold text-slate-900">
                      {stats.quantitySold > 0 ? formatCurrency(stats.totalRevenue / stats.quantitySold) : '0 ₫'}
                    </span>
                    {/* Tooltip công thức Light Glass Ledger */}
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 rounded-xl bg-white/98 backdrop-blur-md p-3 text-xs text-slate-700 shadow-2xl border border-slate-200 pointer-events-none transition-all">
                      <div className="font-semibold text-emerald-600 border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5 text-[11px]">
                        <Info size={13} /> Phép tính Giá bán bình quân
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tổng doanh thu:</span>
                          <span className="font-medium text-slate-900">{formatCurrency(stats.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Chia cho tổng SL bán:</span>
                          <span className="font-medium text-slate-900">÷ {stats.quantitySold} cái</span>
                        </div>
                        <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold text-emerald-600">
                          <span>Đơn giá bán bình quân:</span>
                          <span>{stats.quantitySold > 0 ? formatCurrency(stats.totalRevenue / stats.quantitySold) : '0 ₫'} / SP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="text-sm font-medium text-slate-700">Tổng doanh thu (Tất cả):</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-3 relative group cursor-help">
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      Giá vốn hàng đã bán:
                      <Info size={13} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </span>
                    <span className="font-semibold text-slate-900">{formatCurrency(stats.cogs)}</span>
                    {/* Tooltip công thức Light Glass Ledger */}
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 rounded-xl bg-white/98 backdrop-blur-md p-3 text-xs text-slate-700 shadow-2xl border border-slate-200 pointer-events-none transition-all">
                      <div className="font-semibold text-emerald-600 border-b border-slate-100 pb-1.5 mb-1.5 flex items-center gap-1.5 text-[11px]">
                        <Info size={13} /> Ý nghĩa Giá vốn hàng đã bán
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        Là tổng số tiền vốn gốc tương ứng với <span className="font-bold text-slate-900">{stats.quantitySold}</span> sản phẩm đã xuất giao thành công cho khách hàng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-xl border border-indigo-100 bg-indigo-50 p-5 md:col-span-2">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                    <Tag size={20} />
                  </div>
                  <h4 className="font-semibold text-indigo-900">Trạng thái sản phẩm trong kho</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <span className="block text-xs font-medium text-slate-500">SP trong kho</span>
                    <span className="mt-1 block text-lg font-bold text-slate-900">{stats.currentStock} cái</span>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <span className="block text-xs font-medium text-amber-600">Đang chờ giao</span>
                    <span className="mt-1 block text-lg font-bold text-amber-600">{stats.reservedStock} cái</span>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm relative group cursor-help">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      Giá vốn bình quân
                      <Info size={12} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </span>
                    <span className="mt-1 block text-lg font-bold text-indigo-700">{formatCurrency(stats.currentMac)}</span>
                    {/* Tooltip công thức Light Glass Ledger */}
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 max-w-[calc(100vw-32px)] rounded-xl bg-white/98 backdrop-blur-md p-3 text-xs text-slate-700 shadow-2xl border border-slate-200 pointer-events-none transition-all">
                      <div className="font-semibold text-indigo-600 border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5 text-[11px]">
                        <Info size={13} /> Phép tính Giá vốn bình quân
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tổng giá trị kho:</span>
                          <span className="font-medium text-slate-900">{formatCurrency(stats.currentStockValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Chia cho SL trong kho:</span>
                          <span className="font-medium text-slate-900">÷ {stats.currentStock} cái</span>
                        </div>
                        <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold text-indigo-600">
                          <span>Đơn giá vốn tồn kho:</span>
                          <span>{formatCurrency(stats.currentMac)} / SP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <span className="block text-xs font-medium text-slate-500">Tổng giá trị (Tất cả)</span>
                    <span className="mt-1 block text-lg font-bold text-indigo-700">{formatCurrency(stats.currentStockValue)}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-xl border border-blue-100 bg-blue-50 p-6 md:col-span-2 relative group cursor-help">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-medium text-blue-900">Lợi nhuận gộp</h4>
                        <Info size={14} className="text-blue-500 group-hover:text-blue-700 transition-colors" />
                      </div>
                      <p className="text-xs text-blue-700/70 mt-1">Doanh thu - Giá vốn hàng đã bán</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-700">{formatCurrency(stats.profit)}</div>
                    {stats.quantitySold > 0 && (
                      <div className="mt-1 text-sm font-medium text-blue-600">
                        ~ {formatCurrency(stats.profit / stats.quantitySold)} / SP
                      </div>
                    )}
                  </div>
                </div>
                {/* Tooltip công thức Light Glass Ledger */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-72 rounded-xl bg-white/98 backdrop-blur-md p-3 text-xs text-slate-700 shadow-2xl border border-slate-200 pointer-events-none transition-all">
                  <div className="font-semibold text-blue-600 border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5 text-[11px]">
                    <Info size={13} /> Phép tính Lợi nhuận gộp
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tổng doanh thu bán ra:</span>
                      <span className="font-medium text-slate-900">{formatCurrency(stats.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trừ Giá vốn hàng đã bán:</span>
                      <span className="font-medium text-red-600">- {formatCurrency(stats.cogs)}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold text-blue-600">
                      <span>Lãi ròng thu về:</span>
                      <span>{formatCurrency(stats.profit)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">Không có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFinanceModal;
