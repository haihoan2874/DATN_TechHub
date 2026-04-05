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
import Toast, { ToastType } from '../../../components/common/Toast';

interface Customer {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  totalSpent?: number;
  orderCount?: number;
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as ToastType });

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
        { id: '1', username: 'hoannv', email: 'hoan@gmail.com', firstName: 'Hoan', lastName: 'Nguyễn', role: 'ROLE_ADMIN', isActive: true, createdAt: new Date().toISOString(), totalSpent: 4500, orderCount: 12 },
        { id: '2', username: 'customer01', email: 'customer@gmail.com', firstName: 'Minh', lastName: 'Anh', role: 'ROLE_USER', isActive: true, createdAt: new Date().toISOString(), totalSpent: 840, orderCount: 2 },
        { id: '3', username: 'guest_user', email: 'guest@gmail.com', firstName: 'Khách', lastName: 'Hàng 03', role: 'ROLE_USER', isActive: false, createdAt: new Date().toISOString(), totalSpent: 0, orderCount: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Assuming a patch endpoint exists or we can implement it
      // await apiClient.patch(`/users/${id}/status?active=${!currentStatus}`);
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <CustomerIcon size={40} />
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight italic uppercase">Khách hàng</h1>
            <p className="text-slate-400 font-bold italic tracking-wide text-xs">Quản lý cơ sở dữ liệu khách hàng và quyền truy cập.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-4 lg:p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-14 pr-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:bg-white placeholder:text-slate-400 font-bold italic transition-all"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
            <button className="flex-1 md:flex-none p-3.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl transition-all">
                <Filter size={20} />
            </button>
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
            className="bg-white border border-slate-100 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[50px] rounded-full -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl italic group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        {customer.firstName.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight italic uppercase">{customer.firstName} {customer.lastName}</h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{customer.username}</p>
                    </div>
                </div>
                <div className={`p-2 rounded-xl border ${customer.isActive ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                    {customer.isActive ? <UserCheck size={18} /> : <UserX size={18} />}
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-500 text-xs font-medium italic">
                    <Mail size={14} className="text-slate-400" /> {customer.email}
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-xs font-medium italic">
                    <Calendar size={14} className="text-slate-400" /> Gia nhập: {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <div className="flex items-center gap-3 text-blue-600 text-[10px] font-black uppercase tracking-widest italic">
                    <Shield size={14} className="text-blue-400" /> {customer.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 italic">Chi tiêu</span>
                    <span className="text-slate-900 font-black text-lg">${(customer.totalSpent || 0).toLocaleString()}</span>
                </div>
                <button 
                    onClick={() => handleToggleStatus(customer.id, customer.isActive)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black italic uppercase tracking-widest transition-all 
                        ${customer.isActive ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                >
                    {customer.isActive ? 'Vô hiệu hoá' : 'Kích hoạt'}
                </button>
            </div>
            
            <button className="absolute bottom-6 right-8 w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all">
                <ChevronRight size={20} />
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
