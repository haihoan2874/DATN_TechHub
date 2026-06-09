import React from 'react';
import { resolveApiAssetUrl } from '../../../config/api';

const ProductGallery = ({ images, activeImage, setActiveImage, productName }) => {
  const displayImages = images.length > 0 ? images : ['/logo_final.png'];
  const hasGallery = displayImages.length > 1;

  return (
    <div className={`grid gap-3 ${hasGallery ? 'sm:grid-cols-[72px_1fr]' : ''}`}>
      {hasGallery && (
        <div className="order-2 flex gap-2 overflow-x-auto no-scrollbar sm:order-1 sm:max-h-[430px] sm:flex-col sm:overflow-y-auto">
          {displayImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border bg-white p-2 transition-colors ${
                activeImage === index ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
              }`}
              aria-label={`Xem ảnh sản phẩm ${index + 1}`}
            >
              <img
                src={resolveApiAssetUrl(image)}
                alt={`${productName} ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      <div className="order-1 sm:order-2">
        <div className="relative flex aspect-square max-h-[430px] min-h-[260px] items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-6">
          <img
            src={resolveApiAssetUrl(displayImages[activeImage] || displayImages[0])}
            alt={productName}
            fetchPriority="high"
            decoding="async"
            className="max-h-full max-w-full object-contain"
          />

          {hasGallery && (
            <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">
              {activeImage + 1}/{displayImages.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
