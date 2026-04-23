import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Package, 
  Settings, 
  LogOut,
  ChevronRight,
  Clock,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';

const Profile = () => {
  const [userData, setUserData] = React.useState({
    name: "Member",
    email: "email@example.com",
    phone: "Chưa cập nhật",
    joinDate: "Tháng 4, 2026"
  });

  React.useEffect(() => {
    const storedUsername = localStorage.getItem('slife_username');
    // In a real app, we'd fetch full info from API
    if (storedUsername) {
      setUserData(prev => ({
        ...prev,
        name: storedUsername,
        email: `${storedUsername.toLowerCase()}@slife.vn`
      }));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const orders = [
    { id: "SL-9824-X12", date: "14/04/2026", status: "Đang giao", total: 10500000, product: "Apple Watch Series 9" },
    { id: "SL-8812-Y05", date: "02/04/2026", status: "Hoàn thành", total: 2490000, product: "Xiaomi Band 8" },
  ];

  const sidebarLinks = [
    { name: "Hồ sơ cá nhân", icon: <User size={18} />, active: true },
    { name: "Đơn hàng của tôi", icon: <Package size={18} /> },
    { name: "Sổ địa chỉ", icon: <MapPin size={18} /> },
    { name: "Phương thức thanh toán", icon: <CreditCard size={18} /> },
    { name: "Bảo mật & Tài khoản", icon: <ShieldCheck size={18} /> },
  ];

  return (
    <MainLayout>
      <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                      {userData.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tighter italic uppercase">{userData.name}</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Thành viên S-Life</p>
                   </div>
                </div>

                <nav className="space-y-2">
                  {sidebarLinks.map((link, i) => (
                    <button 
                      key={i}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                        link.active ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {link.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest italic">{link.name}</span>
                      </div>
                      <ChevronRight size={14} className={link.active ? "text-white" : "text-slate-300"} />
                    </button>
                  ))}
                  
                  <div className="pt-6 mt-6 border-t border-slate-100">
                     <button 
                       onClick={handleLogout}
                       className="w-full flex items-center gap-4 p-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                     >
                        <LogOut size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Đăng xuất</span>
                     </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-3 space-y-8">
               {/* User Info Card */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100"
               >
                  <div className="flex justify-between items-start mb-10">
                     <h3 className="text-xl font-black italic uppercase tracking-tighter">Thông tin cá nhân</h3>
                     <button className="flex items-center gap-2 text-blue-600 font-black italic uppercase tracking-widest text-[10px]">
                        <Settings size={14} /> Chỉnh sửa
                     </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic mb-2">Họ và tên</p>
                           <p className="text-sm font-black text-slate-900 italic uppercase">{userData.name}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic mb-2">Số điện thoại</p>
                           <p className="text-sm font-black text-slate-900 italic uppercase">{userData.phone}</p>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic mb-2">Email</p>
                           <p className="text-sm font-black text-slate-900 italic uppercase">{userData.email}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic mb-2">Ngày tham gia</p>
                           <p className="text-sm font-black text-slate-900 italic uppercase">{userData.joinDate}</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Recent Orders List */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100"
               >
                  <div className="flex justify-between items-start mb-10">
                     <h3 className="text-xl font-black italic uppercase tracking-tighter">Đơn hàng gần đây</h3>
                     <button className="text-blue-600 font-black italic uppercase tracking-widest text-[10px]">
                        Xem tất cả
                     </button>
                  </div>

                  <div className="space-y-4">
                     {orders.map((order, i) => (
                       <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                          <div className="flex items-center gap-6 mb-4 md:mb-0">
                             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 border border-slate-200 shadow-sm">
                                <Package size={24} />
                             </div>
                             <div>
                                <h4 className="font-black text-slate-900 italic uppercase tracking-widest text-xs mb-1">{order.product}</h4>
                                <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-widest text-slate-400 italic">
                                   <Clock size={10} /> {order.date} • ID: {order.id}
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:gap-12">
                             <div className="text-left md:text-right">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Tổng cộng</p>
                                <p className="text-slate-900 font-black italic">{order.total.toLocaleString('vi-VN')}₫</p>
                             </div>
                             <div className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest italic ${
                                order.status === "Đang giao" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                             }`}>
                                {order.status}
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </motion.div>
            </main>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
