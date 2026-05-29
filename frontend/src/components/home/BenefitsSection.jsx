import React from "react";
import { ShieldCheck, Clock, Star } from "lucide-react";

function BenefitsSection() {
  return (
    <section className="bg-white py-10 lg:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-5 shadow-sm lg:p-8">
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-8">
            <div className="text-center lg:text-left max-w-md">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Cam kết S-LIFE</p>
              <h2 className="mb-4 text-2xl font-bold leading-tight text-white lg:text-3xl">Mua sắm an tâm</h2>
              <p className="text-sm leading-relaxed text-slate-300 lg:text-base">Chúng tôi cam kết sản phẩm chính hãng, bảo hành rõ ràng và hỗ trợ sau bán hàng.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <BenefitItem
                icon={<ShieldCheck className="text-blue-300" size={26} />}
                title="Chính hãng 100%"
                desc="Nguồn hàng rõ ràng, thông tin sản phẩm minh bạch."
              />
              <BenefitItem
                icon={<Clock className="text-blue-300" size={26} />}
                title="Bảo hành theo chính sách"
                desc="Tiếp nhận và xử lý bảo hành theo từng thương hiệu."
              />
              <BenefitItem
                icon={<Star className="text-blue-300" size={26} />}
                title="Tư vấn trước khi mua"
                desc="Gợi ý sản phẩm theo nhu cầu sử dụng thực tế."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitItem({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-center transition-colors hover:bg-white/10 lg:items-start lg:text-left">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/20">
        {icon}
      </div>
      <div>
        <h4 className="mb-2 text-base font-bold text-white">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default BenefitsSection;
