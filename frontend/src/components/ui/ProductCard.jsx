import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ArrowRight, Check, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

import { useLocation, useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { name, price, imageUrl, slug, stockQuantity } = product;
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    const result = addToCart(product);
    if (!result.success) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="glass-card group overflow-hidden flex flex-col h-full bg-white border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 rounded-[32px]">
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden p-6 bg-slate-50/50">
        <img 
          src={imageUrl || 'https://via.placeholder.com/400'} 
          alt={name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-colors">
            <Heart size={18} />
          </button>
        </div>

        {/* Badge */}
        {stockQuantity <= 5 && stockQuantity > 0 && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
            Sắp hết hàng
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
          ))}
          <span className="text-[10px] text-slate-400 font-bold ml-1">(4.8)</span>
        </div>

        <Link to={`/product/${slug}`} className="block group/title">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-2 group-hover/title:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium line-through">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 1.2)}
            </span>
            <span className="text-xl font-black text-primary">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
            </span>
          </div>

          <button 
            onClick={handleQuickAdd}
            disabled={added}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${
              added 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-blue-600'
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
