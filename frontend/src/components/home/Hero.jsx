import React, { useRef } from "react";
import { Activity, CheckCircle2, ShieldCheck, ShoppingBag, Star, Truck, Watch } from "lucide-react";
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
    <section ref={containerRef} className="relative overflow-hidden py-10 sm:py-14 lg:py-20">
      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <div className="hero-content text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-blue-700">
              <Activity size={16} />
              <span>Thiết bị sức khỏe thông minh</span>
            </div>

            <h1 ref={titleRef} className="mb-5 text-[40px] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[64px]">
              NÂNG TẦM <br />
              <span className="text-blue-600">SỨC KHỎE</span>
            </h1>

            <p className="mx-auto mb-8 max-w-[48ch] text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
              Sở hữu ngay công nghệ theo dõi sức khỏe đỉnh cao.
              Chính xác, tinh tế và luôn bên bạn mọi lúc mọi nơi.
            </p>

            <div className="mb-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button
                onClick={() => navigate('/shop')}
                size="lg"
                icon={ShoppingBag}
                className="px-6 shadow-lg shadow-blue-600/15 transition-shadow hover:shadow-blue-600/30 sm:px-8"
              >
                Sắm ngay
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/about')}
                size="lg"
                className="px-6 sm:px-8"
              >
                Tìm hiểu thêm
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm sm:max-w-xl lg:max-w-lg">
              <TrustItem value="100%" label="Chính hãng" />
              <TrustItem value="24/7" label="Hỗ trợ" />
              <TrustItem value="2 Năm" label="Bảo hành" />
            </div>
          </div>

          <div className="relative">
            <div ref={imageRef} className="relative z-10 mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[1fr_170px]">
                <div className="flex min-h-[280px] items-center justify-center bg-slate-50 p-4 sm:min-h-[340px] sm:p-6">
                  <img
                    src="/assets/categories/sports_watch.png"
                    alt="Đồng hồ sức khỏe thông minh S-LIFE"
                    className="h-[240px] w-full object-contain sm:h-[300px] lg:h-[340px]"
                  />
                </div>
                <div className="flex flex-col justify-between border-t border-slate-100 p-4 lg:border-l lg:border-t-0">
                  <div>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Watch size={24} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bộ sưu tập 2026</p>
                    <h2 className="mt-2 text-xl font-bold leading-tight text-slate-900">Đồng hồ thể thao thông minh</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      GPS, nhịp tim, giấc ngủ và luyện tập trong một thiết bị gọn nhẹ.
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <HeroMetric icon={CheckCircle2} label="Sẵn hàng" value="99+" />
                    <HeroMetric icon={Truck} label="Giao hàng" value="Toàn quốc" />
                    <HeroMetric icon={ShieldCheck} label="Cam kết" value="Chính hãng" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3 transition-colors hover:bg-slate-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function TrustItem({ value, label }) {
  return (
    <div className="rounded-xl bg-slate-50/80 px-3 py-3 text-left transition-colors hover:bg-slate-100">
      <div className="mb-1 flex items-center gap-1.5 text-blue-600">
        <Star size={14} className="fill-current" />
        <span className="text-base font-bold text-slate-900">{value}</span>
      </div>
      <p className="text-[13px] font-medium text-slate-500">{label}</p>
    </div>
  );
}

export default Hero;
