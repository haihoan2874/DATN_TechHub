import axiosClient from '../api/axiosConfig';

const voucherService = {
  applyVoucher: (code) => {
    return axiosClient.get('/vouchers/apply', {
      params: { code }
    });
  }
};

export default voucherService;
