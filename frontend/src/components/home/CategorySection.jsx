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
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2.5 text-[13px] font-bold uppercase tracking-widest text-blue-600">Danh mục nổi bật</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-[34px]">Mua theo nhu cầu</h2>
          </div>
          <Link to="/categories" className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600">
            Xem tất cả <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
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
      className="category-card group flex min-h-[140px] sm:min-h-[190px] flex-col justify-between rounded-2xl border border-slate-200/60 bg-white p-3.5 sm:p-5 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1"
    >
      <div>
        <div className="mb-2 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
          <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <h3 className="mb-1 sm:mb-2 text-[14px] sm:text-[17px] font-bold text-slate-900 leading-snug">{category.name}</h3>
        <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-slate-500 hidden sm:block">
          {category.description || "Nhóm sản phẩm S-LIFE"}
        </p>
      </div>
      <div className="mt-2 sm:mt-auto flex items-center justify-between border-t border-slate-100 pt-2 sm:pt-4 text-[11px] sm:text-[13px] font-bold text-slate-400 transition-colors group-hover:text-blue-600">
        <span>Khám phá</span>
        <ArrowRight size={14} className="sm:w-[18px] sm:h-[18px] transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default CategorySection;
