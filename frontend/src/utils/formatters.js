const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN');

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export const formatCurrency = (value) => {
  return currencyFormatter.format(Number(value || 0));
};

export const formatDate = (value) => {
  if (!value) return '---';
  return dateFormatter.format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) return '---';
  return dateTimeFormatter.format(new Date(value));
};
