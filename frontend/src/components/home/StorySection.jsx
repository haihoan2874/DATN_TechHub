import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Users, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StorySection = () => {
  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Left: Visuals */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=2070" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100" 
                alt="TechHub Vision" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                 <p className="text-white text-2xl font-black italic tracking-tighter uppercase leading-tight">
                   "Công nghệ không chỉ là thiết bị, <br /> đó là phong cách sống."
                 </p>
              </div>
            </div>
            
            {/* Floating Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600 rounded-[2.5rem] flex items-center justify-center p-6 text-white shadow-2xl z-20 hidden md:flex">
               <Zap size={40} className="fill-white" />
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-slate-900 rounded-[3rem] border border-slate-800 p-8 z-0 hidden md:block" />
          </motion.div>

          {/* Right: Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <ShieldCheck size={14} /> Câu chuyện S-Life
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl lg:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]"
              >
                Nâng tầm <span className="text-blue-600">tương lai</span> <br /> sức khỏe việt
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-slate-500 font-medium leading-relaxed text-lg"
              >
                S-Life TechHub ra đời với sứ mệnh mang những đỉnh cao công nghệ đeo tay (Wearables) đến gần hơn với người Việt. Chúng tôi tin rằng, mỗi nhịp đập con tim đều xứng đáng được theo dõi bằng những thiết bị tinh hoa nhất.
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-blue-600 hover:bg-white transition-all group"
              >
                <Users className="text-slate-400 group-hover:text-blue-600 mb-4 transition-colors" size={32} />
                <h4 className="text-sm font-black text-slate-900 uppercase mb-2">Cộng đồng</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Hơn 50,000 người dùng đã thay đổi lối sống cùng S-Life.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-blue-600 hover:bg-white transition-all group"
              >
                <Zap className="text-slate-400 group-hover:text-blue-600 mb-4 transition-colors" size={32} />
                <h4 className="text-sm font-black text-slate-900 uppercase mb-2">Công nghệ</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Cập nhật nhanh nhất các siêu phẩm từ Garmin, Apple, Samsung.</p>
              </motion.div>
            </div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.5 }}
            >
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-3 text-sm font-black text-slate-900 uppercase tracking-widest group hover:text-blue-600 transition-colors"
              >
                Khám phá bộ sưu tập sản phẩm 
                <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all">
                   <ArrowUpRight size={18} />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
