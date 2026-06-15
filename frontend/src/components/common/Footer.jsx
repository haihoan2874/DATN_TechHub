import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-8">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/logo_final.png" 
                alt="S-Life Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-extrabold text-slate-900">
                S-LIFE
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              Tiên phong cung cấp các giải pháp công nghệ sức khỏe thông minh, giúp nâng tầm chất lượng cuộc sống cho mọi gia đình Việt.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">Khám phá</h4>
            <ul className="flex flex-col gap-2.5">
              <FooterLink to="/shop">Tất cả sản phẩm</FooterLink>
              <FooterLink to="/categories">Danh mục</FooterLink>
              <FooterLink to="/about">Về S-LIFE</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">Hỗ trợ khách hàng</h4>
            <ul className="flex flex-col gap-2.5">
              <FooterText>Giao hàng toàn quốc</FooterText>
              <FooterText>Thanh toán COD hoặc trực tuyến</FooterText>
              <FooterText>Bảo hành theo chính sách sản phẩm</FooterText>
              <FooterText>Tư vấn trước khi mua</FooterText>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">Liên hệ</h4>
            <ul className="flex flex-col gap-3">
              <ContactItem icon={<Phone size={20} />} text="1900 123 456" />
              <ContactItem icon={<Mail size={20} />} text="contact@s-life.com" />
              <ContactItem icon={<MapPin size={20} />} text="Hà Nội, Việt Nam" />
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-5 md:flex-row">
          <p className="text-slate-400 text-sm font-medium">
            © 2026 S-LIFE. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
             <span className="rounded-md border border-slate-200 px-2 py-1">COD</span>
             <span className="rounded-md border border-slate-200 px-2 py-1">VNPay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }) => (
  <li>
    <Link to={to} className="text-slate-500 hover:text-primary transition-colors font-medium">
      {children}
    </Link>
  </li>
);

const FooterText = ({ children }) => (
  <li className="text-sm font-medium text-slate-500">
    {children}
  </li>
);

const ContactItem = ({ icon, text, href }) => (
  <li className="flex items-start gap-3 text-sm text-slate-500">
    <div className="mt-1 text-primary">{icon}</div>
    {href ? (
      <a href={href} className="font-medium transition-colors hover:text-primary">
        {text}
      </a>
    ) : (
      <span className="font-medium">{text}</span>
    )}
  </li>
);

export default Footer;
