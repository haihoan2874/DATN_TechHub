import React, { useState } from 'react';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { resolveApiAssetUrl } from '../../config/api';
import { formatCurrency } from '../../utils/formatters';

const ProductCard = ({ product }) => {
  const { name, price, imageUrl, slug, stockQuantity } = product;
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const rating = Number(product.averageRating ?? product.avgRating ?? product.rating ?? 5);
  const reviewCount = product.reviewCount ?? product.totalReviews ?? product.reviewsCount ?? 0;
  const inStock = stockQuantity === undefined || stockQuantity > 0;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    const result = await addToCart(product);
    if (!result.success) {
      if (result.authRequired) {
        navigate('/login', { state: { from: location } });
      } else {
        toast.error(result.message);
      }
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group flex h-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:flex-col">
      <div className="relative h-32 w-32 shrink-0 overflow-hidden bg-slate-50 p-3 sm:aspect-square sm:h-auto sm:w-full sm:p-4">
        <img 
          src={resolveApiAssetUrl(imageUrl)}
          alt={name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {stockQuantity <= 5 && stockQuantity > 0 && (
          <div className="absolute left-3 top-3 hidden rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white sm:block">
            Sắp hết hàng
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-grow flex-col p-3 sm:p-4">
        <div className="mb-1.5 flex items-center gap-0.5 sm:gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={11}
              className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
            />
          ))}
          <span className="ml-1 text-xs font-semibold text-slate-400">
            ({reviewCount})
          </span>
        </div>

        <Link to={`/product/${slug}`} className="block">
          <h3 className="mb-2 line-clamp-2 text-[15px] font-bold leading-snug text-slate-900 transition-colors hover:text-blue-600 sm:text-[17px]">
            {name}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3 sm:pt-4">
          <div className="flex min-w-0 flex-col">
            <span className="text-[15px] font-bold text-slate-900 sm:text-lg">
              {formatCurrency(price)}
            </span>
          </div>

          <button 
            type="button"
            aria-label={`Thêm ${name} vào giỏ hàng`}
            onClick={handleQuickAdd}
            disabled={added || !inStock}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:h-11 sm:w-11 ${
              added 
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : inStock
                  ? 'bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/30 active:scale-95'
                  : 'cursor-not-allowed bg-slate-100 text-slate-400'
            }`}
          >
            {added ? <Check size={18} strokeWidth={2.5} /> : <ShoppingCart size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
