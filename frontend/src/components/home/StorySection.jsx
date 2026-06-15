import React from 'react';
import { Activity, ArrowRight, BatteryCharging, HeartPulse, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const GUIDES = [
  {
    icon: HeartPulse,
    title: 'Theo dõi sức khỏe',
    description: 'Phù hợp người cần theo dõi nhịp tim, giấc ngủ, SpO2 và vận động hằng ngày.',
    to: '/shop?category=vong-theo-doi-suc-khoe',
  },
  {
    icon: Activity,
    title: 'Luyện tập thể thao',
    description: 'GPS, chế độ tập luyện, pin bền và khả năng chống nước cho chạy bộ, gym, bơi.',
    to: '/shop?category=dong-ho-the-thao',
  },
  {
    icon: BatteryCharging,
    title: 'Phụ kiện sử dụng lâu dài',
    description: 'Dây đeo, dock sạc và phụ kiện giúp cá nhân hóa thiết bị theo phong cách riêng.',
    to: '/shop?category=phu-kien-dong-ho',
  },
];

const StorySection = () => {
  return (
    <section className="bg-white py-10 lg:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl shadow-slate-900/10 lg:p-10">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
              <ShieldCheck size={26} />
            </div>
            <p className="mb-3 text-[13px] font-bold uppercase tracking-widest text-blue-400">Gợi ý lựa chọn</p>
            <h2 className="mb-5 text-[28px] font-bold leading-[1.2] tracking-tight sm:text-3xl lg:text-[38px]">
              Chọn đúng thiết bị cho thói quen của bạn
            </h2>
            <p className="text-base leading-relaxed text-slate-400 lg:text-lg">
              S-LIFE tập trung vào thiết bị sức khỏe thông minh: dễ dùng, thông số rõ, phù hợp cả luyện tập lẫn theo dõi hằng ngày.
            </p>
            <Link
              to="/shop"
              className="mt-8 group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[15px] font-bold text-slate-900 transition-all hover:bg-slate-100 hover:shadow-md hover:-translate-y-0.5"
            >
              Xem toàn bộ sản phẩm <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {GUIDES.map((item) => (
              <GuideCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function GuideCard({ icon: Icon, title, description, to }) {
  return (
    <Link
      to={to}
      className="group flex min-h-[210px] flex-col rounded-2xl border border-slate-200/60 bg-slate-50 p-6 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:-translate-y-1"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm transition-colors group-hover:bg-blue-50">
        <Icon size={24} />
      </div>
      <h3 className="mb-2.5 text-[17px] font-bold text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{description}</p>
      <div className="mt-auto flex items-center gap-2 pt-5 text-[13px] font-bold text-slate-400 transition-colors group-hover:text-blue-600">
        Khám phá <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default StorySection;
