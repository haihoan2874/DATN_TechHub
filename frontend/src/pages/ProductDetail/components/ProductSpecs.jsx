import React, { useMemo } from 'react';

const ProductSpecs = ({ specs }) => {
  const flatSpecs = useMemo(() => {
    let parsed = {};
    try {
      parsed = typeof specs === 'string' ? JSON.parse(specs) : specs || {};
    } catch (e) {
      parsed = {};
    }
    
    // If it's the grouped format, flatten it for the Shopee style
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
    <section className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
      {/* Header Shopee Style */}
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
        <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-tight">CHI TIẾT SẢN PHẨM</h3>
      </div>
      
      {/* Specs List */}
      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(flatSpecs).map(([key, value], i) => (
            <div key={i} className="flex text-[14px] leading-relaxed">
              <span className="w-1/4 text-slate-500 font-medium">{key}</span>
              <span className="flex-1 text-slate-900 font-semibold pl-4">
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
