import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe, Users, Award, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const About = () => {
  return (
    <div className="min-h-screen bg-white pt-32 lg:pt-44 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="container mx-auto px-6 lg:px-8 mb-32 relative">
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-[120px] opacity-60" />
         <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-50 rounded-full blur-[120px] opacity-60" />
         
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <ShieldCheck size={14} /> Câu chuyện của chúng tôi
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-8 uppercase leading-[0.9]"
            >
              NÂNG TẦM <span className="text-blue-600">LỐI SỐNG</span> <br /> 
              CÔNG NGHỆ THÔNG MINH
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto mb-12"
            >
              S-Life TechHub không chỉ là một cửa hàng. Chúng tôi là điểm đến cho những người khao khát kết hợp sức mạnh của công nghệ vào hành trình rèn luyện sức khỏe và phong cách sống hiện đại.
            </motion.p>

            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="flex flex-wrap justify-center gap-4"
            >
               <Button variant="primary" size="lg" className="px-10" icon={ArrowRight}>Khám phá bộ sưu tập</Button>
               <Button variant="outline" size="lg" className="px-10">Liên hệ hợp tác</Button>
            </motion.div>
         </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-24 mb-32">
         <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
               {[
                 { label: 'Khách hàng tin dùng', val: '50K+' },
                 { label: 'Sản phẩm chính hãng', val: '100%' },
                 { label: 'Đại lý ủy quyền', val: '12+' },
                 { label: 'Năm kinh nghiệm', val: '5+' }
               ].map((stat, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                 >
                    <p className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2 italic">{stat.val}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Mission & Values */}
      <section className="container mx-auto px-6 lg:px-8 mb-32">
         <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative"
            >
               <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=2070" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100" 
                    alt="Team work" 
                  />
               </div>
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600 rounded-[2.5rem] flex items-center justify-center p-8 text-white shadow-2xl">
                  <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
                    Đổi mới không ngừng vì sức khỏe cộng đồng.
                  </p>
               </div>
            </motion.div>

            <div className="space-y-12">
               <div>
                  <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-6 leading-tight">
                    TẦM NHÌN <span className="text-blue-600">&</span> <br /> SỨ MỆNH CỦA S-LIFE
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Chúng tôi tin rằng công nghệ là cầu nối tốt nhất để con người thấu hiểu cơ thể mình. Mục tiêu của S-Life là mang những thiết bị đeo thông minh (Wearables) tốt nhất thế giới đến gần hơn với người tiêu dùng Việt Nam.
                  </p>
               </div>

               <div className="grid gap-8">
                  {[
                    { 
                      title: 'Chất lượng hàng đầu', 
                      desc: 'Mọi sản phẩm tại S-Life đều trải qua quy trình kiểm định nghiêm ngặt.',
                      icon: Award
                    },
                    { 
                      title: 'Cộng đồng năng động', 
                      desc: 'Chúng tôi xây dựng hệ sinh thái hỗ trợ người dùng tối ưu hóa thiết bị.',
                      icon: Users
                    },
                    { 
                      title: 'Công nghệ tiên phong', 
                      desc: 'Luôn cập nhật những mẫu mã mới nhất từ các triển lãm công nghệ toàn cầu.',
                      icon: Zap
                    }
                  ].map((value, i) => (
                    <motion.div 
                      key={i} 
                      className="flex gap-6 group"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                       <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shrink-0">
                          <value.icon size={24} />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2 italic group-hover:text-blue-600 transition-colors">{value.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{value.desc}</p>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Team/Brand Grid */}
      <section className="bg-slate-50 py-32 rounded-[4rem] mx-6 lg:mx-8">
         <div className="container mx-auto px-6 text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">ĐỐI TÁC CHIẾN LƯỢC</h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Đồng hành cùng những thương hiệu hàng đầu thế giới</p>
         </div>
         
         <div className="container mx-auto px-6 overflow-hidden">
            <div className="flex flex-wrap justify-center gap-12 lg:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
               {['Garmin', 'Apple', 'Samsung', 'Suunto', 'Fitbit', 'Sony'].map(brand => (
                 <span key={brand} className="text-3xl lg:text-4xl font-black text-slate-400 tracking-tighter hover:text-slate-900 cursor-default transition-colors">
                   {brand.toUpperCase()}
                 </span>
               ))}
            </div>
         </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-6 lg:px-8 py-32">
         <div className="bg-blue-600 rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl shadow-blue-600/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
               <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-8 uppercase leading-none">SẴN SÀNG ĐỂ <br /> BẮT ĐẦU CHƯA?</h2>
               <p className="text-blue-100 font-medium mb-12 text-lg">Đội ngũ chuyên gia của S-Life luôn sẵn sàng tư vấn giải pháp công nghệ phù hợp nhất cho cá nhân và doanh nghiệp.</p>
               <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="white" size="lg" className="px-10 text-blue-600">Mua sắm ngay</Button>
                  <Button variant="outline" size="lg" className="px-10 text-white border-white/30 hover:bg-white/10">Trò chuyện với AI</Button>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default About;
