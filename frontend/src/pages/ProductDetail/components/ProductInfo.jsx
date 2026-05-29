import React from 'react';
import { CheckCircle2, Minus, PackageCheck, Plus, ShieldCheck, ShoppingCart, Star, Truck, Zap } from 'lucide-react';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/status/StatusBadge';

const ProductInfo = ({ product, quantity, setQuantity, onAddToCart, onBuyNow, cartAction }) => {
  const { name, price, description, brandName, categoryName, stockQuantity = 0 } = product;
  const stock = Number(stockQuantity || 0);
  const inStock = stock > 0;
  const specs = parseSpecs(product.specs);
  const warranty = specs['Bảo hành'] || specs['Warranty'] || 'Theo từng sản phẩm';
  const shipping = specs['Vận chuyển'] || 'Theo đơn hàng';

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {brandName && <StatusBadge tone="blue">{brandName}</StatusBadge>}
          <StatusBadge tone={inStock ? 'green' : 'red'}>
            {inStock ? 'Còn hàng' : 'Hết hàng'}
          </StatusBadge>
        </div>

        <h1 className="text-xl font-bold leading-tight text-slate-950 sm:text-2xl lg:text-3xl">{name}</h1>

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
          <span className="text-sm text-slate-500">Tồn kho: {stock}</span>
        </div>
      </div>

      <div className="mt-3 border-y border-slate-100 py-3">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">Giá bán</p>
        <p className="mt-1 text-xl font-bold text-blue-700 sm:text-2xl">{formatCurrency(price)}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
        <MetaRow label="Danh mục" value={categoryName || 'Chưa phân loại'} />
        <MetaRow label="Bảo hành" value={warranty} />
        <MetaRow label="Tình trạng" value={inStock ? 'Còn hàng' : 'Hết hàng'} />
        <MetaRow label="Vận chuyển" value={shipping} />
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description || 'Thông tin mô tả đang được cập nhật.'}
      </p>

      <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-700 sm:grid-cols-2 sm:text-sm">
        <TrustItem icon={PackageCheck} title="Kiểm tra khi nhận" />
        <TrustItem icon={Truck} title={shipping} />
        <TrustItem icon={ShieldCheck} title={warranty} />
        <TrustItem icon={CheckCircle2} title="Thông số rõ ràng" />
      </div>

      <div className="mt-auto space-y-3 pt-4">
        <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
          <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-1">
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
              onClick={() => setQuantity(Math.min(stock || 1, quantity + 1))}
              disabled={!inStock || quantity >= stock}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Tăng số lượng"
            >
              <Plus size={16} />
            </button>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={onBuyNow}
            icon={Zap}
            isLoading={cartAction === 'buy'}
            disabled={!inStock || Boolean(cartAction)}
          >
            Mua ngay
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-300"
            onClick={onAddToCart}
            icon={ShoppingCart}
            isLoading={cartAction === 'add'}
            disabled={!inStock || Boolean(cartAction)}
          >
            Thêm vào giỏ
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            type="button"
            onClick={() => document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Xem đánh giá
          </Button>
        </div>
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-white p-2.5 sm:p-3">
    <span className="block text-[11px] font-medium text-slate-400 sm:text-xs">{label}</span>
    <span className="mt-1 block text-sm font-semibold text-slate-900">{value}</span>
  </div>
);

const TrustItem = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2">
    <Icon size={16} className="flex-shrink-0 text-blue-600" />
    <span className="font-medium">{title}</span>
  </div>
);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount || 0));
};

const parseSpecs = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export default ProductInfo;
