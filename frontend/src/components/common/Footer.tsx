import React from 'react';


const Footer: React.FC = () => {
  const footerSections = [
    { 
      title: "Hệ thống Showroom", 
      links: [
        { name: "S-Life Hà Nội: 123 Cầu Giấy", path: "#" },
        { name: "S-Life Tp.HCM: 456 Lê Lợi", path: "#" },
        { name: "Giờ mở cửa: 08:00 - 22:00", path: "#" }
      ] 
    },
    { 
      title: "Hỗ trợ 24/7", 
      links: [
        { name: "Hotline: 1900 6789", path: "#" },
        { name: "Email: support@slife.vn", path: "#" },
        { name: "Bảo hành tận nơi", path: "#" }
      ] 
    }
  ];

  return (
    <footer className="pt-32 pb-16 border-t border-slate-100 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Brand Column */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start">
            <div className="flex items-center gap-2 mb-8 group">
              <img 
                src="/logo_final.png" 
                alt="S-Life Logo" 
                className="h-40 w-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 mix-blend-multiply" 
              />
              <span className="text-6xl font-black text-slate-900 tracking-tighter italic">S-Life</span>
            </div>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed font-bold italic text-center lg:text-left">
              Người bạn đồng hành tin cậy cho hành trình sống khỏe. Thiết bị thông minh, công nghệ tương lai.
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-12 w-full">
            {footerSections.map((section) => (
              <div key={section.title} className="text-center sm:text-left">
                <h5 className="text-slate-900 font-black mb-10 italic uppercase tracking-[0.3em] text-[10px] md:text-xs">{section.title}</h5>
                <ul className="flex flex-col gap-6 text-slate-400 text-xs md:text-sm font-black italic tracking-wider">
                  {section.links.map(link => (
                    <li key={link.name} className="hover:text-blue-600 transition-colors cursor-default">
                      {link.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
        <p>© 2026 Đồ án tốt nghiệp S-Life. Thiết bị Sức khỏe Thông minh.</p>
        <div className="flex gap-8">
          <span className="text-emerald-500 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Hệ thống sẵn sàng
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
