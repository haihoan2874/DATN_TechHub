import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "../ui/ProductCard";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function FeaturedSection({ products, loading }) {
  const sectionRef = useRef();

  useGSAP(() => {
    let anim;
    if (!loading && products.length > 0) {
      anim = gsap.fromTo(".featured-card", 
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          },
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all"
        }
      );
    }
    return () => { if (anim) anim.revert(); };
  }, { scope: sectionRef, dependencies: [loading, products] });

  return (
    <section ref={sectionRef} className="bg-slate-50 py-10 lg:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end lg:mb-8">
          <div>
            <p className="mb-2.5 text-[13px] font-bold uppercase tracking-widest text-blue-600">Sản phẩm nổi bật</p>
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[34px]">Được quan tâm nhiều</h2>
            <p className="text-base leading-relaxed text-slate-500">Những thiết bị được khách hàng tin dùng nhất tuần qua.</p>
          </div>
          <Link to="/shop" className="group flex items-center gap-2 text-blue-600 font-bold transition-colors hover:text-blue-700">
            <span className="relative pb-1">
              Xem tất cả
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </span>
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:gap-4">
          {loading ? (
             [...Array(4)].map((_, i) => (
               <div key={i} className="h-[340px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
             ))
          ) : (
            products.map(product => (
              <div key={product.id} className="featured-card">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default FeaturedSection;
