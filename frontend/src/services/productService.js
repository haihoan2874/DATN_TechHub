import axiosClient from '../api/axiosConfig';

const productService = {
  getAllProducts: (params) => {
    const url = '/products';
    return axiosClient.get(url, { params });
  },
  
  getProductBySlug: (slug) => {
    const url = `/products/detail?searchBy=slug&value=${slug}`;
    return axiosClient.get(url);
  },
  
  getCategories: () => {
    const url = '/categories';
    return axiosClient.get(url);
  },
  
  getBrands: () => {
    const url = '/brands';
    return axiosClient.get(url);
  },

  getReviews: (productId) => {
    const url = `/reviews/products/${productId}`;
    return axiosClient.get(url);
  }
};

export default productService;
