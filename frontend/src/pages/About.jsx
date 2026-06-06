import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Watch,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const heroImage =
  'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=85&w=2200';

const studioImage =
  'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?auto=format&fit=crop&q=85&w=1600';

const metrics = [
  { label: 'Sản phẩm tuyển chọn', value: '480+', detail: 'Smartwatch, vòng sức khỏe và phụ kiện chính hãng' },
  { label: 'Thương hiệu công nghệ', value: '15+', detail: 'Garmin, Amazfit, Fitbit, Polar, Suunto...' },
  { label: 'Nhóm thiết bị', value: '8', detail: 'Từ đồng hồ GPS đến dây đeo, sạc và kính bảo vệ' },
  { label: 'Hỗ trợ mua hàng', value: '24/7', detail: 'Tư vấn trước khi mua và theo dõi đơn sau thanh toán' },
];

const promises = [
  {
    icon: PackageCheck,
    title: 'Sản phẩm được chọn lọc',
    desc: 'Mỗi mẫu được trình bày rõ mô tả, thông số kỹ thuật, tình trạng còn hàng, bảo hành và phụ kiện phù hợp để khách hàng dễ so sánh.',
  },
  {
    icon: ShieldCheck,
    title: 'Mua hàng an tâm',
    desc: 'S-LIFE hỗ trợ thanh toán khi nhận hàng, áp dụng mã ưu đãi, theo dõi trạng thái đơn và chính sách hậu mãi minh bạch.',
  },
  {
    icon: HeartPulse,
    title: 'Tập trung sức khỏe thông minh',
    desc: 'Danh mục ưu tiên smartwatch, vòng theo dõi sức khỏe, tai nghe luyện tập và phụ kiện giúp thiết bị bền hơn trong sử dụng hằng ngày.',
  },
];

const timeline = [
  ['01', 'Chọn đúng nhu cầu', 'Tìm thiết bị theo môn tập, mục tiêu sức khỏe, thương hiệu, ngân sách và hệ sinh thái đang dùng.'],
  ['02', 'So sánh rõ ràng', 'Xem mô tả, giá bán, tồn kho, bảo hành, đánh giá và thông số kỹ thuật trước khi quyết định.'],
  ['03', 'Đặt hàng nhanh', 'Chọn địa chỉ, áp mã ưu đãi, thanh toán COD hoặc trực tuyến và nhận xác nhận đơn hàng.'],
  ['04', 'Hậu mãi sau mua', 'Theo dõi trạng thái giao hàng, nhận hỗ trợ sử dụng và đánh giá sản phẩm sau khi trải nghiệm.'],
];

const About = () => {
  const navigate = useNavigate();

  return (
    <main className="bg-slate-950 text-white">
      <section className="relative min-h-[calc(100vh-88px)] overflow-hidden">
        <img
          src={heroImage}
          alt="Người dùng đeo smartwatch trong lúc luyện tập"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.95)_0%,rgba(2,6,23,0.72)_42%,rgba(2,6,23,0.20)_100%)]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-5 py-20 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-100 backdrop-blur"
            >
              <Sparkles size={14} />
              S-LIFE Health Tech Store
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="max-w-3xl text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-8xl"
            >
              Công nghệ đeo cho một nhịp sống khỏe hơn.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-7 max-w-2xl text-base font-medium leading-8 text-slate-200 sm:text-lg"
            >
              S-LIFE là cửa hàng thiết bị sức khỏe thông minh dành cho người dùng muốn theo dõi cơ thể,
              luyện tập hiệu quả hơn và chọn mua sản phẩm công nghệ một cách rõ ràng, đáng tin.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <Button
                size="lg"
                variant="secondary"
                icon={ArrowRight}
                iconPosition="right"
                className="bg-blue-600 px-7 hover:bg-blue-500"
                onClick={() => navigate('/shop')}
              >
                Khám phá cửa hàng
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 px-7 text-white backdrop-blur hover:bg-white/15"
                onClick={() => navigate('/categories')}
              >
                Xem danh mục
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-8 lg:grid-cols-4 lg:px-10">
          {metrics.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.06 }}
              className="py-8 sm:px-7 lg:py-10"
            >
              <p className="text-4xl font-black tracking-tight text-white">{item.value}</p>
              <h2 className="mt-3 text-sm font-black uppercase tracking-wide text-blue-200">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20 text-slate-950 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
              <Watch size={14} />
              Định vị sản phẩm
            </div>
            <h2 className="mt-6 max-w-xl text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
              Không bán mọi thứ. Chỉ chọn những thiết bị thật sự phục vụ sức khỏe và vận động.
            </h2>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600">
              S-LIFE tập trung vào đồng hồ thông minh, vòng theo dõi sức khỏe, tai nghe luyện tập và phụ kiện
              bảo vệ thiết bị. Mỗi sản phẩm được sắp xếp để khách hàng dễ hiểu công dụng, dễ so sánh thông số
              và chọn được món phù hợp với thói quen sống của mình.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Chọn lọc đúng nhu cầu', 'Thông số trình bày rõ ràng', 'Mua hàng nhanh gọn', 'Hỗ trợ sau khi nhận hàng'].map((text) => (
                <div key={text} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
            <img
              src={studioImage}
              alt="Không gian tư vấn thiết bị công nghệ"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-slate-950/82 p-5 text-white backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-600 p-3">
                  <Activity size={22} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Chuẩn chọn hàng</p>
                  <p className="mt-2 text-lg font-black leading-snug">
                    Sản phẩm rõ nguồn, tư vấn đúng nhu cầu, trải nghiệm mua sắm liền mạch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 text-slate-950 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">Cam kết mua sắm</p>
            <h2 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Đẹp là chưa đủ. Mua hàng phải rõ ràng, nhanh và an tâm.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {promises.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
              >
                <div className="mb-8 inline-flex rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-black tracking-tight">{item.title}</h3>
                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">{item.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">Trải nghiệm khách hàng</p>
              <h2 className="mt-4 text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
                Từ chọn sản phẩm đến sau bán hàng.
              </h2>
              <p className="mt-5 text-sm font-medium leading-7 text-slate-400">
                Chúng tôi thiết kế hành trình mua sắm để khách hàng không phải đoán: xem đúng thông tin,
                đặt đúng sản phẩm, theo dõi đúng trạng thái và nhận hỗ trợ khi cần.
              </p>
            </div>

            <div className="grid gap-4">
              {timeline.map(([step, title, desc], index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.06 }}
                  className="group grid gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:grid-cols-[96px_1fr] sm:p-6"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-slate-950 sm:h-20 sm:w-20">
                    {step}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">{title}</h3>
                    <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-slate-400">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 text-slate-950 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-900/15">
            <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="p-7 sm:p-10 lg:p-14">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-100">
                  <Star size={14} />
                  Mua sắm an tâm
                </div>
                <h2 className="mt-6 max-w-2xl text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
                  Thiết bị tốt hơn cho thói quen sống khỏe hơn.
                </h2>
                <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-300">
                  Dù bạn cần một chiếc đồng hồ GPS để chạy bộ, vòng đeo tay theo dõi giấc ngủ hay dây đeo thay thế,
                  S-LIFE giúp bạn chọn mua nhanh hơn và tự tin hơn.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" variant="secondary" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/shop')}>
                    Vào cửa hàng
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-transparent hover:bg-white/10 hover:text-white"
                    onClick={() => navigate('/categories')}
                  >
                    Xem danh mục
                  </Button>
                </div>
              </div>
              <div className="border-t border-white/10 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-14">
                <div className="grid gap-4">
                  {[
                    { icon: Clock3, label: 'Giao hàng linh hoạt', value: 'Theo dõi trạng thái đơn và nhận hàng đúng địa chỉ đã chọn' },
                    { icon: MapPin, label: 'Thanh toán tiện lợi', value: 'Hỗ trợ COD và thanh toán trực tuyến theo nhu cầu' },
                    { icon: HeartPulse, label: 'Hỗ trợ sử dụng', value: 'Tư vấn chọn thiết bị, phụ kiện và cách dùng sau khi mua' },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-blue-600/20 p-2.5 text-blue-200">
                        <item.icon size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-wide">{item.label}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
