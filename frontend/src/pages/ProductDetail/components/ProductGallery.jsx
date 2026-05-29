import React from 'react';

const ProductGallery = ({ images, activeImage, setActiveImage, productName }) => {
  const displayImages = images.length > 0 ? images : ['/logo_final.png'];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-3 sm:h-[360px] sm:p-5 lg:h-[420px]">
        <img
          src={displayImages[activeImage] || displayImages[0]}
          alt={productName}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {displayImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border bg-white p-2 transition-colors sm:h-16 sm:w-16 ${
                activeImage === index ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
              }`}
              aria-label={`Xem ảnh sản phẩm ${index + 1}`}
            >
              <img src={image} alt={`${productName} ${index + 1}`} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
