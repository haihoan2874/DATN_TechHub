export const onlyDigits = (value, maxLength = 20) => {
  return String(value || '').replace(/\D/g, '').slice(0, maxLength);
};

export const isValidVietnamesePhone = (value) => {
  const phone = String(value || '').trim();
  return /^0\d{9,10}$/.test(phone);
};

export const validatePhone = (value, { required = true } = {}) => {
  const phone = String(value || '').trim();

  if (!phone) {
    return required ? 'Vui lòng nhập số điện thoại.' : '';
  }

  if (!isValidVietnamesePhone(phone)) {
    return 'Số điện thoại phải gồm 10-11 chữ số và bắt đầu bằng 0.';
  }

  return '';
};

export const validateCustomerAddress = (address) => {
  const errors = {};

  if (!address.fullName?.trim()) {
    errors.fullName = 'Vui lòng nhập họ tên người nhận.';
  }

  const phoneError = validatePhone(address.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  if (!address.postalCode?.trim()) {
    errors.postalCode = 'Vui lòng nhập mã bưu điện.';
  }

  if (!address.city?.trim()) {
    errors.city = 'Vui lòng nhập tỉnh hoặc thành phố.';
  }

  if (!address.address?.trim()) {
    errors.address = 'Vui lòng nhập địa chỉ chi tiết.';
  }

  return errors;
};

export const hasValidationErrors = (errors) => Object.values(errors).some(Boolean);
