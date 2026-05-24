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
      return flattened;
    }
    
    return parsed;
  }, [specs]);

  if (!Object.keys(flatSpecs).length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <h3 className="text-lg font-bold text-slate-900">Chi tiết sản phẩm</h3>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(flatSpecs).map(([key, value], i) => (
            <div key={i} className="grid gap-1 text-sm leading-relaxed sm:grid-cols-[220px_1fr]">
              <span className="font-medium text-slate-500">{key}</span>
              <span className="font-semibold text-slate-900">
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

export default ProductSpecs;
