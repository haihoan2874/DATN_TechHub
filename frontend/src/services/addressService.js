import axiosClient from '../api/axiosConfig';

const addressService = {
  getMyAddresses: () => {
    return axiosClient.get('/addresses');
  },
  createAddress: (data) => {
    return axiosClient.post('/addresses', data);
  },
  updateAddress: (id, data) => {
    return axiosClient.put(`/addresses/${id}`, data);
  },
  deleteAddress: (id) => {
    return axiosClient.delete(`/addresses/${id}`);
  },
  setDefaultAddress: (id) => {
    return axiosClient.patch(`/addresses/${id}/default`);
  }
};

export default addressService;
