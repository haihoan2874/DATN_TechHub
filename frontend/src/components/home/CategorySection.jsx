import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getCategoryIconComponent } from "../../utils/categoryIcons";

function CategorySection({ categories = [] }) {
  const visibleCategories = categories.filter((cat) => cat.isActive !== false).slice(0, 8);
  if (!visibleCategories.length) return null;

  return (
    <section className="bg-slate-50 py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Danh mục nổi bật</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">Mua theo nhu cầu</h2>
          </div>
          <Link to="/categories" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-700">
            Xem tất cả danh mục <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {visibleCategories.map((cat) => (
            <CategoryCard key={cat.id || cat.slug} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category }) {
  const Icon = getCategoryIconComponent(category);

  return (
    <Link 
      to={`/shop?category=${category.slug || category.id}`}
      className="category-card group flex min-h-[190px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon size={20} />
      </div>
      <h3 className="mb-1 text-base font-bold text-slate-950">{category.name}</h3>
      <p className="line-clamp-3 text-sm leading-5 text-slate-500">
        {category.description || "Nhóm sản phẩm S-LIFE"}
      </p>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-bold text-blue-700">
        <span>Khám phá</span>
        <ArrowRight size={18} />
      </div>
    </Link>
  );
}

export default CategorySection;
