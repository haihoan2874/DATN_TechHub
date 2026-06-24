import React from 'react';
import { resolveApiAssetUrl } from '../../../config/api';

const ProductGallery = ({ images, activeImage, setActiveImage, productName }) => {
  const displayImages = images.length > 0 ? images : ['/logo_final.png'];
  const hasGallery = displayImages.length > 1;

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Main Image */}
      <div className="relative flex h-[320px] sm:h-[400px] xl:h-[450px] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 sm:p-4">
        <img
          src={resolveApiAssetUrl(displayImages[activeImage] || displayImages[0])}
          alt={productName}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-opacity duration-300"
        />

        {hasGallery && (
          <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">
            {activeImage + 1}/{displayImages.length}
          </span>
        )}
      </div>

      {/* Thumbnails (Horizontal at the bottom) */}
      {hasGallery && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {displayImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`h-16 w-16 sm:h-[72px] sm:w-[72px] flex-shrink-0 overflow-hidden rounded-xl border bg-white p-1.5 transition-all ${
                activeImage === index ? 'border-slate-900 ring-1 ring-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100'
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
    </div>
  );
};

export default ProductGallery;
