import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const RelatedProducts = ({ products }) => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    if (products.length === 0) return;

    gsap.from('.product-card', {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "expo.out"
    });
  }, { scope: sectionRef, dependencies: [products] });

  if (products.length === 0) return null;

  return (
    <section ref={sectionRef} className="space-y-12 py-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Sản phẩm tương tự</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đề xuất dựa trên danh mục bạn quan tâm</p>
        </div>
        <Link 
          to="/shop" 
          className="group flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-900 hover:text-blue-600 transition-colors"
        >
          Xem tất cả <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
        {products.map(product => (
          <RelatedCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

const RelatedCard = ({ product }) => (
  <Link 
    to={`/product/${product.slug}`} 
    className="product-card group block space-y-5"
  >
    <div className="relative aspect-square bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 flex items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-full object-contain z-10 group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-lg" 
      />
      
      {/* Quick View Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
        <span className="px-5 py-2.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-2xl">
          Chi tiết
        </span>
      </div>
    </div>

    <div className="space-y-2 px-2">
      <div className="flex justify-between items-start gap-4">
        <h4 className="font-black text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors uppercase italic">
          {product.name}
        </h4>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">New</span>
      </div>
      <p className="text-slate-900 font-black text-sm tracking-tight italic">
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
      </p>
    </div>
  </Link>
);

export default RelatedProducts;
