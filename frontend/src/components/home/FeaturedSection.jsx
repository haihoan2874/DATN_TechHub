import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "../ui/ProductCard";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function FeaturedSection({ products, loading }) {
  const sectionRef = useRef();

  useGSAP(() => {
    if (!loading && products.length > 0) {
      gsap.fromTo(".featured-card", 
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
  }, { scope: sectionRef, dependencies: [loading, products] });

  return (
    <section ref={sectionRef} className="bg-slate-50 py-10 lg:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Sản phẩm nổi bật</p>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">Được quan tâm nhiều</h2>
            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">Những thiết bị được khách hàng tin dùng nhất tuần qua.</p>
          </div>
          <Link to="/shop" className="group flex items-center gap-2 text-blue-600 font-bold">
            <span className="relative">
              Xem tất cả
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
