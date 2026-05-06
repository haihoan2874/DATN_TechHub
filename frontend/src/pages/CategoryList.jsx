import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import productService from '../services/productService';
import { 
  ArrowRight, Watch, Cable, Activity, Tag, 
  TrendingUp, Star, Zap, Package
} from 'lucide-react';

const ICON_MAP = {
  Watch: Watch,
  Cable: Cable,
  Activity: Activity,
  Tag: Tag,
};

const CATEGORY_IMAGES = {
  'Đồng hồ thể thao': 'https://us.amazfit.com/cdn/shop/files/P1_T-Rex3_GalleryBox_1080x1080_b62d7718-34a8-4ac5-91a4-40f8a4b65a0a.jpg?v=1726188376&width=600',
  'Phụ kiện đồng hồ': 'https://us.amazfit.com/cdn/shop/files/1_0baf00ac-6787-491a-bb65-6acd2c513584.jpg?v=1770281557&width=600',
  'Vòng theo dõi sức khỏe': 'https://us.amazfit.com/cdn/shop/files/AmazfitUp_BeautyShot_1500x1500_bf182eec-1cb6-4902-b113-5d8e5f40ee8c.jpg?v=1729104083&width=600',
};

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          productService.getCategories(),
          productService.getAllProducts({ size: 100 }),
        ]);
        const cats = catRes?.contents || catRes || [];
        setCategories(cats);

        const prods = prodRes?.contents || [];
        const counts = {};
        prods.forEach(p => {
          const cid = p.categoryId;
          counts[cid] = (counts[cid] || 0) + 1;
        });
        setProductCounts(counts);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen pt-24 lg:pt-32 pb-24 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-12 lg:mb-16">
          <h1 className="text-3xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">DANH MỤC SẢN PHẨM</h1>
          <p className="text-slate-500 text-base lg:text-lg font-medium">Duyệt qua các bộ sưu tập thiết bị chăm sóc sức khỏe theo nhu cầu của bạn.</p>
        </div>

        {/* Featured Badges */}
        <div className="flex flex-wrap gap-4 mb-12">
           <Badge icon={<TrendingUp size={14} />} text="Bán chạy nhất" color="blue" />
           <Badge icon={<Star size={14} />} text="Đánh giá cao" color="amber" />
           <Badge icon={<Zap size={14} />} text="Công nghệ mới" color="emerald" />
        </div>

        {/* Category Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {categories.map((cat) => (
              <CategoryCard 
                key={cat.id} 
                cat={cat} 
                variants={item}
                productCount={productCounts[cat.id] || 0}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const CategoryCard = ({ cat, variants, productCount }) => {
  const IconComponent = ICON_MAP[cat.icon] || Tag;
  const bgImage = CATEGORY_IMAGES[cat.name] || null;

  return (
    <motion.div variants={variants}>
      <Link 
        to={`/shop?category=${cat.id}`}
        className="group block relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
      >
        {/* Product Image Area */}
        <div className="relative h-56 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden flex items-center justify-center">
          {bgImage ? (
            <img 
              src={bgImage} 
              alt={cat.name}
              className="w-48 h-48 object-contain group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <IconComponent size={80} className="text-slate-200" />
          )}
          
          {/* Product Count Badge */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
            <Package size={14} className="text-primary" />
            <span className="text-xs font-bold text-slate-700">{productCount} sản phẩm</span>
          </div>

          {/* Icon Badge */}
          <div className="absolute bottom-4 left-4 w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <IconComponent size={22} className="text-primary group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-5">
          <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">
            {cat.name}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-5">
            {cat.description || `Khám phá bộ sưu tập ${cat.name} tại S-Life.`}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
              Khám phá <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Badge = ({ icon, text, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${colors[color]}`}>
      {icon}
      {text}
    </div>
  );
};

export default CategoryList;
