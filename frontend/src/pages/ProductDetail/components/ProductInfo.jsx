import React from 'react';
import { Activity, Battery, Minus, Plus, ShieldCheck, ShoppingCart, Star, Watch } from 'lucide-react';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/status/StatusBadge';

const ProductInfo = ({ product, quantity, setQuantity, onAddToCart }) => {
  const { name, price, description, brandName, stockQuantity = 0 } = product;
  const inStock = Number(stockQuantity) > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {brandName && <StatusBadge tone="blue">{brandName}</StatusBadge>}
          <StatusBadge tone={inStock ? 'green' : 'red'}>
            {inStock ? 'Còn hàng' : 'Hết hàng'}
          </StatusBadge>
        </div>

        <h1 className="text-3xl font-bold leading-tight text-slate-950 lg:text-4xl">{name}</h1>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Star size={18} fill="currentColor" />
            <span className="text-sm font-semibold text-slate-900">
              {Number(product.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-sm text-slate-500">
              ({product.reviewCount || 0} đánh giá)
            </span>
          </div>
          <span className="text-sm text-slate-500">Tồn kho: {stockQuantity}</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-500">Giá bán</p>
        <p className="mt-1 text-3xl font-bold text-blue-600">{formatCurrency(price)}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <QuickSpec icon={<Watch size={18} />} label="Thiết kế" value="Thiết bị thông minh" />
          <QuickSpec icon={<Activity size={18} />} label="Theo dõi" value="Sức khỏe" />
          <QuickSpec icon={<Battery size={18} />} label="Pin" value="Tối ưu sử dụng" />
          <QuickSpec icon={<ShieldCheck size={18} />} label="Bảo hành" value="Theo chính sách" />
        </div>
      </div>

      <p className="mt-6 text-sm leading-6 text-slate-600">
        {description || 'Sản phẩm công nghệ hỗ trợ chăm sóc sức khỏe và theo dõi hoạt động hằng ngày.'}
      </p>

      <div className="mt-8 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-700">Số lượng</p>
          <div className="flex w-fit items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Giảm số lượng"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-slate-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(stockQuantity || 1, quantity + 1))}
              disabled={!inStock || quantity >= stockQuantity}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Tăng số lượng"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full"
          onClick={onAddToCart}
          icon={ShoppingCart}
          disabled={!inStock}
        >
          Thêm vào giỏ hàng
        </Button>
      </div>
    </div>
  );
};

const QuickSpec = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
    <div className="text-slate-400">{icon}</div>
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount || 0));
};

export default ProductInfo;
