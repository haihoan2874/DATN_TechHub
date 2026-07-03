import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Globe2,
  Headset,
  PackageSearch,
  SearchCode,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Watch,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

// High-end retail/tech assets
const heroImage = 'https://images.unsplash.com/photo-1491472253230-a044054ca35f?auto=format&fit=crop&q=80&w=2400'; // Dark premium tech flatlay
const gridImg1 = 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=1600'; // Sleek dark tech
const gridImg2 = 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=1600'; // Premium dark smartwatch

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const About = () => {
  const navigate = useNavigate();

  return (
    <main aria-label="about" className="bg-slate-950 text-white selection:bg-blue-500/30 min-h-screen overflow-hidden">
      
      {/* 1. HERO SECTION - RETAIL AUTHORITY */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image with Parallax feel */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img
              src={heroImage}
              alt="S-LIFE Premium Tech"
              className="w-full h-full object-cover mix-blend-screen"
            />
          </motion.div>
          {/* Advanced Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,1)_100%)]" />
        </div>
        
        {/* Animated glowing orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[50rem] h-[50rem] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 -right-1/4 w-[60rem] h-[60rem] bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none" 
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-200 backdrop-blur-xl shadow-[0_0_30px_rgba(37,99,235,0.2)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Đại lý ủy quyền chính thức
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-[7rem] leading-[0.95] text-balance max-w-5xl"
          >
            Tâm điểm của <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-white">thương hiệu lớn.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 max-w-2xl text-lg font-medium leading-relaxed text-slate-300 sm:text-2xl"
          >
            S-LIFE tự hào là chuỗi bán lẻ thiết bị sức khỏe thông minh uy tín hàng đầu. Nơi hội tụ tinh hoa công nghệ từ Apple, Garmin, Samsung, mang đến cho bạn trải nghiệm mua sắm liền mạch và an tâm tuyệt đối.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row w-full sm:w-auto px-4"
          >
            <Button
              size="lg"
              variant="light"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto px-10 py-5 text-lg rounded-[20px] hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] font-black"
              onClick={() => document.getElementById('retail-core').scrollIntoView({ behavior: 'smooth' })}
            >
              Tại sao chọn S-LIFE?
            </Button>
            <Button
              size="lg"
              variant="glass"
              className="w-full sm:w-auto px-10 py-5 text-lg rounded-[20px] transition-all duration-300 font-bold"
              onClick={() => navigate('/shop')}
            >
              Vào cửa hàng
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Khám phá uy tín</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-slate-500 to-transparent" 
          />
        </motion.div>
      </section>

      {/* 1.5 INFINITE BRAND MARQUEE */}
      <section className="relative z-20 border-y border-white/5 bg-slate-950/50 backdrop-blur-md overflow-hidden py-8">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10" />
        
        <motion.div 
          className="flex whitespace-nowrap w-max"
          animate={{ x: ["0%", "-33.333333%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
        >
          {/* We repeat the array 3 times to ensure a seamless infinite scroll */}
          {[
            'GARMIN', 'APPLE', 'SAMSUNG', 'COROS', 'SUUNTO', 'POLAR', 'AMAZFIT', 'WITHINGS', 'HUAWEI',
            'GARMIN', 'APPLE', 'SAMSUNG', 'COROS', 'SUUNTO', 'POLAR', 'AMAZFIT', 'WITHINGS', 'HUAWEI',
            'GARMIN', 'APPLE', 'SAMSUNG', 'COROS', 'SUUNTO', 'POLAR', 'AMAZFIT', 'WITHINGS', 'HUAWEI'
          ].map((brand, i) => (
            <div key={i} className="flex items-center justify-center mx-12 sm:mx-16 opacity-40 hover:opacity-100 transition-opacity duration-300">
              <span className="text-2xl sm:text-3xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
                {brand}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 2. RETAIL CORE - BENTO GRID */}
      <section id="retail-core" className="relative z-20 mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">Cam kết phân phối</p>
          <h2 className="text-4xl font-black text-white">Sự uy tín tạo nên thương hiệu.</h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]"
        >
          {/* Large Hero Bento */}
          <motion.div variants={fadeInUp} className="md:col-span-2 lg:col-span-2 row-span-2 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden group">
            <img src={gridImg1} alt="Đối tác chiến lược" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 p-10 flex flex-col justify-end">
              <div className="h-14 w-14 rounded-2xl bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
                <Award size={28} />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">Đối tác chiến lược toàn cầu.</h3>
              <p className="mt-4 text-slate-400 font-medium text-lg max-w-md">Chúng tôi làm việc trực tiếp với các hãng công nghệ lớn. Đảm bảo nguồn hàng 100% nguyên seal, chính ngạch và luôn cập nhật model mới nhất đầu tiên tại Việt Nam.</p>
            </div>
          </motion.div>

          {/* Medium Bento 1 */}
          <motion.div variants={fadeInUp} className="md:col-span-1 lg:col-span-2 rounded-[2.5rem] bg-slate-900 border border-white/5 p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black text-white">Bảo hành chính hãng</h3>
                <p className="mt-2 text-slate-400 font-medium">Bảo vệ quyền lợi tuyệt đối cho khách hàng.</p>
              </div>
              <div className="self-end">
                <span className="text-[5rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-600">100%</span>
              </div>
            </div>
          </motion.div>

          {/* Small Bento 1 */}
          <motion.div variants={fadeInUp} className="rounded-[2.5rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 flex flex-col justify-center items-center text-center hover:bg-white/[0.02] transition-colors">
            <SearchCode size={40} className="text-blue-400 mb-6" />
            <h4 className="text-xl font-extrabold text-white">Tìm kiếm thông minh</h4>
            <p className="mt-2 text-slate-400 text-sm">Giao diện Web lọc sản phẩm theo nhu cầu sức khỏe</p>
          </motion.div>

          {/* Small Bento 2 */}
          <motion.div variants={fadeInUp} className="rounded-[2.5rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 flex flex-col justify-center items-center text-center hover:bg-white/[0.02] transition-colors">
            <CreditCard size={40} className="text-indigo-400 mb-6" />
            <h4 className="text-xl font-extrabold text-white">Thanh toán bảo mật</h4>
            <p className="mt-2 text-slate-400 text-sm">Tích hợp VNPay, Trả góp 0%, Mã hóa giao dịch</p>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. PARALLAX STATS */}
      <section className="relative py-32 border-y border-white/5 bg-slate-950/50 backdrop-blur-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 divide-x divide-white/5">
            {[
              { num: '15+', label: 'Thương hiệu lớn', icon: Globe2 },
              { num: '480+', label: 'Mã sản phẩm', icon: Watch },
              { num: '10K+', label: 'Khách tin dùng', icon: Star },
              { num: '24/7', label: 'Tư vấn chuyên gia', icon: Headset }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center px-4"
              >
                <stat.icon size={32} className="text-blue-500 mb-6 opacity-50" />
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tighter">{stat.num}</span>
                <span className="mt-4 text-sm font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. IMMERSIVE PLATFORM UX */}
      <section className="py-32 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-[1.1] tracking-tight">
                Trải nghiệm không chỉ <br/>
                <span className="text-slate-500">dừng ở lúc thanh toán.</span>
              </h2>
              <p className="mt-8 text-lg text-slate-400 font-medium leading-relaxed max-w-lg">
                Là một nhà phân phối hiện đại, nền tảng Web của S-LIFE được thiết kế để theo sát bạn trong toàn bộ vòng đời sử dụng thiết bị. Từ lúc tra cứu cấu hình, đến đóng gói giao hàng chuẩn Premium, và xử lý bảo hành ngay trên hệ thống.
              </p>
              
              <ul className="mt-10 space-y-6">
                {['Theo dõi đơn hàng thời gian thực trên Web', 'Đóng gói Premium 3 lớp chống sốc', 'Hệ thống tiếp nhận bảo hành online 1-chạm'].map((text, i) => (
                  <li key={i} className="flex items-center gap-4 text-white font-bold text-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                      <CheckCircle2 size={16} />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-400 rounded-[4rem] blur-[100px] opacity-20" />
              <img 
                src={gridImg2} 
                alt="S-LIFE Premium Service" 
                className="relative z-10 w-full h-full object-cover rounded-[4rem] shadow-2xl border border-white/10"
              />
              {/* Floating element */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -left-10 top-20 z-20 glass-card bg-slate-900/80 border-white/10 p-6 rounded-3xl"
              >
                <div className="flex items-center gap-4">
                  <div className="text-blue-400"><PackageSearch size={32} /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Giao hàng hỏa tốc</p>
                    <p className="text-2xl font-black text-white mt-1">Nội thành 2H</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. EPIC CTA SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 px-6 py-24 text-center shadow-2xl sm:px-12 lg:px-16 border border-white/10"
        >
          {/* Insane light beams */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-blue-500/30 to-transparent blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-indigo-500/20 to-transparent blur-3xl" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
              <BadgeCheck size={40} className="text-blue-300" />
            </div>
            <h2 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-[4.5rem] leading-[1.05] text-balance">
              Uy tín tạo nên <br/> khác biệt.
            </h2>
            <p className="mt-8 text-xl font-medium leading-relaxed text-blue-100/80 max-w-2xl">
              Gia nhập cộng đồng mua sắm thông minh tại S-LIFE. Đăng ký tài khoản ngay để theo dõi lịch sử đơn hàng, hưởng đặc quyền thành viên và bảo hành nhanh chóng.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
              <Button size="lg" variant="light" className="w-full sm:w-auto px-10 py-5 text-lg font-black rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105" onClick={() => navigate('/shop')}>
                Khám phá tủ kính
              </Button>
              <Button size="lg" variant="glass" className="w-full sm:w-auto px-10 py-5 text-lg font-bold rounded-2xl transition-all" onClick={() => navigate('/register')}>
                Mở thẻ thành viên
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

    </main>
  );
};

export default About;
