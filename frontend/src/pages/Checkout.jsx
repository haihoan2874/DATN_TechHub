import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import addressService from '../services/addressService';
import voucherService from '../services/voucherService';
import { 
  MapPin, Phone, CreditCard,
  ChevronLeft,
  ArrowRight, AlertCircle, CheckCircle2,
  Plus, X, Tag
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  const [newAddress, setNewAddress] = useState({
    fullName: (user?.firstName && user?.lastName) ? `${user.lastName} ${user.firstName}` : (user?.username || ''),
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    isDefault: false
  });

  const [formData, setFormData] = useState({
    note: '',
    paymentMethod: 'COD'
  });
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems.length, cartLoading, navigate]);

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getMyAddresses();
      setAddresses(data);
      const defaultAddr = data.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (data.length > 0) setSelectedAddressId(data[0].id);
    } catch (error) {
      console.error('Failed to fetch addresses', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const finalTotal = Math.max(cartTotal - Number(appliedVoucher?.discountAmount || 0), 0);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng nhập mã giảm giá.' });
      return;
    }

    setVoucherLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const voucher = await voucherService.applyVoucher(voucherCode.trim());
      setAppliedVoucher(voucher);
      setVoucherCode(voucher.code);
      setStatus({ type: 'success', message: voucher.message || 'Áp dụng mã giảm giá thành công.' });
    } catch (error) {
      setAppliedVoucher(null);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn sử dụng.'
      });
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const created = await addressService.createAddress(newAddress);
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setShowAddressModal(false);
      setNewAddress({
        fullName: user ? `${user.lastName} ${user.firstName}` : '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        isDefault: false
      });
    } catch (error) {
      alert('Không thể thêm địa chỉ. Vui lòng kiểm tra lại.');
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0 || !selectedAddressId) {
      setStatus({ type: 'error', message: 'Vui lòng chọn địa chỉ giao hàng.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    const checkoutData = {
      shippingAddressId: selectedAddressId,
      paymentMethod: formData.paymentMethod,
      notes: formData.note,
      voucherCode: appliedVoucher?.code || null
    };

    try {
      const response = await orderService.checkout(checkoutData);
      
      if (formData.paymentMethod === 'VNPAY' && response.paymentUrl) {
        setStatus({ type: 'success', message: 'Đang chuyển hướng đến cổng thanh toán VNPay...' });
        await clearCart();
        window.location.href = response.paymentUrl;
        return;
      }

      setStatus({ type: 'success', message: 'Đặt hàng thành công! Đang chuyển hướng...' });
      setTimeout(async () => {
        await clearCart();
        navigate(`/order-success/${response.orderNumber || response.orderId}`);
      }, 2000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng.' 
      });
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 lg:pt-32 pb-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 lg:pt-32 pb-20">
      <div className="container mx-auto px-6">
        <Link to="/cart" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600">
          <ChevronLeft size={20} /> Quay lại giỏ hàng
        </Link>

        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">Kiểm tra địa chỉ, phương thức thanh toán và xác nhận đơn hàng</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Thanh toán</h1>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="lg:w-2/3 space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Địa chỉ nhận hàng</h2>
                    <p className="text-sm text-slate-500">Chọn địa chỉ dùng cho đơn hàng này</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50"
                >
                  <Plus size={18} /> Thêm địa chỉ mới
                </button>
              </div>

              {loadingAddresses ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <label 
                      key={addr.id}
                      className={`relative cursor-pointer rounded-2xl border p-5 transition-all ${
                        selectedAddressId === addr.id 
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm shadow-blue-600/5'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="address" 
                        className="hidden" 
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-slate-900">{addr.fullName}</div>
                        {addr.isDefault && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600">Mặc định</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                        <Phone size={14} /> {addr.phone}
                      </div>
                      <div className="flex items-start gap-2 text-slate-500 text-sm">
                        <MapPin size={14} className="mt-1 flex-shrink-0" />
                        <span className="line-clamp-2">{addr.address}, {addr.city}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                  <p className="text-slate-500 mb-4">Bạn chưa có địa chỉ nhận hàng nào.</p>
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                  >
                    Thêm ngay
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <AlertCircle size={22} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Ghi chú đơn hàng</h2>
              </div>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Tag size={22} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Mã giảm giá</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={voucherCode}
                  onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
                  disabled={Boolean(appliedVoucher)}
                  placeholder="Nhập mã giảm giá"
                  className="flex-grow rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold uppercase outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
                {appliedVoucher ? (
                  <Button type="button" variant="outline" onClick={handleRemoveVoucher} icon={X}>
                    Bỏ mã
                  </Button>
                ) : (
                  <Button type="button" onClick={handleApplyVoucher} isLoading={voucherLoading}>
                    Áp dụng
                  </Button>
                )}
              </div>

              {appliedVoucher && (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  Đã giảm {formatPrice(appliedVoucher.discountAmount)} cho đơn hàng này.
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <CreditCard size={22} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Phương thức thanh toán</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-5 transition-all ${
                  formData.paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="COD" 
                    checked={formData.paymentMethod === 'COD'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <div className="flex-grow">
                    <div className="font-bold text-slate-900">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-xs text-slate-500">Giao hàng và thu tiền tận nơi</div>
                  </div>
                </label>

                <label className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-5 transition-all ${
                  formData.paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="VNPAY" 
                    checked={formData.paymentMethod === 'VNPAY'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <div className="flex-grow">
                    <div className="font-bold text-slate-900">Thanh toán trực tuyến</div>
                    <div className="text-xs text-slate-500">Thẻ ngân hàng, Ví điện tử (VNPay)</div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <div className="lg:w-1/3">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Đơn hàng của bạn</h2>
              
              <div className="max-h-[300px] overflow-y-auto mb-6 pr-2 space-y-4 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      <img src={item.imageUrl || '/logo_final.png'} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</div>
                      <div className="text-xs text-slate-500">SL: {item.quantity} × {formatPrice(item.price)}</div>
                    </div>
                    <div className="font-bold text-slate-900 text-sm whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 py-6 border-t border-slate-100">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-slate-900">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-emerald-600 text-sm">
                    <span>Giảm giá ({appliedVoucher.code})</span>
                    <span className="font-bold">-{formatPrice(appliedVoucher.discountAmount)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-slate-900">Tổng thanh toán</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {status.message && (
                <div
                  className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
                    status.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {status.message}
                </div>
              )}

              <Button 
                onClick={handleSubmitOrder}
                disabled={!selectedAddressId}
                isLoading={isSubmitting}
                className="w-full"
                icon={ArrowRight}
              >
                Xác nhận đặt hàng
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Thêm địa chỉ mới"
      >
        <form onSubmit={handleAddAddress} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <Input
                label="Họ tên người nhận"
                name="fullName"
                required
                value={newAddress.fullName}
                onChange={handleNewAddressChange}
              />
            </div>
            <Input
              label="Số điện thoại"
              type="tel"
              name="phone"
              required
              value={newAddress.phone}
              onChange={handleNewAddressChange}
            />
            <Input
              label="Mã bưu điện"
              name="postalCode"
              required
              value={newAddress.postalCode}
              onChange={handleNewAddressChange}
            />
            <div className="col-span-1 md:col-span-2">
              <Input
                label="Thành phố / Tỉnh"
                name="city"
                required
                value={newAddress.city}
                onChange={handleNewAddressChange}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-900">Địa chỉ chi tiết</label>
              <textarea
                name="address"
                required
                rows="3"
                value={newAddress.address}
                onChange={handleNewAddressChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Số nhà, tên đường, phường/xã..."
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="group flex cursor-pointer items-center gap-3">
                <input 
                  type="checkbox" 
                  name="isDefault" 
                  checked={newAddress.isDefault}
                  onChange={handleNewAddressChange}
                  className="w-5 h-5 accent-blue-600 rounded-lg border-slate-200" 
                />
                <span className="text-sm font-semibold text-slate-600 transition-colors group-hover:text-slate-900">Đặt làm địa chỉ mặc định</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline" 
              className="flex-grow"
              onClick={() => setShowAddressModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit" 
              className="flex-grow"
            >
              Lưu địa chỉ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


export default Checkout;
