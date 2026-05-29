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
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm lg:p-7">
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
              <ShieldCheck size={24} />
            </div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Gợi ý lựa chọn</p>
            <h2 className="mb-4 text-2xl font-bold leading-tight tracking-tight lg:text-3xl">
              Chọn đúng thiết bị cho thói quen của bạn
            </h2>
            <p className="text-sm leading-relaxed text-slate-300 lg:text-base">
              S-LIFE tập trung vào thiết bị sức khỏe thông minh: dễ dùng, thông số rõ, phù hợp cả luyện tập lẫn theo dõi hằng ngày.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-blue-50"
            >
              Xem toàn bộ sản phẩm <ArrowRight size={16} />
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
      className="group flex min-h-[210px] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
        <Icon size={23} />
      </div>
      <h3 className="mb-2 text-base font-bold text-slate-950">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{description}</p>
      <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-bold text-blue-700">
        Khám phá <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default StorySection;
