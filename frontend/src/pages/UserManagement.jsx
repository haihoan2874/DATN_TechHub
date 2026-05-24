import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search,
  Trash2, Shield, ShieldOff, UserCog,
  Mail, Phone, CheckCircle2,
  XCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import ConfirmModal from '../components/ui/ConfirmModal';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import Toolbar from '../components/layout/Toolbar';
import DataTable from '../components/data/DataTable';
import MetricCard from '../components/data/MetricCard';
import Pagination from '../components/data/Pagination';
import EmptyState from '../components/feedback/EmptyState';
import StatusBadge from '../components/status/StatusBadge';

const PAGE_SIZE = 8;

const tableColumns = [
  { key: 'user', label: 'Người dùng' },
  { key: 'contact', label: 'Liên hệ' },
  { key: 'role', label: 'Vai trò' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'actions', label: 'Thao tác', className: 'text-right' }
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  
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

  const metrics = useMemo(() => [
    { label: 'Tổng người dùng', value: users.length, icon: Users, tone: 'blue' },
    { label: 'Quản trị viên', value: users.filter((user) => user.role === 'ROLE_ADMIN').length, icon: Shield, tone: 'indigo' },
    { label: 'Đang hoạt động', value: users.filter((user) => user.isActive).length, icon: CheckCircle2, tone: 'green' },
    { label: 'Đã khóa', value: users.filter((user) => !user.isActive).length, icon: XCircle, tone: 'red' }
  ], [users]);

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return users.filter(user => {
      const matchesSearch =
        !keyword ||
        user.username?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.fullName?.toLowerCase().includes(keyword);
      const matchesRole = filterRole === 'ALL' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Hệ thống tài khoản"
        title="Người dùng"
        description="Theo dõi tài khoản, vai trò và trạng thái truy cập của người dùng hệ thống."
        icon={Users}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <Toolbar>
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex w-full items-center gap-2 overflow-x-auto lg:w-auto">
              {['ALL', 'ROLE_ADMIN', 'ROLE_USER'].map(role => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    filterRole === role
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {role === 'ALL' ? 'Tất cả' : role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                </button>
              ))}
        </div>
        <span className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          {filteredUsers.length} người dùng
        </span>
        <button onClick={fetchUsers} className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </Toolbar>

      <DataTable
        columns={tableColumns}
        footer={!loading && filteredUsers.length > 0 ? (
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredUsers.length}
            onPageChange={setCurrentPage}
          />
        ) : null}
      >
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-5 py-4"><div className="h-5 w-full rounded bg-slate-100"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6"><EmptyState title="Không có người dùng" description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm." /></td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          {user.imageUrl ? (
                            <img src={user.imageUrl} alt={user.username} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm font-bold text-white">
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-950">{user.fullName || user.username}</div>
                          <div className="mt-1 text-xs font-medium text-slate-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Mail size={12} className="text-slate-300" />
                          {user.email}
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <Phone size={12} className="text-slate-200" />
                            {user.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge tone={user.role === 'ROLE_ADMIN' ? 'blue' : 'slate'} icon={user.role === 'ROLE_ADMIN' ? Shield : Users}>
                        {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge tone={user.isActive ? 'green' : 'red'} icon={user.isActive ? CheckCircle2 : XCircle}>
                        {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                          className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
                          title="Đổi vai trò"
                        >
                          <UserCog size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelectedUser(user); setShowStatusModal(true); }}
                          className={`rounded-lg p-2 text-slate-500 ${user.isActive ? 'hover:bg-rose-50 hover:text-rose-700' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {user.isActive ? <ShieldOff size={16} /> : <Shield size={16} />}
                        </button>
                        <button 
                          onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                          title="Xóa người dùng"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
      </DataTable>

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

      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Đổi vai trò người dùng"
        footer={<Button variant="outline" onClick={() => setShowRoleModal(false)}>Đóng</Button>}
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-500">
            Chọn vai trò mới cho tài khoản <span className="font-semibold text-slate-900">@{selectedUser?.username}</span>.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => handleChangeRole('ROLE_USER')}
              className={`rounded-2xl border p-5 text-left transition-colors ${selectedUser?.role === 'ROLE_USER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <Users size={22} />
              <span className="mt-3 block text-sm font-semibold">Khách hàng</span>
              <span className="mt-1 block text-xs text-slate-500">Mua hàng, quản lý đơn, đánh giá sản phẩm.</span>
            </button>
            <button
              onClick={() => handleChangeRole('ROLE_ADMIN')}
              className={`rounded-2xl border p-5 text-left transition-colors ${selectedUser?.role === 'ROLE_ADMIN' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <Shield size={22} />
              <span className="mt-3 block text-sm font-semibold">Quản trị viên</span>
              <span className="mt-1 block text-xs text-slate-500">Truy cập phân hệ quản trị và dữ liệu vận hành.</span>
            </button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default UserManagement;
