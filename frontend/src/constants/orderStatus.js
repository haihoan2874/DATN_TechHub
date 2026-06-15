export const ORDER_STATUS_VALUES = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
];

export const ORDER_STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang chuẩn bị hàng',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy'
};

export const ORDER_STATUS_TRANSITIONS = {
  PENDING: ['PENDING', 'PROCESSING', 'CANCELLED'],
  PROCESSING: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  SHIPPED: ['SHIPPED', 'DELIVERED'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCELLED']
};

export const ORDER_TERMINAL_STATUSES = ['DELIVERED', 'CANCELLED'];

export const getOrderStatusLabel = (status) => ORDER_STATUS_LABELS[status] || status;
