import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, CheckCircle2 } from 'lucide-react';

const VOUCHERS = [
  {
    code: 'SINHNHATSLIFE',
    discount: '10%',
    desc: 'Đơn từ 1.000.000đ',
    exp: '30/06/2026'
  },
  {
    code: 'SLIFE100K',
    discount: '100K',
    desc: 'Đơn từ 1.500.000đ',
    exp: '26/08/2026'
  },
  {
    code: 'FREESHIP50',
    discount: '50K',
    desc: 'Freeship Đơn từ 500K',
    exp: '12/07/2026'
  }
];

const PromoBanner = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="relative w-full py-16 bg-transparent">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Phần Tiêu đề - Thiết kế tối giản */}
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-3"
          >
            <Gift className="text-blue-600" size={20} />
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ưu Đãi Đặc Quyền
            </h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 font-medium"
          >
            Lưu ngay mã giảm giá để tận hưởng trải nghiệm mua sắm cao cấp.
          </motion.p>
        </div>

        {/* Hiệu ứng dải băng chạy ngang liên tục */}
        <style>
          {`
            @keyframes slide-infinite {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-100% - 24px)); }
            }
            .animate-marquee-infinite {
              animation: slide-infinite 25s linear infinite;
            }
            .group:hover .animate-marquee-infinite {
              animation-play-state: paused;
            }
          `}
        </style>

        <div className="relative w-full overflow-hidden py-4">
          <div className="flex gap-6 group">
            {/* Dải băng 1 (Hiển thị đầu tiên) */}
            <div className="flex gap-6 shrink-0 animate-marquee-infinite">
              {[...VOUCHERS, ...VOUCHERS].map((voucher, idx) => (
                <motion.div
                  key={`t1-${idx}`}
                  className="w-[320px] shrink-0 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-blue-200"
                >
                  {/* Phần trên: Thông tin giảm giá & Mô tả */}
                  <div className="mb-8">
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Voucher Giảm</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{voucher.discount}</h3>
                    <p className="text-slate-600 font-medium">{voucher.desc}</p>
                    <p className="text-slate-400 text-sm mt-1">HSD: {voucher.exp}</p>
                  </div>

                  {/* Phần dưới: Mã Code & Nút Copy */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="font-mono font-bold text-lg text-slate-900 tracking-wider">
                      {voucher.code}
                    </span>
                    
                    <button
                      onClick={() => handleCopy(voucher.code)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Sao chép mã"
                    >
                      <AnimatePresence mode="wait">
                        {copiedCode === voucher.code ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-emerald-500"
                          >
                            <CheckCircle2 size={20} strokeWidth={2.5} />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Copy size={18} strokeWidth={2.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dải băng 2 (Nhân bản dải băng 1 để nối đuôi chạy lặp vô tận) */}
            <div className="flex gap-6 shrink-0 animate-marquee-infinite">
              {[...VOUCHERS, ...VOUCHERS].map((voucher, idx) => (
                <motion.div
                  key={`t2-${idx}`}
                  className="w-[320px] shrink-0 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-blue-200"
                >
                  {/* Phần trên: Thông tin giảm giá & Mô tả */}
                  <div className="mb-8">
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Voucher Giảm</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{voucher.discount}</h3>
                    <p className="text-slate-600 font-medium">{voucher.desc}</p>
                    <p className="text-slate-400 text-sm mt-1">HSD: {voucher.exp}</p>
                  </div>

                  {/* Phần dưới: Mã Code & Nút Copy */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="font-mono font-bold text-lg text-slate-900 tracking-wider">
                      {voucher.code}
                    </span>
                    
                    <button
                      onClick={() => handleCopy(voucher.code)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Sao chép mã"
                    >
                      <AnimatePresence mode="wait">
                        {copiedCode === voucher.code ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-emerald-500"
                          >
                            <CheckCircle2 size={20} strokeWidth={2.5} />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Copy size={18} strokeWidth={2.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PromoBanner;
