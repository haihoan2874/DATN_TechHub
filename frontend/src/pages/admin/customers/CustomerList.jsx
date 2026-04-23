import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Calendar, 
  Shield, 
  UserCheck, 
  UserX,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../../api/axios';
import { CustomerIcon } from '../../../components/common/IconComponents';
import Toast from '../../../components/common/Toast';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/users');
      setCustomers(response.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      // Fallback for demo
      setCustomers([
        { id: '1', username: 'hoannv', email: 'hoan@gmail.com', firstName: 'Hoan', lastName: 'Nguyễn', role: 'ROLE_ADMIN', isActive: true, createdAt: new Date().toISOString(), totalSpent: 2500, orderCount: 12 },
        { id: '2', username: 'customer01', email: 'customer@gmail.com', firstName: 'Minh', lastName: 'Anh', role: 'ROLE_USER', isActive: true, createdAt: new Date().toISOString(), totalSpent: 450, orderCount: 2 },
        { id: '3', username: 'guest_user', email: 'guest@gmail.com', firstName: 'Khách', lastName: 'Hàng 03', role: 'ROLE_USER', isActive: false, createdAt: new Date().toISOString(), totalSpent: 0, orderCount: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setToast({ isVisible: true, message: `Hệ thống đã ${!currentStatus ? 'Kích hoạt' : 'Vô hiệu hoá'} tài khoản này.`, type: 'info' });
      // Update local state for demo
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
    } catch (err) {
      setToast({ isVisible: true, message: 'Lỗi khi thay đổi trạng thái.', type: 'error' });
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600">
            <CustomerIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Khách hàng</h1>
            <p className="text-slate-400 font-medium text-sm">Quản lý cơ sở dữ liệu khách hàng và quyền truy cập.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-4 lg:p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-16 pr-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white placeholder:text-slate-400 font-semibold transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-white border border-slate-100 animate-pulse rounded-[2.5rem]" />
             ))
        ) : filteredCustomers.map((customer) => (
          <motion.div 
            key={customer.id}
            whileHover={{ y: -8 }}
            className="bg-white border border-slate-100 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[50px] rounded-full -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        {customer.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight uppercase">{customer.firstName} {customer.lastName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{customer.username}</p>
                    </div>
                </div>
                <div className={`p-2.5 rounded-xl border shadow-sm ${customer.isActive ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                    {customer.isActive ? <UserCheck size={20} /> : <UserX size={20} />}
                </div>
            </div>

            <div className="space-y-4 mb-10 relative z-10">
                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <Mail size={16} className="text-slate-400" /> {customer.email}
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <Calendar size={16} className="text-slate-400" /> Gia nhập: {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <div className="flex items-center gap-3 text-blue-600 text-[10px] font-bold uppercase tracking-[0.15em]">
                    <Shield size={16} className="text-blue-400" /> {customer.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Chi tiêu</span>
                    <span className="text-slate-900 font-bold text-xl">${(customer.totalSpent || 0).toLocaleString()}</span>
                </div>
                <button 
                    onClick={() => handleToggleStatus(customer.id, customer.isActive)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm
                        ${customer.isActive ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-100'}`}
                >
                    {customer.isActive ? 'Vô hiệu hoá' : 'Kích hoạt'}
                </button>
            </div>
            
            <button className="absolute bottom-8 right-8 w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                <ChevronRight size={22} />
            </button>
          </motion.div>
        ))}
      </div>

      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
};

export default CustomerList;
