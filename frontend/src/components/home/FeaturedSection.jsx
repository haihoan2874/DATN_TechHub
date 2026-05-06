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
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">SẢN PHẨM NỔI BẬT</h2>
            <p className="text-slate-500 font-medium text-lg">Những thiết bị được khách hàng tin dùng nhất tuần qua.</p>
          </div>
          <Link to="/shop" className="group flex items-center gap-2 text-blue-600 font-bold">
            <span className="relative">
              Xem tất cả
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
             [...Array(4)].map((_, i) => (
               <div key={i} className="h-[450px] bg-slate-50 animate-pulse rounded-[40px] border border-slate-100" />
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
