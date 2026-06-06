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
    <div className="flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-200 sm:flex-col">
      <div className="relative h-32 w-32 shrink-0 overflow-hidden bg-slate-50 p-3 sm:aspect-square sm:h-auto sm:w-full sm:p-4">
        <img 
          src={resolveApiAssetUrl(imageUrl)}
          alt={name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
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
	          <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-950 hover:text-blue-700 sm:text-base">
            {name}
          </h3>
        </Link>

	        <div className="mt-auto flex items-end justify-between gap-2 pt-2 sm:pt-3">
	          <div className="min-w-0 flex flex-col">
	            <span className="text-sm font-bold text-blue-700 sm:text-lg">
              {formatCurrency(price)}
            </span>
          </div>

          <button 
            type="button"
            aria-label={`Thêm ${name} vào giỏ hàng`}
            onClick={handleQuickAdd}
            disabled={added || !inStock}
	            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-10 sm:w-10 ${
              added 
                ? 'bg-emerald-500 text-white'
                : inStock
                  ? 'bg-slate-900 text-white hover:bg-blue-700'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400'
            }`}
          >
            {added ? <Check size={20} /> : <ShoppingCart size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
