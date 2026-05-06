import React from 'react';
import { ShoppingCart, Star, Zap, Minus, Plus, ShieldCheck, Watch, Activity, Battery } from 'lucide-react';
import Button from '../../../components/ui/Button';

const ProductInfo = ({ product, quantity, setQuantity, onAddToCart }) => {
  const { name, price, description, brandName, stockQuantity } = product;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-10">
      {/* Brand & Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-sm">
          {brandName || 'S-LIFE'} AUTHORIZED
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight italic uppercase">
          {name}
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Star size={18} fill="currentColor" />
            <span className="text-sm font-black text-slate-900 ml-1">
              {Number(product.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
              ({product.reviewCount || 0} Reviews)
            </span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Còn hàng
          </span>
        </div>
      </div>

      {/* Pricing & Quick Specs */}
      <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-8">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Giá niêm yết</span>
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">
              {formatCurrency(price)}
            </span>
            <span className="text-base font-bold text-slate-300 line-through decoration-slate-400/50">
              {formatCurrency(price * 1.2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <QuickSpec icon={<Watch size={18}/>} label="Thiết kế" value="Premium Tech" />
          <QuickSpec icon={<Activity size={18}/>} label="Cảm biến" value="Bio-Tracking" />
          <QuickSpec icon={<Battery size={18}/>} label="Dung lượng Pin" value="14 - 20 Ngày" />
          <QuickSpec icon={<ShieldCheck size={18}/>} label="Bảo hành" value="24 Tháng" />
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-lg leading-relaxed font-medium">
        {description || "Trải nghiệm đỉnh cao công nghệ cùng S-LIFE. Sản phẩm mang lại sự kết hợp hoàn hảo giữa hiệu năng mạnh mẽ và thiết kế thời thượng."}
      </p>

      {/* Actions */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-white rounded-2xl p-1 border border-slate-200 shadow-sm">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-4 text-slate-400 hover:text-black transition-colors"
            >
              <Minus size={18} />
            </button>
            <input 
              type="text" 
              value={quantity} 
              readOnly 
              className="w-12 text-center font-black text-lg bg-transparent text-slate-900" 
            />
            <button 
              onClick={() => setQuantity(Math.min(stockQuantity || 99, quantity + 1))}
              className="p-4 text-slate-400 hover:text-black transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-end mb-2 px-1">
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Sẵn có: {stockQuantity}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Limit: 5/User</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black transition-all duration-1000" 
                style={{ width: `${Math.min((stockQuantity / 100) * 100, 100)}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="secondary"
            className="flex-[1.5] h-16 rounded-2xl border-2 border-slate-900 font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-300"
            onClick={onAddToCart}
            icon={ShoppingCart}
          >
            Thêm vào giỏ
          </Button>
          <Button 
            className="flex-1 h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-black transition-all duration-300 shadow-xl shadow-slate-900/20"
            icon={Zap}
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

const QuickSpec = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200/50 flex items-center gap-3 group hover:border-slate-900 transition-colors duration-300">
    <div className="text-slate-400 group-hover:text-black transition-colors">{icon}</div>
    <div className="space-y-0.5">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <p className="text-[11px] font-bold text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

export default ProductInfo;
