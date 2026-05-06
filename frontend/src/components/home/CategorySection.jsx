import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  {
    to: "/shop?category=dong-ho-the-thao",
    img: "/assets/categories/sports_watch.png",
    name: "Đồng hồ thể thao",
    count: "Hàng chục mẫu mới"
  },
  {
    to: "/shop?category=vong-theo-doi-suc-khoe",
    img: "/assets/categories/health_band.png",
    name: "Theo dõi sức khỏe",
    count: "Tinh tế & Nhẹ nhàng"
  },
  {
    to: "/shop?category=tai-nghe-bluetooth",
    img: "/assets/categories/earbuds.png",
    name: "Tai nghe Bluetooth",
    count: "Âm thanh đỉnh cao"
  },
  {
    to: "/shop?category=phu-kien-dong-ho",
    img: "/assets/categories/straps.png",
    name: "Phụ kiện cao cấp",
    count: "Cá nhân hóa phong cách"
  }
];

function CategorySection() {
  const sectionRef = useRef();

  useGSAP(() => {
    gsap.fromTo(".category-card", 
      { y: 60, opacity: 0 },
      {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        clearProps: "all"
      }
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-16 bg-slate-50/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <CategoryCard key={idx} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ to, img, name, count }) {
  return (
    <Link 
      to={to} 
      className="category-card group relative overflow-hidden rounded-[32px] bg-white p-8 border border-slate-100 hover:border-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-500/10 text-center"
    >
      <div className="w-24 h-24 mx-auto mb-6 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        <img src={img} alt={name} className="w-16 h-16 object-contain" />
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">{name}</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{count}</p>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
        <ArrowRight size={20} />
      </div>
    </Link>
  );
}

export default CategorySection;
