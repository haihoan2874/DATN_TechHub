import React, { useState } from 'react';
import { Grid, ChevronDown, Check, Watch, Headphones, Tag, Activity, Smartphone } from 'lucide-react';

export const PRICE_RANGES = [
  { key: 'under-1m', label: 'Dưới 1 triệu', min: 0, max: 1_000_000 },
  { key: '1m-3m', label: '1 - 3 triệu', min: 1_000_000, max: 3_000_000 },
  { key: '3m-5m', label: '3 - 5 triệu', min: 3_000_000, max: 5_000_000 },
  { key: '5m-10m', label: '5 - 10 triệu', min: 5_000_000, max: 10_000_000 },
  { key: 'over-10m', label: 'Trên 10 triệu', min: 10_000_000, max: Infinity },
];

const FilterSection = ({ title, children, isOpen = true }) => {
  const [open, setOpen] = useState(isOpen);
  return (
    <div className="border-b border-slate-200 pb-5 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center mb-4 group"
      >
        <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider">
          {title}
        </h4>
        <ChevronDown size={18} className={`text-slate-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

const FilterItem = ({ label, active, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-sm font-bold transition-all ${
      active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-white hover:text-slate-900'
    }`}
  >
    {icon}
    {label}
  </button>
);

const getCategoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('đồng hồ')) return <Watch size={18} />;
  if (n.includes('tai nghe')) return <Headphones size={18} />;
  if (n.includes('phụ kiện')) return <Tag size={18} />;
  if (n.includes('sức khỏe')) return <Activity size={18} />;
  return <Smartphone size={18} />;
};

const ShopSidebar = ({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedPriceRange,
  setSelectedPriceRange,
  searchKeyword,
  setCurrentPage,
  setIsConfirmClearOpen
}) => {
  return (
    <div className="space-y-5">
      <FilterSection title="LỌC NHANH" isOpen={true}>
         <div className="flex flex-col gap-1">
            <FilterItem
              label="Tất cả sản phẩm"
              active={!selectedCategory && !selectedBrand && !selectedPriceRange && !searchKeyword}
              onClick={() => {
                if (selectedCategory || selectedBrand || selectedPriceRange || searchKeyword) {
                  setIsConfirmClearOpen(true);
                }
              }}
              icon={<Grid size={16} />}
            />
         </div>
      </FilterSection>

      <FilterSection title="HÃNG SẢN XUẤT">
        <div className="grid grid-cols-2 gap-2">
          {brands.map(brand => (
            <button
              type="button"
              key={brand.id}
              onClick={() => {
                setSelectedBrand(brand.id === selectedBrand ? null : brand.id);
                setCurrentPage(0);
              }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left truncate ${
                selectedBrand === brand.id
                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="DANH MỤC">
        <div className="flex flex-col gap-2">
          {categories.map(cat => (
            <button
              type="button"
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                setCurrentPage(0);
              }}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                selectedCategory === cat.id
                ? 'bg-primary/5 border-primary text-primary'
                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">{cat.name}</span>
              </div>
              <ChevronDown size={14} className={selectedCategory === cat.id ? 'text-primary' : 'text-slate-300'} />
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="GIÁ BÁN">
        <div className="flex flex-col gap-2">
          {PRICE_RANGES.map((range, index) => (
            <button
              type="button"
              key={index}
              onClick={() => {
                setSelectedPriceRange(selectedPriceRange === range ? null : range);
                setCurrentPage(0);
              }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                selectedPriceRange === range
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedPriceRange === range ? 'border-white bg-primary' : 'border-slate-200 bg-white'
              }`}>
                {selectedPriceRange === range && <Check size={10} strokeWidth={4} />}
              </div>
              <span className="text-sm font-bold">{range.label}</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default React.memo(ShopSidebar);
