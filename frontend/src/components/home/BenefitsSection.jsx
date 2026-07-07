import React from "react";
import { ShieldCheck, Clock, Star } from "lucide-react";

function BenefitsSection() {
  return (
    <section className="bg-white py-10 lg:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl shadow-slate-900/10 lg:p-10">
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-8">
            <div className="text-center lg:text-left max-w-md">
              <p className="mb-3.5 text-[13px] font-bold uppercase tracking-widest text-blue-400">Cam kết S-LIFE</p>
              <h2 className="mb-5 text-[28px] font-bold leading-[1.2] text-white lg:text-[36px]">Mua sắm an tâm</h2>
              <p className="text-base leading-relaxed text-slate-300 lg:text-lg">Chúng tôi cam kết sản phẩm chính hãng, bảo hành rõ ràng và hỗ trợ sau bán hàng.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
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
    <div className="group flex flex-col items-center gap-3 sm:gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 sm:p-6 text-center transition-all duration-300 hover:border-white/10 hover:bg-white/10 hover:-translate-y-1 hover:shadow-lg lg:items-start lg:text-left">
      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 transition-colors group-hover:bg-blue-500/30">
        {icon}
      </div>
      <div>
        <h4 className="mb-1 sm:mb-2 text-[15px] sm:text-[17px] font-bold text-white">{title}</h4>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default BenefitsSection;
