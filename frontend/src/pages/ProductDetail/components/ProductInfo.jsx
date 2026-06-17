import React from 'react';
import {
  CheckCircle2,
  CreditCard,
  Gift,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/status/StatusBadge';
import { formatCurrency } from '../../../utils/formatters';

const ProductInfo = ({ product, quantity, setQuantity, onAddToCart, onBuyNow, cartAction }) => {
  const { name, price, description, brandName, categoryName, stockQuantity = 0 } = product;
  const stock = Number(stockQuantity || 0);
  const inStock = stock > 0;
  const specs = parseSpecs(product.specs);
  const warranty = specs['Bảo hành'] || specs['Warranty'] || 'Theo chính sách';
  const shipping = specs['Vận chuyển'] || 'Giao hàng toàn quốc';
  const deviceType = specs['Loại thiết bị'] || specs['Sản phẩm'] || categoryName || 'Thiết bị sức khỏe thông minh';
  const colors = getOptionValues(specs, ['Màu sắc', 'Màu', 'Color', 'Colors']);
  const sizes = getOptionValues(specs, ['Kích thước', 'Size', 'Kích cỡ', 'Dây đeo']);
  const shortDescription = normalizeShortText(description);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {brandName && <StatusBadge tone="blue">{brandName}</StatusBadge>}
          <StatusBadge tone={inStock ? 'green' : 'red'}>
            {inStock ? 'Còn hàng' : 'Hết hàng'}
          </StatusBadge>
        </div>

        <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-[34px]">{name}</h1>

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
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
            <CheckCircle2 size={15} className={inStock ? 'text-emerald-500' : 'text-rose-500'} />
            Kho: {stock}
          </span>
        </div>
      </div>

      <div className="border-b border-slate-100 py-4">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">Giá bán</p>
        <div className="mt-2 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
          <p className="text-3xl font-bold tracking-tight text-blue-700 sm:text-4xl">{formatCurrency(price)}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Giá đã bao gồm VAT theo chính sách bán hàng.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
        <MetaRow label="Dòng sản phẩm" value={deviceType} />
        <MetaRow label="Danh mục" value={categoryName || 'Chưa phân loại'} />
        <MetaRow label="Bảo hành" value={warranty} />
        <MetaRow label="Vận chuyển" value={shipping} />
      </div>

      {(colors.length > 0 || sizes.length > 0) && (
        <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <OptionGroup label="Màu sắc" values={colors} />
          <OptionGroup label="Phiên bản" values={sizes} />
        </div>
      )}

      {shortDescription && (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {shortDescription}
        </p>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Gift size={18} className="text-blue-600" />
          Quyền lợi khi mua tại S-LIFE
        </div>
        <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2 sm:text-sm">
          <TrustItem icon={PackageCheck} title="Kiểm tra hàng khi nhận" />
          <TrustItem icon={Truck} title={shipping} />
          <TrustItem icon={ShieldCheck} title={warranty} />
          <TrustItem icon={CreditCard} title="COD hoặc thanh toán online" />
        </div>
      </div>

      <div className="mt-auto space-y-3 pt-4">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 sm:text-sm">
          <PackageCheck size={16} />
          Kiểm tra sản phẩm trước khi nhận hàng. Hỗ trợ đổi trả theo chính sách.
        </div>

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
            size="lg"
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
            size="lg"
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
            size="lg"
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
  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 sm:p-3">
    <span className="block text-[11px] font-medium text-slate-400 sm:text-xs">{label}</span>
    <span className="mt-1 block text-sm font-semibold text-slate-900">{value}</span>
  </div>
);

const OptionGroup = ({ label, values }) => {
  if (!values.length) return null;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value, index) => (
          <span
            key={`${label}-${value}-${index}`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
};

const TrustItem = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2">
    <Icon size={16} className="flex-shrink-0 text-blue-600" />
    <span className="font-medium">{title}</span>
  </div>
);

const parseSpecs = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const getOptionValues = (specs, keys) => {
  const raw = keys.map((key) => specs[key]).find(Boolean);
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean).slice(0, 6);

  return String(raw)
    .split(/[,/|;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
};

const normalizeShortText = (value) => {
  if (!value) return '';
  const noHtml = String(value).replace(/<[^>]+>/g, ' ');
  return noHtml.replace(/\s+/g, ' ').trim();
};

export default ProductInfo;
