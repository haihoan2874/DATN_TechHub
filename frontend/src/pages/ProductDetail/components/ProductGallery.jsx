import React from 'react';

const ProductGallery = ({ images, activeImage, setActiveImage, productName }) => {
  const displayImages = images.length > 0 ? images : ['/logo_final.png'];

  return (
    <div className="space-y-4">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <img
          src={displayImages[activeImage] || displayImages[0]}
          alt={productName}
          className="h-full w-full object-contain"
        />
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {displayImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-white p-2 transition-colors ${
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
