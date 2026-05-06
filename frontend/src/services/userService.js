import axiosClient from '../api/axiosConfig';

const userService = {
  getMyInfo: () => {
    return axiosClient.get('/users/me');
  },
  updateProfile: (data) => {
    return axiosClient.put('/users/profile', data);
  },
  changePassword: (data) => {
    return axiosClient.put('/users/change-password', data);
  },
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default userService;
