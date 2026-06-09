import React, { useMemo } from 'react';

const ProductSpecs = ({ specs }) => {
  const flatSpecs = useMemo(() => {
    let parsed = {};
    try {
      parsed = typeof specs === 'string' ? JSON.parse(specs) : specs || {};
    } catch (e) {
      parsed = {};
    }
    
    const isCategorized = Object.values(parsed).some(val => typeof val === 'object' && val !== null && !Array.isArray(val));
    
    if (isCategorized) {
      const flattened = {};
      Object.entries(parsed).forEach(([group, items]) => {
        if (typeof items === 'object' && items !== null && !Array.isArray(items)) {
          Object.entries(items).forEach(([k, v]) => {
            flattened[`${group} - ${k}`] = v;
          });
        } else {
          flattened[group] = items;
        }
      });
      return filterDisplaySpecs(flattened);
    }
    
    return filterDisplaySpecs(parsed);
  }, [specs]);

  if (!Object.keys(flatSpecs).length) return null;

  return (
    <section id="product-specs" className="h-fit scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-28">
      <div className="border-b border-slate-100 bg-slate-950 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-blue-500" />
          <div>
            <h2 className="text-lg font-bold">Thông số kỹ thuật</h2>
            <p className="mt-1 text-xs font-medium text-slate-300">Các thông tin chính để đối chiếu khi chọn mua</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          {Object.entries(flatSpecs).map(([key, value], i) => (
            <div key={i} className="grid gap-1 border-b border-slate-100 text-sm leading-relaxed last:border-b-0 sm:grid-cols-[130px_1fr]">
              <span className="bg-slate-50 px-3 py-3 font-medium text-slate-500">{key}</span>
              <span className="px-3 py-3 font-semibold text-slate-950">
                {typeof value === 'string' && value.startsWith('http') ? (
                   <img src={value} alt={key} className="max-w-[100px] rounded-lg border" />
                ) : (
                  String(value)
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HIDDEN_SPEC_KEYWORDS = [
  'nguồn',
  'source',
  'url',
  'link',
  'image',
  'ảnh',
  'thumbnail'
];

const filterDisplaySpecs = (specs) => Object.fromEntries(
  Object.entries(specs || {}).filter(([key, value]) => {
    const normalizedKey = String(key).toLowerCase();
    if (HIDDEN_SPEC_KEYWORDS.some((keyword) => normalizedKey.includes(keyword))) {
      return false;
    }

    if (value === null || value === undefined || value === '') {
      return false;
    }

    return true;
  })
);

export default ProductSpecs;
