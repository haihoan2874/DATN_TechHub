import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "../ui/Button";

function Hero() {
  const navigate = useNavigate();
  const containerRef = useRef();
  const titleRef = useRef();
  const imageRef = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from(".hero-content > *", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power4.out"
    })
    .from(imageRef.current, {
      x: 100,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    }, "-=0.5")
    .to(imageRef.current, {
      y: 15,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-center lg:text-left hero-content">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 font-bold text-xs mb-6 uppercase tracking-widest">
              <Sparkles size={14} />
              <span>New Arrival: Nexus Pro X</span>
            </div>
            
            <h1 ref={titleRef} className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
              NÂNG TẦM <br /> 
              <span className="text-blue-600">SỨC KHỎE</span>
            </h1>
            
            <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-[45ch]">
              Sở hữu ngay công nghệ theo dõi sức khỏe đỉnh cao. 
              Chính xác, tinh tế và luôn bên bạn mọi lúc mọi nơi.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button 
                onClick={() => navigate('/shop')}
                size="lg"
                icon={ShoppingBag}
                className="px-10 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-shadow"
              >
                Sắm ngay
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/about')}
                size="lg"
                className="px-10"
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div ref={imageRef} className="relative z-10">
              <img 
                src="/premium_health_watch_hero_1777260130733.png" 
                alt="Nexus Pro Watch" 
                className="w-full max-w-xl mx-auto drop-shadow-[0_50px_50px_rgba(37,99,235,0.15)] pointer-events-none" 
              />
            </div>
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/10 rounded-full blur-[120px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
