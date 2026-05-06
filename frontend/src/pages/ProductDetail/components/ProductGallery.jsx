import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const ProductGallery = ({ images, activeImage, setActiveImage, productName }) => {
  const containerRef = useRef(null);
  const mainImageRef = useRef(null);

  useGSAP(() => {
    // Entrance animation
    gsap.from(containerRef.current, {
      opacity: 0,
      x: -50,
      duration: 1,
      ease: "power3.out"
    });

    // Floating animation for main image
    gsap.to(mainImageRef.current, {
      y: -15,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Main Image Stage */}
      <div className="relative aspect-square rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center p-12 group cursor-crosshair overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <img 
          ref={mainImageRef}
          src={images[activeImage]} 
          alt={productName} 
          className="w-full h-full object-contain z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Badges */}
        <div className="absolute top-8 left-8 flex flex-col gap-2 z-20">
          <span className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-sm">Official Store</span>
          <span className="px-3 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-sm">Freeship</span>
        </div>
      </div>
      
      {/* Thumbnails */}
      <div className="flex gap-4 justify-center">
        {images.map((img, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={`w-20 h-20 rounded-xl border-2 transition-all p-2 overflow-hidden bg-white ${
              activeImage === idx 
                ? 'border-black ring-4 ring-slate-100' 
                : 'border-slate-100 hover:border-slate-300'
            }`}
          >
            <img src={img} alt={`${productName} thumbnail ${idx}`} className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
