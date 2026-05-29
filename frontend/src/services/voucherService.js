import axiosClient from '../api/axiosConfig';

const voucherService = {
  applyVoucher: (code, selectedProductIds = []) => {
    return axiosClient.get('/vouchers/apply', {
      params: { code, selectedProductIds },
      paramsSerializer: {
        indexes: null
      }
    });
  }
};

export default voucherService;
