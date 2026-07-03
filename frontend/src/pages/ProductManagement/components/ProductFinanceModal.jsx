import React, { useEffect, useState } from 'react';
import { X, TrendingUp, DollarSign, PackageOpen, Tag, ShoppingCart } from 'lucide-react';
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
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="text-sm text-slate-500">Giá nhập bình quân (1 cái):</span>
                    <span className="font-semibold text-slate-900">
                      {stats.quantityImported > 0 
                        ? formatCurrency(stats.totalImportCost / stats.quantityImported) 
                        : '0 ₫'}
                    </span>
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
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="text-sm text-slate-500">Giá vốn xuất kho (1 cái):</span>
                    <span className="font-semibold text-slate-900">
                      {stats.quantitySold > 0 ? formatCurrency(stats.cogs / stats.quantitySold) : '0 ₫'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="text-sm font-medium text-slate-700">Tổng vốn xuất kho (Tất cả hàng đã giao):</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(stats.cogs)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="text-sm font-medium text-slate-700">Tổng doanh thu (Tất cả):</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-xl border border-indigo-100 bg-indigo-50 p-5 md:col-span-2">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                    <Tag size={20} />
                  </div>
                  <h4 className="font-semibold text-indigo-900">Trạng thái tồn kho hiện tại</h4>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <span className="block text-xs font-medium text-slate-500">SL tồn kho</span>
                    <span className="mt-1 block text-lg font-bold text-slate-900">{stats.currentStock} cái</span>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <span className="block text-xs font-medium text-slate-500">Giá vốn bình quân (1 cái)</span>
                    <span className="mt-1 block text-lg font-bold text-indigo-700">{formatCurrency(stats.currentMac)}</span>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <span className="block text-xs font-medium text-slate-500">Tổng giá trị tồn kho (Tất cả)</span>
                    <span className="mt-1 block text-lg font-bold text-indigo-700">{formatCurrency(stats.currentStockValue)}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-xl border border-blue-100 bg-blue-50 p-6 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Lợi nhuận gộp</h4>
                      <p className="text-xs text-blue-700/70 mt-1">Doanh thu - Giá vốn hàng bán</p>
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
