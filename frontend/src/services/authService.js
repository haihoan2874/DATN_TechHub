import axiosClient from '../api/axiosConfig';

const authService = {
  login: (credentials) => {
    const url = '/auth/login';
    return axiosClient.post(url, credentials);
  },

  register: (userData) => {
    const url = '/auth/register';
    return axiosClient.post(url, userData);
  },

  forgotPassword: (email) => {
    const url = '/auth/forgot-password';
    return axiosClient.post(url, { email });
  },

  verifyOtp: (data) => {
    const url = '/auth/verify-otp';
    return axiosClient.post(url, data);
  },

  resetPassword: (data) => {
    const url = '/auth/reset-password';
    return axiosClient.post(url, data);
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;
