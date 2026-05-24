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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <h3 className="text-lg font-bold text-slate-900">Mô tả sản phẩm</h3>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        {parsedFeatures.map((block, index) => (
          <div key={index} className="space-y-4">
            {block.title && (
              <h4 className="text-base font-bold leading-tight text-slate-900">
                {block.title}
              </h4>
            )}
            
            {block.description && (
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {block.description}
              </p>
            )}

            {block.image && (
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <img 
                  src={block.image} 
                  alt={block.title || 'Product detail'} 
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {block.items && block.items.length > 0 && (
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                {block.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.description}</p>
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
