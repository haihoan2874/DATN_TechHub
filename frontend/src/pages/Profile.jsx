import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Camera,
  Edit3,
  Home,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import addressService from '../services/addressService';
import userService from '../services/userService';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { resolveApiAssetUrl } from '../config/api';
import { hasValidationErrors, onlyDigits, validateCustomerAddress, validatePhone } from '../utils/formValidation';

const emptyAddressForm = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  isDefault: false
};

const getAvatarUrl = (imageUrl) => {
  return resolveApiAssetUrl(imageUrl, '');
};

const getDisplayName = (profile, fallback = 'Người dùng') => {
  const lastName = profile?.lastName && profile.lastName !== 'null' ? profile.lastName.trim() : '';
  const firstName = profile?.firstName && profile.firstName !== 'null' ? profile.firstName.trim() : '';
  const fullName = `${lastName} ${firstName}`.trim();
  return fullName || profile?.fullName || fallback;
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('INFO');
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
  const [savedFormData, setSavedFormData] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressErrors, setAddressErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const displayName = useMemo(
    () => getDisplayName(formData, user?.username || 'Người dùng'),
    [formData, user?.username]
  );

  const defaultAddress = useMemo(() => addresses.find((address) => address.isDefault), [addresses]);

  const fetchProfileData = useCallback(async () => {
    try {
      const data = await userService.getMyInfo();
      const nextFormData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        imageUrl: data.imageUrl || ''
      };
      setFormData(nextFormData);
      setSavedFormData(nextFormData);
      if (updateUser) updateUser(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      toast.error('Không thể tải hồ sơ cá nhân.');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await addressService.getMyAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
    fetchAddresses();
  }, [fetchProfileData, fetchAddresses]);

  const handleUploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh.');
      event.target.value = '';
      return;
    }


    try {
      const updatedUser = await userService.uploadAvatar(file);
      setFormData((prev) => ({ ...prev, imageUrl: updatedUser.imageUrl }));
      if (updateUser) updateUser(updatedUser);
      toast.success('Ảnh đại diện đã được cập nhật.');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Không thể tải ảnh lên.';
      toast.error(message);
    } finally {
      event.target.value = '';
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const nextProfileErrors = {
      phoneNumber: validatePhone(formData.phoneNumber, { required: false })
    };
    setProfileErrors(nextProfileErrors);

    if (hasValidationErrors(nextProfileErrors)) {
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        imageUrl: formData.imageUrl
      };
      const updatedUser = await userService.updateProfile(payload);
      const nextFormData = {
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        fullName: updatedUser.fullName || '',
        email: updatedUser.email || '',
        phoneNumber: updatedUser.phoneNumber || '',
        imageUrl: updatedUser.imageUrl || ''
      };
      setFormData(nextFormData);
      setSavedFormData(nextFormData);
      if (updateUser) updateUser(updatedUser);
      toast.success('Thông tin cá nhân đã được cập nhật.');
      setIsEditing(false);
      setProfileErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại.');
    }
  };

  const handleCancelEdit = () => {
    if (savedFormData) {
      setFormData(savedFormData);
    }
    setProfileErrors({});
    setIsEditing(false);
  };

  const handleProfileChange = (field) => (event) => {
    const nextValue = field === 'phoneNumber' ? onlyDigits(event.target.value, 11) : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: nextValue
    }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const openAddressModal = (address = null) => {
    setEditingAddress(address);
    setAddressForm(address ? {
      fullName: address.fullName || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      postalCode: address.postalCode || '',
      isDefault: Boolean(address.isDefault)
    } : {
      ...emptyAddressForm,
      fullName: displayName === 'Người dùng' ? '' : displayName,
      phone: formData.phoneNumber || ''
    });
    setAddressErrors({});
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    if (addressSubmitting) return;
    setAddressModalOpen(false);
    setEditingAddress(null);
    setAddressForm(emptyAddressForm);
    setAddressErrors({});
  };

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = ['phone', 'postalCode'].includes(name) ? onlyDigits(value, name === 'phone' ? 11 : 20) : value;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : nextValue
    }));
    if (addressErrors[name]) {
      setAddressErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();
    const validationErrors = validateCustomerAddress(addressForm);
    setAddressErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    setAddressSubmitting(true);
    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, addressForm);
        toast.success('Địa chỉ nhận hàng đã được cập nhật.');
      } else {
        await addressService.createAddress(addressForm);
        toast.success('Địa chỉ nhận hàng đã được thêm.');
      }
      closeAddressModal();
      await fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể lưu địa chỉ.');
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      await fetchAddresses();
      toast.success('Đã đặt địa chỉ mặc định.');
    } catch (err) {
      toast.error('Không thể đặt địa chỉ mặc định.');
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteTarget) return;
    try {
      await addressService.deleteAddress(deleteTarget.id);
      setDeleteTarget(null);
      await fetchAddresses();
      toast.success('Địa chỉ đã được xóa.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa địa chỉ.');
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-6 sm:py-8 lg:py-10">
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteAddress}
        title="Xóa địa chỉ"
        message={`Bạn có chắc chắn muốn xóa địa chỉ của ${deleteTarget?.fullName || 'người nhận'}?`}
        confirmText="Xóa địa chỉ"
        variant="danger"
      />

      <Modal
        isOpen={addressModalOpen}
        onClose={closeAddressModal}
        title={editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
        size="lg"
        closeOnOverlay={!addressSubmitting}
      >
        <form onSubmit={handleSaveAddress} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                label="Họ tên người nhận"
                name="fullName"
                value={addressForm.fullName}
                onChange={handleAddressChange}
                error={addressErrors.fullName}
              />
            </div>
            <Input
              label="Số điện thoại"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={11}
              value={addressForm.phone}
              onChange={handleAddressChange}
              error={addressErrors.phone}
            />
            <Input
              label="Mã bưu điện"
              name="postalCode"
              inputMode="numeric"
              maxLength={20}
              value={addressForm.postalCode}
              onChange={handleAddressChange}
              error={addressErrors.postalCode}
            />
            <Input
              label="Tỉnh / Thành phố"
              name="city"
              value={addressForm.city}
              onChange={handleAddressChange}
              className="md:col-span-2"
              error={addressErrors.city}
            />
            <div className="md:col-span-2">
              <label className="form-label mb-2 block">Địa chỉ chi tiết</label>
              <textarea
                name="address"
                rows={3}
                value={addressForm.address}
                onChange={handleAddressChange}
                aria-invalid={Boolean(addressErrors.address)}
                aria-describedby={addressErrors.address ? 'profile-address-error' : undefined}
                className={`form-textarea ${addressErrors.address ? 'border-rose-500 bg-rose-50/30' : ''}`}
                placeholder="Số nhà, tên đường, phường/xã..."
              />
              {addressErrors.address && (
                <span id="profile-address-error" className="mt-2 block text-xs font-semibold text-rose-600">
                  {addressErrors.address}
                </span>
              )}
            </div>
            <label className="md:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleAddressChange}
                className="h-4 w-4 accent-blue-600"
              />
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={closeAddressModal} disabled={addressSubmitting}>
              Hủy
            </Button>
            <Button type="submit" icon={Save} isLoading={addressSubmitting}>
              Lưu địa chỉ
            </Button>
          </div>
        </form>
      </Modal>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-500">Quản lý thông tin cá nhân và địa chỉ nhận hàng</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 lg:text-3xl">Hồ sơ cá nhân</h1>
          </div>

          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="avatarInput"
                  className="hidden"
                  accept="image/*"
                  onChange={handleUploadAvatar}
                />
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-xl font-bold text-slate-900 sm:h-20 sm:w-20 sm:text-2xl">
                    {formData.imageUrl ? (
                      <img src={getAvatarUrl(formData.imageUrl)} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatarInput').click()}
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700"
                    aria-label="Cập nhật ảnh đại diện"
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{displayName}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">{formData.email || user?.email || 'Chưa có email'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 md:min-w-[360px]">
                <ProfileMiniStat label="Số địa chỉ" value={`${addresses.length} địa chỉ`} icon={MapPin} />
                <ProfileMiniStat label="Mặc định" value={defaultAddress?.city || 'Chưa chọn'} icon={Home} />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <TabButton
                active={activeTab === 'INFO'}
                onClick={() => setActiveTab('INFO')}
                icon={User}
                label="Thông tin cơ bản"
              />
              <TabButton
                active={activeTab === 'ADDRESSES'}
                onClick={() => setActiveTab('ADDRESSES')}
                icon={MapPin}
                label="Sổ địa chỉ"
              />
            </aside>

            <main>
              {activeTab === 'INFO' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Thông tin cơ bản</h2>
                      <p className="mt-1 text-sm text-slate-500">Thông tin dùng để đăng nhập, liên hệ và nhận hỗ trợ.</p>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} icon={Edit3}>
                        Chỉnh sửa
                      </Button>
                    )}
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {[...Array(5)].map((_, index) => (
                        <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={handleUpdate} className="space-y-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <ProfileField
                          label="Họ"
                          value={formData.lastName}
                          isEditing={isEditing}
                          onChange={handleProfileChange('lastName')}
                          icon={User}
                        />
                        <ProfileField
                          label="Tên"
                          value={formData.firstName}
                          isEditing={isEditing}
                          onChange={handleProfileChange('firstName')}
                          icon={User}
                        />
                        <ProfileField
                          label="Email"
                          value={formData.email}
                          isEditing={isEditing}
                          onChange={handleProfileChange('email')}
                          icon={Mail}
                          type="email"
                        />
                        <ProfileField
                          label="Số điện thoại"
                          value={formData.phoneNumber}
                          isEditing={isEditing}
                          onChange={handleProfileChange('phoneNumber')}
                          icon={Phone}
                          type="tel"
                          inputMode="numeric"
                          maxLength={11}
                          error={profileErrors.phoneNumber}
                        />
                      </div>

                      {isEditing && (
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                          <Button type="button" variant="outline" onClick={handleCancelEdit}>
                            Hủy
                          </Button>
                          <Button type="submit" icon={Save}>
                            Lưu thay đổi
                          </Button>
                        </div>
                      )}
                    </form>
                  )}
                </section>
              )}

              {activeTab === 'ADDRESSES' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Sổ địa chỉ</h2>
                      <p className="mt-1 text-sm text-slate-500">Địa chỉ được dùng khi đặt hàng và thanh toán.</p>
                    </div>
                    <Button icon={Plus} onClick={() => openAddressModal()}>
                      Thêm địa chỉ
                    </Button>
                  </div>

                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {addresses.map((address) => (
                        <AddressCard
                          key={address.id}
                          address={address}
                          onEdit={() => openAddressModal(address)}
                          onDelete={() => setDeleteTarget(address)}
                          onSetDefault={() => handleSetDefaultAddress(address.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                      <MapPin size={42} className="mx-auto mb-3 text-slate-300" />
                      <h3 className="text-base font-bold text-slate-900">Chưa có địa chỉ nhận hàng</h3>
                      <p className="mt-1 text-sm text-slate-500">Thêm địa chỉ để quá trình thanh toán nhanh hơn.</p>
                      <Button className="mt-5" icon={Plus} onClick={() => openAddressModal()}>
                        Thêm địa chỉ
                      </Button>
                    </div>
                  )}
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
      active
        ? 'bg-slate-900 text-white'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const ProfileMiniStat = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      <Icon size={14} />
      {label}
    </div>
    <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
  </div>
);

const ProfileField = ({ label, value, isEditing, onChange, icon: Icon, type = 'text', className = '', error, ...inputProps }) => (
  <div className={className}>
    {isEditing ? (
      <Input label={label} value={value} onChange={onChange} type={type} icon={Icon} error={error} {...inputProps} />
    ) : (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Icon size={17} className="shrink-0 text-slate-400" />
          <span className="break-words text-sm font-semibold text-slate-900">{value || '---'}</span>
        </div>
      </div>
    )}
  </div>
);

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => (
  <article className={`rounded-2xl border p-5 transition-colors ${
    address.isDefault ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white'
  }`}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        address.isDefault ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
      }`}>
        {address.label === 'Công ty' ? <Briefcase size={18} /> : <Home size={18} />}
      </div>
      {address.isDefault && (
        <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white">Mặc định</span>
      )}
    </div>

    <h3 className="text-base font-bold text-slate-900">{address.fullName}</h3>
    <div className="mt-2 space-y-2 text-sm text-slate-500">
      <p className="flex items-center gap-2">
        <Phone size={14} />
        {address.phone}
      </p>
      <p className="flex items-start gap-2 leading-relaxed">
        <MapPin size={14} className="mt-0.5 shrink-0" />
        <span>{address.address}{address.city ? `, ${address.city}` : ''}</span>
      </p>
    </div>

    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
      {!address.isDefault && (
        <button
          type="button"
          onClick={onSetDefault}
          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100"
        >
          Đặt mặc định
        </button>
      )}
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Sửa địa chỉ"
        >
          <Edit3 size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          aria-label="Xóa địa chỉ"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </article>
);

export default Profile;
