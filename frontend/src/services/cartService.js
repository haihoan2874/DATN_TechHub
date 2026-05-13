import axiosClient from '../api/axiosConfig';

const cartService = {
  getCart: () => {
    return axiosClient.get('/cart');
  },

  addItem: (productId, quantity = 1) => {
    return axiosClient.post('/cart/add', null, {
      params: { productId, quantity }
    });
  },

  updateQuantity: (productId, quantity) => {
    return axiosClient.put(`/cart/items/${productId}`, null, {
      params: { quantity }
    });
  },

  removeItem: (productId) => {
    return axiosClient.delete(`/cart/remove/${productId}`);
  },

  clearCart: () => {
    return axiosClient.delete('/cart/clear');
  }
};

export default cartService;
