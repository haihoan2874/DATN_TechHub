import React from "react";
import { ShieldCheck, Clock, Star } from "lucide-react";

function BenefitsSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="bg-slate-900 rounded-[60px] p-10 lg:p-20 relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="text-center lg:text-left max-w-md">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">MUA SẮM AN TÂM 100%</h2>
              <p className="text-slate-400 text-lg leading-relaxed">Chúng tôi cam kết chất lượng chuẩn y tế quốc tế, mang lại sự tin tưởng tuyệt đối cho sức khỏe của bạn.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BenefitItem 
                icon={<ShieldCheck className="text-blue-400" size={28} />} 
                title="Chính hãng 100%" 
                desc="Bồi thường 200% nếu phát hiện hàng giả." 
              />
              <BenefitItem 
                icon={<Clock className="text-blue-400" size={28} />} 
                title="Bảo hành 2 năm" 
                desc="Hỗ trợ kỹ thuật 24/7 tận nhà." 
              />
              <BenefitItem 
                icon={<Star className="text-blue-400" size={28} />} 
                title="Top 1 HealthTech" 
                desc="Được tin dùng bởi 10.000+ bác sĩ." 
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
    <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5 p-8 rounded-[40px] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group">
      <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="text-white text-xl font-bold mb-2">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default BenefitsSection;
