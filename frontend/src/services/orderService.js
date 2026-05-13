import axiosClient from '../api/axiosConfig';

const orderService = {
  createOrder: (orderData) => {
    const url = '/orders';
    return axiosClient.post(url, orderData);
  },

  getMyOrders: () => {
    const url = '/orders/my-orders';
    return axiosClient.get(url);
  },

  getOrderDetail: (orderId) => {
    const url = `/orders/${orderId}`;
    return axiosClient.get(url);
  },

  cancelOrder: (orderId) => {
    const url = `/orders/${orderId}/cancel`;
    return axiosClient.patch(url);
  }
};

export default orderService;
