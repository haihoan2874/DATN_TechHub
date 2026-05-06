import axiosClient from '../api/axiosConfig';

const paymentService = {
  createVnPayUrl: (amount, orderId) => {
    return axiosClient.get('/payments/vnpay-create', {
      params: { amount, orderId }
    });
  }
};

export default paymentService;
