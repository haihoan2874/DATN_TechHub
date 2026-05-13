import axiosClient from '../api/axiosConfig';

const adminService = {
  // Products
  getProducts: (params) => {
    return axiosClient.get('/products', { params });
  },
  createProduct: (data) => {
    return axiosClient.post('/products', data);
  },
  updateProduct: (id, data) => {
    return axiosClient.put(`/products/${id}`, data);
  },
  deleteProduct: (id) => {
    return axiosClient.delete(`/products/${id}`);
  },
  updateStock: (id, quantity) => {
    return axiosClient.patch(`/products/${id}/stock`, { stockQuantity: quantity });
  },

  // Orders
  getAllOrders: () => {
    return axiosClient.get('/orders');
  },
  updateOrderStatus: (id, status) => {
    return axiosClient.put(`/orders/${id}/status`, null, { params: { status } });
  },

  // Users
  getAllUsers: () => {
    return axiosClient.get('/users');
  },
  deleteUser: (id) => {
    return axiosClient.delete(`/users/${id}`);
  },
  toggleUserStatus: (id) => {
    return axiosClient.put(`/users/${id}/status`);
  },
  updateUserRole: (id, role) => {
    return axiosClient.put(`/users/${id}/role`, null, { params: { role } });
  },

  // Categories
  getCategories: () => {
    return axiosClient.get('/categories');
  },
  createCategory: (data) => {
    return axiosClient.post('/categories', data);
  },
  updateCategory: (id, data) => {
    return axiosClient.put(`/categories/${id}`, data);
  },
  deleteCategory: (id) => {
    return axiosClient.delete(`/categories/${id}`);
  },

  // Brands
  getBrands: () => {
    return axiosClient.get('/brands');
  },
  createBrand: (data) => {
    return axiosClient.post('/brands', data);
  },
  updateBrand: (id, data) => {
    return axiosClient.put(`/brands/${id}`, data);
  },
  deleteBrand: (id) => {
    return axiosClient.delete(`/brands/${id}`);
  },

  // Dashboard & System
  getDashboardStats: () => {
    return axiosClient.get('/admin/dashboard/stats');
  },
  uploadFile: (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return axiosClient.post('/admin/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Reviews
  getAllReviews: () => {
    return axiosClient.get('/reviews');
  },
  deleteReview: (id) => {
    return axiosClient.delete(`/reviews/${id}`);
  },

  // Vouchers
  getAllVouchers: () => {
    return axiosClient.get('/vouchers');
  },
  createVoucher: (data) => {
    return axiosClient.post('/vouchers', data);
  },
  updateVoucher: (id, data) => {
    return axiosClient.put(`/vouchers/${id}`, data);
  },
  deleteVoucher: (id) => {
    return axiosClient.delete(`/vouchers/${id}`);
  }
};

export default adminService;
