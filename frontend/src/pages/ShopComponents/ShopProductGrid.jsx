import React from 'react';
import { ChevronDown, Search } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import Button from '../../components/ui/Button';

const SkeletonCard = () => (
  <div className="flex h-32 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:h-[310px] sm:flex-col">
    <div className="h-full w-32 shrink-0 animate-pulse rounded-xl bg-slate-100 sm:h-40 sm:w-full" />
    <div className="flex min-w-0 flex-1 flex-col gap-3">
    <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
    <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
    <div className="mt-auto flex justify-between">
      <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />
      <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
    </div>
    </div>
  </div>
);

const renderPaginationItems = (currentPage, totalPages, handlePageChange) => {
  const items = [];

  for (let i = 0; i < totalPages; i++) {
    if (
      i === 0 ||
      i === totalPages - 1 ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      items.push(
        <button
          type="button"
          key={i}
          onClick={() => handlePageChange(i)}
          className={`h-10 w-10 rounded-xl text-sm font-semibold transition-colors ${
            currentPage === i
            ? 'bg-slate-900 text-white'
            : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700'
          }`}
        >
          {i + 1}
        </button>
      );
    } else if (i === 1 || i === totalPages - 2) {
      items.push(<span key={i} className="text-slate-300 font-black px-1">...</span>);
    }
  }

  return items;
};

const ShopProductGrid = ({
  loading,
  products,
  totalPages,
  currentPage,
  handlePageChange,
  PAGE_SIZE,
  setIsConfirmClearOpen
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
        {[...Array(PAGE_SIZE)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
          <Search size={32} className="text-slate-300" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-slate-950">Không tìm thấy sản phẩm</h3>
        <p className="mx-auto mb-8 max-w-xs text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        <Button
          variant="primary"
          onClick={() => setIsConfirmClearOpen(true)}
        >
          Xóa tất cả bộ lọc
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-slate-200 py-6">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronDown className="rotate-90" size={20} />
          </button>

          <div className="flex items-center gap-2">
            {renderPaginationItems(currentPage, totalPages, handlePageChange)}
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronDown className="-rotate-90" size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ShopProductGrid);
