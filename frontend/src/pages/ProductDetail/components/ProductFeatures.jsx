import React, { useMemo } from 'react';
import { resolveApiAssetUrl } from '../../../config/api';

const ProductFeatures = ({ features, description }) => {
  const parsedFeatures = useMemo(() => {
    try {
      const parsed = typeof features === 'string' ? JSON.parse(features) : (features || []);
      return Array.isArray(parsed) ? parsed.filter((block) => block?.type !== 'gallery') : [];
    } catch (e) {
      return [];
    }
  }, [features]);

  if ((!parsedFeatures || parsedFeatures.length === 0) && !description) return null;

  return (
    <section id="product-description" className="scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Mô tả sản phẩm</h2>
        </div>
      </div>

      <div className="space-y-8 p-5 sm:p-7">
        {parsedFeatures.length === 0 && description ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">
            {description}
          </p>
        ) : parsedFeatures.map((block, index) => (
          <div key={index} className="space-y-4">
            {block.title && (
              <h3 className="text-lg font-bold leading-tight text-slate-950">
                {block.title}
              </h3>
            )}
            
            {block.description && (
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">
                {block.description}
              </p>
            )}

            {block.image && (
              <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                <img 
                  src={resolveApiAssetUrl(block.image)}
                  alt={block.title || 'Product detail'} 
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full object-cover"
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
