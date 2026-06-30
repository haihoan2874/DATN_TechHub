import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import DataTable from '../../../components/data/DataTable';
import EmptyState from '../../../components/feedback/EmptyState';
import { resolveApiAssetUrl } from '../../../config/api';
import { formatCurrency } from '../../../utils/formatters';

const tableColumns = [
  { key: 'product', label: 'Sản phẩm', sortable: true, sortKey: 'name' },
  { key: 'classification', label: 'Phân loại', sortable: false },
  { key: 'priceStock', label: 'Giá / Kho hiện tại', sortable: true, sortKey: 'price' },
  { key: 'actions', label: 'Thao tác', className: 'text-right', sortable: false }
];

const ProductTable = ({ products, loading, footer, onEdit, onDelete, sortConfig, onSort }) => {
  const columnsWithSort = React.useMemo(() => {
    return tableColumns.map(col => ({
      ...col,
      sortConfig,
      onSort: col.sortable ? () => onSort(col.sortKey) : undefined,
      // override key if we use sortKey to match DataTable expected structure
      key: col.sortKey || col.key
    }));
  }, [sortConfig, onSort]);
  const getImageUrl = (url) => {
    return resolveApiAssetUrl(url, '');
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="animate-pulse space-y-4 p-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DataTable columns={columnsWithSort} footer={footer}>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2">
                      {product.imageUrl ? (
                        <img
                          src={getImageUrl(product.imageUrl)}
                          className="h-full w-full object-contain"
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <Package size={22} className="text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 max-w-[200px] xl:max-w-xs">
                      <div className="truncate text-sm font-semibold text-slate-950" title={product.name}>{product.name}</div>
                      <div className="truncate font-mono text-xs text-slate-400" title={product.slug}>{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                   <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">{product.categoryName || 'Chưa phân loại'}</span>
                      <span className="text-xs font-medium text-slate-400">{product.brandName || 'Chưa có thương hiệu'}</span>
                   </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-bold text-blue-700">{formatCurrency(product.price)}</div>
                  <div className={`mt-1 text-xs font-semibold ${product.stockQuantity < 10 ? 'text-rose-600' : 'text-slate-500'}`}>
                    Kho: {product.stockQuantity}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                     <button 
                       type="button"
                       onClick={() => onEdit(product)} 
                       className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                       aria-label={`Sửa sản phẩm ${product.name}`}
                     >
                       <Edit2 size={16} />
                     </button>
                     <button 
                       type="button"
                       onClick={() => onDelete(product.id)} 
                       className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                       aria-label={`Xóa sản phẩm ${product.name}`}
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan="4">
                  <EmptyState title="Không có sản phẩm" description="Thử đổi bộ lọc hoặc tạo sản phẩm mới." />
                </td>
              </tr>
            )}
    </DataTable>
  );
};

export default ProductTable;
