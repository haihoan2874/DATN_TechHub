import React, { useState } from 'react';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

import { useLocation, useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { name, price, imageUrl, slug, stockQuantity } = product;
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-200">
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-5">
        <img 
          src={imageUrl || 'https://via.placeholder.com/400'} 
          alt={name}
          className="h-full w-full object-contain"
        />
        {stockQuantity <= 5 && stockQuantity > 0 && (
          <div className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
            Sắp hết hàng
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col p-5">
        <div className="mb-2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
          ))}
          <span className="ml-1 text-xs font-semibold text-slate-400">(4.8)</span>
        </div>

        <Link to={`/product/${slug}`} className="block">
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-slate-950 hover:text-blue-700">
            {name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400 line-through">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 1.2)}
            </span>
            <span className="text-lg font-bold text-blue-700">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
            </span>
          </div>

          <button 
            onClick={handleQuickAdd}
            disabled={added}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
              added 
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-900 text-white hover:bg-blue-700'
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
