import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MoreHorizontal, 
  Trash2, Shield, ShieldOff, UserCog, 
  Mail, Phone, Calendar, CheckCircle2, 
  XCircle, ChevronRight, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import ConfirmModal from '../components/ui/ConfirmModal';
import Button from '../components/ui/Button';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  
  // Selection & Actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.data || response);
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(selectedUser.id);
      toast.success('Đã xóa người dùng khỏi hệ thống');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const handleToggleStatus = async () => {
    try {
      await adminService.toggleUserStatus(selectedUser.id);
      toast.success(selectedUser.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      setShowStatusModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleChangeRole = async (newRole) => {
    try {
      await adminService.updateUserRole(selectedUser.id, newRole);
      toast.success(`Đã chuyển vai trò thành ${newRole === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng'}`);
      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Lỗi khi cập nhật vai trò');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
            <Users size={14} />
            Hệ thống tài khoản
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Người dùng</h1>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Tổng số User', val: users.length, icon: Users, color: 'blue' },
           { label: 'Quản trị viên', val: users.filter(u => u.role === 'ROLE_ADMIN').length, icon: Shield, color: 'indigo' },
           { label: 'Đang hoạt động', val: users.filter(u => u.isActive).length, icon: CheckCircle2, color: 'emerald' },
           { label: 'Đã bị khóa', val: users.filter(u => !u.isActive).length, icon: XCircle, color: 'rose' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                 <stat.icon size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                 <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
           <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {['ALL', 'ROLE_ADMIN', 'ROLE_USER'].map(role => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${filterRole === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {role === 'ALL' ? 'Tất cả' : role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                </button>
              ))}
           </div>
           <button onClick={fetchUsers} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="pl-10 pr-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Người dùng</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Liên hệ</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Vai trò</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Ngày tạo</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-10 py-8"><div className="h-6 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="pl-10 pr-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                          {user.imageUrl ? (
                            <img src={user.imageUrl} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-black text-lg">
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.fullName || user.username}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Mail size={12} className="text-slate-300" />
                          {user.email}
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                            <Phone size={12} className="text-slate-200" />
                            {user.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'ROLE_ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                        {user.role === 'ROLE_ADMIN' ? <Shield size={10} /> : <Users size={10} />}
                        {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.isActive ? 'Active' : 'Blocked'}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                          title="Đổi vai trò"
                        >
                          <UserCog size={18} />
                        </button>
                        <button 
                          onClick={() => { setSelectedUser(user); setShowStatusModal(true); }}
                          className={`p-3 transition-all rounded-2xl ${user.isActive ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {user.isActive ? <ShieldOff size={18} /> : <Shield size={18} />}
                        </button>
                        <button 
                          onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                          title="Xóa người dùng"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="XÓA NGƯỜI DÙNG"
        message={`Hành động này sẽ xóa vĩnh viễn tài khoản @${selectedUser?.username} khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?`}
        variant="danger"
      />

      <ConfirmModal 
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleToggleStatus}
        title={selectedUser?.isActive ? "KHÓA TÀI KHOẢN" : "MỞ KHÓA TÀI KHOẢN"}
        message={selectedUser?.isActive 
          ? `Người dùng @${selectedUser?.username} sẽ không thể đăng nhập vào hệ thống nữa. Bạn xác nhận muốn khóa?`
          : `Tài khoản @${selectedUser?.username} sẽ được khôi phục quyền truy cập. Bạn xác nhận?`}
        variant={selectedUser?.isActive ? "danger" : "warning"}
      />

      {/* Role Change Modal (Custom logic) */}
      <AnimatePresence>
        {showRoleModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8 text-center">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto">
                  <UserCog size={40} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Đổi vai trò người dùng</h3>
                  <p className="text-slate-500 font-medium">Chọn vai trò mới cho tài khoản <span className="font-bold text-slate-900">@{selectedUser?.username}</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleChangeRole('ROLE_USER')}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${selectedUser?.role === 'ROLE_USER' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <Users size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Khách hàng</span>
                  </button>
                  <button 
                    onClick={() => handleChangeRole('ROLE_ADMIN')}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${selectedUser?.role === 'ROLE_ADMIN' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <Shield size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Quản trị viên</span>
                  </button>
                </div>
                <div className="pt-4 flex gap-4">
                  <Button onClick={() => setShowRoleModal(false)} className="flex-1 bg-slate-100 text-slate-900 hover:bg-slate-200">Hủy</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
