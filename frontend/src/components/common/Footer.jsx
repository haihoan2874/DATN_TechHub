import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="flex flex-col gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/logo_final.png" 
                alt="S-Life Logo" 
                className="w-10 h-10 object-contain" 
              />
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                S-LIFE
              </span>
            </Link>
            <p className="text-slate-500 leading-relaxed">
              Tiên phong cung cấp các giải pháp công nghệ sức khỏe thông minh, giúp nâng tầm chất lượng cuộc sống cho mọi gia đình Việt.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Facebook size={20} />} href="#" />
              <SocialIcon icon={<Twitter size={20} />} href="#" />
              <SocialIcon icon={<Instagram size={20} />} href="#" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-black text-xs mb-8 uppercase tracking-[0.2em]">Khám phá</h4>
            <ul className="flex flex-col gap-5">
              <FooterLink to="/shop">Tất cả sản phẩm</FooterLink>
              <FooterLink to="/categories">Danh mục</FooterLink>
              <FooterLink to="/news">Tin tức sức khỏe</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-slate-900 font-black text-xs mb-8 uppercase tracking-[0.2em]">Hỗ trợ khách hàng</h4>
            <ul className="flex flex-col gap-5">
              <FooterLink to="/faq">Câu hỏi thường gặp</FooterLink>
              <FooterLink to="/shipping">Chính sách vận chuyển</FooterLink>
              <FooterLink to="/warranty">Chính sách bảo hành</FooterLink>
              <FooterLink to="/privacy">Chính sách bảo mật</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-slate-900 font-black text-xs mb-8 uppercase tracking-[0.2em]">Liên hệ</h4>
            <ul className="flex flex-col gap-8">
              <ContactItem icon={<Phone size={20} />} text="1900 123 456" />
              <ContactItem icon={<Mail size={20} />} text="contact@s-life.com" />
              <ContactItem icon={<MapPin size={20} />} text="123 Tech Street, Hà Nội, Việt Nam" />
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-sm font-medium">
            © 2026 S-LIFE TECHHUB. Đồ án tốt nghiệp - Trịnh Hải Hoàn.
          </p>
          <div className="flex items-center gap-8">
             <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-8 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
             <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-8 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
             <img src="https://img.icons8.com/color/48/000000/paypal.png" alt="Paypal" className="h-8 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
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

const SocialIcon = ({ icon, href }) => (
  <a 
    href={href} 
    className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all"
  >
    {icon}
  </a>
);

const ContactItem = ({ icon, text }) => (
  <li className="flex items-start gap-4 text-slate-500">
    <div className="mt-1 text-primary">{icon}</div>
    <span className="font-medium">{text}</span>
  </li>
);

export default Footer;
