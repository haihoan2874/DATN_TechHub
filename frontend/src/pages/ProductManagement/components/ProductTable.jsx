import React from 'react';
import { Edit2, Trash2, Package, Plus } from 'lucide-react';
import DataTable from '../../../components/data/DataTable';
import EmptyState from '../../../components/feedback/EmptyState';
import { resolveApiAssetUrl } from '../../../config/api';

const tableColumns = [
  { key: 'product', label: 'Sản phẩm' },
  { key: 'classification', label: 'Phân loại' },
  { key: 'priceStock', label: 'Giá / Tồn kho' },
  { key: 'actions', label: 'Thao tác', className: 'text-right' }
];

const ProductTable = ({ products, loading, footer, onEdit, onDelete, onUpdateStock }) => {
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
    <DataTable columns={tableColumns} footer={footer}>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2">
                      {product.imageUrl ? (
                        <img src={getImageUrl(product.imageUrl)} className="h-full w-full object-contain" alt="" />
                      ) : (
                        <Package size={22} className="text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-950">{product.name}</div>
                      <div className="truncate font-mono text-xs text-slate-400">{product.slug}</div>
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
                  <div className="text-sm font-bold text-blue-700">{product.price.toLocaleString()} ₫</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-xs font-semibold ${product.stockQuantity < 10 ? 'text-rose-600' : 'text-slate-500'}`}>
                      Tồn kho: {product.stockQuantity}
                    </span>
                    <button 
                      onClick={() => onUpdateStock(product)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                     <button 
                       onClick={() => onEdit(product)} 
                       className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                     >
                       <Edit2 size={16} />
                     </button>
                     <button 
                       onClick={() => onDelete(product.id)} 
                       className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
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
