import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, 
  Calendar, Edit3, Camera,
  ChevronRight, AlertCircle, CheckCircle2, 
  Plus, Trash2, Home, Briefcase
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import userService from '../services/userService';
import addressService from '../services/addressService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('INFO'); // INFO, ADDRESSES, SECURITY
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    imageUrl: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchProfileData();
    fetchAddresses();
  }, []);

  const fetchProfileData = async () => {
    try {
      const data = await userService.getMyInfo();
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        imageUrl: data.imageUrl || ''
      });
      if (updateUser) updateUser(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getMyAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await userService.updateProfile(formData);
      if (updateUser) updateUser(updatedUser);
      setStatus({ type: 'success', message: 'Thông tin cá nhân đã được cập nhật thành công!' });
      setTimeout(() => {
        setIsEditing(false);
        setStatus({ type: '', message: '' });
      }, 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Cập nhật thất bại.' });
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      console.error('Failed to set default address', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 lg:pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="relative mb-12">
            <div className="h-48 lg:h-64 rounded-[3rem] bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative shadow-2xl shadow-blue-900/20">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
               <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-blue-600/20 to-transparent" />
            </div>
            
            <div className="absolute -bottom-10 left-10 flex items-end gap-6 flex-wrap">
              <div className="relative group">
                <input 
                  type="file" 
                  id="avatarInput" 
                  className="hidden" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        const updatedUser = await userService.uploadAvatar(file);
                        setFormData(prev => ({ ...prev, imageUrl: updatedUser.imageUrl }));
                        if (updateUser) updateUser(updatedUser);
                        setStatus({ type: 'success', message: 'Ảnh đại diện đã được cập nhật!' });
                      } catch (err) {
                        setStatus({ type: 'error', message: 'Không thể tải ảnh lên.' });
                      }
                    }
                  }}
                />
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl overflow-hidden">
                  <div className="w-full h-full rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-900 font-black text-4xl lg:text-5xl border border-slate-200 overflow-hidden">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `http://localhost:8089${formData.imageUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      formData.firstName?.charAt(0) || 'U'
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => document.getElementById('avatarInput').click()}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-xl border-4 border-white hover:scale-110 transition-transform"
                >
                  <Camera size={18} />
                </button>
              </div>
              
              <div className="mb-10">
                <h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight mb-1">
                  {(formData.firstName || formData.lastName) 
                    ? `${formData.firstName || ''} ${formData.lastName || ''}`.trim() 
                    : (user?.username || 'User')}
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-24">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-3 space-y-4">
              <TabButton 
                active={activeTab === 'INFO'} 
                onClick={() => setActiveTab('INFO')} 
                icon={<User size={20} />} 
                label="Thông tin cơ bản" 
              />
              <TabButton 
                active={activeTab === 'ADDRESSES'} 
                onClick={() => setActiveTab('ADDRESSES')} 
                icon={<MapPin size={20} />} 
                label="Sổ địa chỉ" 
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
               <AnimatePresence mode="wait">
                  {activeTab === 'INFO' && (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="glass-card p-8 lg:p-10 rounded-[2.5rem] border border-white shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <User size={24} />
                          </div>
                          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Hồ sơ cá nhân</h2>
                        </div>
                        {!isEditing && (
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
                          >
                            <Edit3 size={16} /> Chỉnh sửa
                          </button>
                        )}
                      </div>

                      {status.message && (
                        <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm font-bold ${
                          status.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                          {status.message}
                        </div>
                      )}

                      <form onSubmit={handleUpdate} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                          <ProfileField 
                            label="Họ" 
                            value={formData.lastName} 
                            isEditing={isEditing} 
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            icon={<User size={18} />}
                          />
                          <ProfileField 
                            label="Tên" 
                            value={formData.firstName} 
                            isEditing={isEditing} 
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            icon={<User size={18} />}
                          />
                          <div className="md:col-span-2">
                            <ProfileField 
                              label="Họ và tên đầy đủ" 
                              value={formData.fullName} 
                              isEditing={isEditing} 
                              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                              icon={<User size={18} />}
                            />
                          </div>
                          <ProfileField 
                            label="Email" 
                            value={formData.email} 
                            isEditing={isEditing} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            icon={<Mail size={18} />}
                            type="email"
                          />
                          <ProfileField 
                            label="Số điện thoại" 
                            value={formData.phoneNumber} 
                            isEditing={isEditing} 
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                            icon={<Phone size={18} />}
                          />
                        </div>

                        {isEditing && (
                          <div className="flex gap-4 pt-6 border-t border-slate-100">
                            <Button type="submit" className="px-12">Lưu thay đổi</Button>
                            <Button variant="outline" type="button" onClick={() => setIsEditing(false)} className="px-12">Hủy</Button>
                          </div>
                        )}
                      </form>
                    </motion.div>
                  )}

                  {activeTab === 'ADDRESSES' && (
                    <motion.div
                      key="addresses"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sổ địa chỉ</h2>
                        <Button size="sm" icon={Plus} className="rounded-xl">Thêm địa chỉ mới</Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.length > 0 ? addresses.map((addr) => (
                          <div key={addr.id} className={`glass-card p-6 rounded-[2.5rem] border transition-all ${addr.isDefault ? 'border-blue-600 bg-blue-50/30' : 'border-white bg-white'}`}>
                            <div className="flex justify-between items-start mb-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${addr.isDefault ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {addr.label === 'Công ty' ? <Briefcase size={18} /> : <Home size={18} />}
                              </div>
                              {addr.isDefault && (
                                <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Mặc định</span>
                              )}
                            </div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-1">{addr.fullName}</h3>
                            <p className="text-slate-500 text-sm mb-3 flex items-center gap-2"><Phone size={14} /> {addr.phone}</p>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">
                              {addr.address}, {addr.city}
                            </p>
                            <div className="flex items-center gap-2">
                              {!addr.isDefault && (
                                <button 
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                                >
                                  Đặt làm mặc định
                                </button>
                              )}
                              <div className="flex-grow" />
                              <button className="p-2 text-slate-400 hover:text-slate-900"><Edit3 size={16} /></button>
                              <button className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        )) : (
                          <div className="md:col-span-2 py-20 text-center bg-white rounded-[2.5rem] border border-white">
                            <MapPin size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">Bạn chưa có địa chỉ nào lưu lại.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
      active 
        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
        : 'text-slate-500 hover:bg-white hover:text-slate-900'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
      {icon}
    </div>
    <span className="font-black uppercase tracking-widest text-[10px]">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />}
  </button>
);

const ProfileField = ({ label, value, isEditing, onChange, icon, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    {isEditing ? (
      <Input
        value={value}
        onChange={onChange}
        type={type}
        icon={() => icon}
        className="bg-white border-slate-200"
      />
    ) : (
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[56px]">
        <div className="text-slate-400 shrink-0">{icon}</div>
        <span className="text-slate-900 font-bold">{value || '---'}</span>
      </div>
    )}
  </div>
);

export default Profile;
