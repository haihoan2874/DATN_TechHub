import React, { useMemo } from 'react';

const ProductFeatures = ({ features }) => {
  const parsedFeatures = useMemo(() => {
    try {
      return typeof features === 'string' ? JSON.parse(features) : (features || []);
    } catch (e) {
      return [];
    }
  }, [features]);

  if (!parsedFeatures || parsedFeatures.length === 0) return null;

  return (
    <section className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
      {/* Header Shopee Style */}
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
        <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-tight">MÔ TẢ SẢN PHẨM</h3>
      </div>
      
      {/* Content Shopee Style */}
      <div className="p-8 space-y-10">
        {parsedFeatures.map((block, index) => (
          <div key={index} className="space-y-6">
            {block.title && (
              <h4 className="text-[16px] font-bold text-slate-900 leading-tight">
                {block.title}
              </h4>
            )}
            
            {block.description && (
              <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                {block.description}
              </p>
            )}

            {block.image && (
              <div className="rounded-xl overflow-hidden shadow-md">
                <img 
                  src={block.image} 
                  alt={block.title || 'Product detail'} 
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {block.items && block.items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {block.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-slate-900">{item.title}</p>
                      <p className="text-[12px] text-slate-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductFeatures;
