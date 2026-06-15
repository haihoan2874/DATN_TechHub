import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import {
  ArrowRight, Package, Search
} from 'lucide-react';
import { getCategoryIconComponent } from '../utils/categoryIcons';

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
    <div className="min-h-screen bg-transparent py-6 sm:py-8 lg:py-10">
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
  const IconComponent = getCategoryIconComponent(cat);

  return (
    <Link
      to={`/shop?category=${cat.slug || cat.id}`}
      className="group flex min-h-[210px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
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
    </Link>
  );
};

export default CategoryList;
