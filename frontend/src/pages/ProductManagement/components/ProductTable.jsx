import React from 'react';
import { Edit2, Trash2, Package, Plus } from 'lucide-react';

const ProductTable = ({ products, loading, onEdit, onDelete, onUpdateStock }) => {
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8089${url}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
        <div className="animate-pulse space-y-4 p-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-slate-50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Danh mục / Hiệu</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Giá / Kho</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 p-2 border border-slate-200 flex-shrink-0">
                      <img src={getImageUrl(product.imageUrl)} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-900 italic uppercase truncate">{product.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{product.categoryName || 'N/A'}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{product.brandName || 'S-Life'}</span>
                   </div>
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm font-black text-blue-600 italic">{product.price.toLocaleString()} ₫</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase ${product.stockQuantity < 10 ? 'text-red-500' : 'text-slate-400'}`}>
                      Tồn kho: {product.stockQuantity}
                    </span>
                    <button 
                      onClick={() => onUpdateStock(product)}
                      className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                     <button 
                       onClick={() => onEdit(product)} 
                       className="p-3 bg-slate-50 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"
                     >
                       <Edit2 size={16} />
                     </button>
                     <button 
                       onClick={() => onDelete(product.id)} 
                       className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan="4" className="px-8 py-20 text-center">
                   <div className="max-w-xs mx-auto space-y-4 opacity-30">
                      <Package size={48} className="mx-auto" />
                      <p className="text-xs font-black uppercase tracking-widest italic">Không tìm thấy sản phẩm nào</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
