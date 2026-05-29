import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import {
  ArrowRight, Watch, Cable, Activity, Tag, Package, Search
} from 'lucide-react';

const ICON_MAP = {
  Watch: Watch,
  Cable: Cable,
  Activity: Activity,
  Tag: Tag,
};

const CATEGORY_IMAGES = {
  'Đồng hồ thể thao': '/assets/categories/sports_watch.png',
  'Phụ kiện đồng hồ': '/assets/categories/straps.png',
  'Tai nghe Bluetooth': '/assets/categories/earbuds.png',
  'Vòng theo dõi sức khỏe': '/assets/categories/health_band.png',
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
          productService.getAllProducts({ pageSize: 100 }),
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

  const totalProducts = useMemo(
    () => Object.values(productCounts).reduce((sum, count) => sum + count, 0),
    [productCounts]
  );

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-10">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>Trang chủ</span>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900">Danh mục</span>
        </div>

        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
              Danh mục sản phẩm
            </h1>
            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              Chọn nhóm thiết bị phù hợp rồi chuyển thẳng sang cửa hàng với bộ lọc đã áp dụng.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
            {loading ? 'Đang tải danh mục...' : `${categories.length} danh mục, ${totalProducts} sản phẩm`}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-24 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-950">Chưa có danh mục</h3>
            <p className="text-sm text-slate-500">Hiện chưa có nhóm sản phẩm phù hợp để hiển thị.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                productCount={productCounts[cat.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryCard = ({ cat, productCount }) => {
  const IconComponent = ICON_MAP[cat.icon] || Tag;
  const bgImage = CATEGORY_IMAGES[cat.name] || null;

  return (
    <Link
      to={`/shop?category=${cat.slug || cat.id}`}
      className="group grid min-h-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
    >
      <div className="grid h-full grid-cols-[1fr_120px] sm:grid-cols-[1fr_140px]">
        <div className="flex flex-col p-4 sm:p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <IconComponent size={22} />
          </div>

          <h3 className="mb-2 text-lg font-bold leading-tight text-slate-950 transition-colors group-hover:text-blue-700">
            {cat.name}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">
            {cat.description || `Khám phá bộ sưu tập ${cat.name} tại S-LIFE.`}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500">
              <Package size={14} className="text-blue-600" />
              {productCount} sản phẩm
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
              Xem <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-slate-50 p-4">
          {bgImage ? (
            <img
              src={bgImage}
              alt={cat.name}
              className="h-24 w-24 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-28 sm:w-28"
              loading="lazy"
            />
          ) : (
            <IconComponent size={72} className="text-slate-200" />
          )}
        </div>
      </div>
    </Link>
  );
};

export default CategoryList;
