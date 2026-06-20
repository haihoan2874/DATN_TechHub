import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 pt-16 pb-8">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-visible transition-transform duration-300 group-hover:scale-105">
                <img 
                  src="/logo_transparent.png" 
                  alt="S-Life Logo" 
                  className="h-full w-full object-contain scale-[1.35]"
                />
              </div>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                S-LIFE
              </span>
            </Link>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-400">
              Tiên phong cung cấp các giải pháp công nghệ sức khỏe thông minh, giúp nâng tầm chất lượng cuộc sống cho mọi gia đình Việt.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-100">Khám phá</h4>
            <ul className="flex flex-col gap-4">
              <FooterLink to="/shop">Tất cả sản phẩm</FooterLink>
              <FooterLink to="/categories">Danh mục</FooterLink>
              <FooterLink to="/about">Về S-LIFE</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-100">Hỗ trợ khách hàng</h4>
            <ul className="flex flex-col gap-4">
              <FooterText>Giao hàng toàn quốc</FooterText>
              <FooterText>Thanh toán COD hoặc trực tuyến</FooterText>
              <FooterText>Bảo hành theo chính sách sản phẩm</FooterText>
              <FooterText>Tư vấn trước khi mua</FooterText>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-100">Liên hệ</h4>
            <ul className="flex flex-col gap-5">
              <ContactItem icon={<Phone size={18} />} text="1900 123 456" />
              <ContactItem icon={<Mail size={18} />} text="contact@s-life.com" />
              <ContactItem icon={<MapPin size={18} />} text="Hà Nội, Việt Nam" />
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row">
          <p className="text-slate-500 text-sm font-bold tracking-wide">
            © 2026 S-LIFE. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest text-slate-400">
             <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 transition-colors hover:text-white hover:border-slate-700">COD</span>
             <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 transition-colors hover:text-white hover:border-slate-700">VNPAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }) => (
  <li>
    <Link to={to} className="text-sm font-medium text-slate-400 transition-all hover:text-white hover:translate-x-1 inline-block">
      {children}
    </Link>
  </li>
);

const FooterText = ({ children }) => (
  <li className="text-sm font-medium text-slate-400">
    {children}
  </li>
);

const ContactItem = ({ icon, text, href }) => (
  <li className="flex items-start gap-4 text-sm text-slate-400">
    <div className="mt-0.5 text-blue-400">{icon}</div>
    {href ? (
      <a href={href} className="font-medium transition-colors hover:text-white">
        {text}
      </a>
    ) : (
      <span className="font-medium">{text}</span>
    )}
  </li>
);

export default Footer;
