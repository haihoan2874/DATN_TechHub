import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import { hasValidationErrors, onlyDigits, validateCustomerAddress } from '../utils/formValidation';

const Checkout = () => {
  const { cartItems, fetchCart, cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProductIds] = useState(() => {
    if (location.state?.selectedProductIds?.length) {
      return location.state.selectedProductIds;
    }

    try {
      return JSON.parse(sessionStorage.getItem('checkoutProductIds') || '[]');
    } catch (error) {
      return [];
    }
  });
  
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
  const [newAddressErrors, setNewAddressErrors] = useState({});

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

  const selectedIdSet = useMemo(() => new Set(selectedProductIds), [selectedProductIds]);
  const checkoutItems = useMemo(() => {
    if (selectedProductIds.length === 0) return cartItems;
    return cartItems.filter((item) => selectedIdSet.has(item.id));
  }, [cartItems, selectedIdSet, selectedProductIds.length]);
  const checkoutTotal = useMemo(
    () => checkoutItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0),
    [checkoutItems]
  );
  const finalTotal = Math.max(checkoutTotal - Number(appliedVoucher?.discountAmount || 0), 0);

  useEffect(() => {
    if (!cartLoading && cartItems.length > 0 && checkoutItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems.length, cartLoading, checkoutItems.length, navigate]);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng nhập mã giảm giá.' });
      return;
    }

    setVoucherLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const voucher = await voucherService.applyVoucher(voucherCode.trim(), checkoutItems.map((item) => item.id));
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
    const nextValue = ['phone', 'postalCode'].includes(name) ? onlyDigits(value, name === 'phone' ? 11 : 20) : value;
    setNewAddress({
      ...newAddress,
      [name]: type === 'checkbox' ? checked : nextValue
    });
    if (newAddressErrors[name]) {
      setNewAddressErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const validationErrors = validateCustomerAddress(newAddress);
    setNewAddressErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    try {
      const created = await addressService.createAddress(newAddress);
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setShowAddressModal(false);
      setNewAddressErrors({});
      setNewAddress({
        fullName: user ? `${user.lastName} ${user.firstName}` : '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        isDefault: false
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể thêm địa chỉ. Vui lòng kiểm tra lại.';
      setStatus({ type: 'error', message });
      toast.error(message);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (checkoutItems.length === 0 || !selectedAddressId) {
      setStatus({ type: 'error', message: 'Vui lòng chọn địa chỉ giao hàng.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    const checkoutData = {
      shippingAddressId: selectedAddressId,
      paymentMethod: formData.paymentMethod,
      notes: formData.note,
      voucherCode: appliedVoucher?.code || null,
      selectedProductIds: checkoutItems.map((item) => item.id)
    };

    try {
      const response = await orderService.checkout(checkoutData);
      
      if (formData.paymentMethod === 'VNPAY' && response.paymentUrl) {
        setStatus({ type: 'success', message: 'Đang chuyển hướng đến cổng thanh toán VNPay...' });
        sessionStorage.removeItem('checkoutProductIds');
        await fetchCart();
        window.location.href = response.paymentUrl;
        return;
      }

      setStatus({ type: 'success', message: 'Đặt hàng thành công! Đang chuyển hướng...' });
      sessionStorage.removeItem('checkoutProductIds');
      fetchCart();
      navigate('/orders', { replace: true });
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent py-6 sm:py-8 lg:py-10">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <Link to="/cart" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600">
          <ChevronLeft size={20} /> Quay lại giỏ hàng
        </Link>

        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500">Kiểm tra địa chỉ, phương thức thanh toán và xác nhận đơn hàng</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 lg:text-3xl">Thanh toán</h1>
          <p className="mt-2 text-sm text-slate-500">
            Đang thanh toán {checkoutItems.length} sản phẩm đã chọn từ giỏ hàng.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                  type="button"
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
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {addresses.map(addr => (
                    <label 
                      key={addr.id}
                      className={`relative cursor-pointer rounded-2xl border p-4 transition-all ${
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
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                  >
                    Thêm ngay
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <AlertCircle size={22} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Ghi chú đơn hàng</h2>
              </div>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="form-textarea min-h-[100px]"
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
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
                  Đã giảm {formatCurrency(appliedVoucher.discountAmount)} cho đơn hàng này.
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <CreditCard size={22} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Phương thức thanh toán</h2>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

          <div>
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-5 text-lg font-bold text-slate-900">Đơn hàng của bạn</h2>
              
              <div className="custom-scrollbar mb-5 max-h-[260px] space-y-3 overflow-y-auto pr-2">
                {checkoutItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      <img
                        src={item.imageUrl || '/logo_final.png'}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</div>
                      <div className="text-xs text-slate-500">SL: {item.quantity} × {formatCurrency(item.price)}</div>
                    </div>
                    <div className="font-bold text-slate-900 text-sm whitespace-nowrap">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-100 py-5">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(checkoutTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-emerald-600 text-sm">
                    <span>Giảm giá ({appliedVoucher.code})</span>
                    <span className="font-bold">-{formatCurrency(appliedVoucher.discountAmount)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-slate-900">Tổng thanh toán</span>
                  <span className="text-xl font-bold text-blue-600 sm:text-2xl">
                    {formatCurrency(finalTotal)}
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
        onClose={() => {
          setShowAddressModal(false);
          setNewAddressErrors({});
        }}
        title="Thêm địa chỉ mới"
      >
        <form onSubmit={handleAddAddress} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <Input
                label="Họ tên người nhận"
                name="fullName"
                value={newAddress.fullName}
                onChange={handleNewAddressChange}
                error={newAddressErrors.fullName}
              />
            </div>
            <Input
              label="Số điện thoại"
              type="tel"
              name="phone"
              inputMode="numeric"
              maxLength={11}
              value={newAddress.phone}
              onChange={handleNewAddressChange}
              error={newAddressErrors.phone}
            />
            <Input
              label="Mã bưu điện"
              name="postalCode"
              inputMode="numeric"
              maxLength={20}
              value={newAddress.postalCode}
              onChange={handleNewAddressChange}
              error={newAddressErrors.postalCode}
            />
            <div className="col-span-1 md:col-span-2">
              <Input
                label="Thành phố / Tỉnh"
                name="city"
                value={newAddress.city}
                onChange={handleNewAddressChange}
                error={newAddressErrors.city}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="form-label mb-2 block">Địa chỉ chi tiết</label>
              <textarea
                name="address"
                rows="3"
                value={newAddress.address}
                onChange={handleNewAddressChange}
                aria-invalid={Boolean(newAddressErrors.address)}
                aria-describedby={newAddressErrors.address ? 'checkout-address-error' : undefined}
                className={`form-textarea ${newAddressErrors.address ? 'border-rose-500 bg-rose-50/30' : ''}`}
                placeholder="Số nhà, tên đường, phường/xã..."
              />
              {newAddressErrors.address && (
                <span id="checkout-address-error" className="mt-2 block text-xs font-semibold text-rose-600">
                  {newAddressErrors.address}
                </span>
              )}
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
              onClick={() => {
                setShowAddressModal(false);
                setNewAddressErrors({});
              }}
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
