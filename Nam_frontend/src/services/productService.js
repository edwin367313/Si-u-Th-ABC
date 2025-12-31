import api from '../utils/api';
import { buildQueryString } from '../utils/helpers';

/**
 * Product Service
 */
const productService = {
  /**
   * Get all products with filters
   */
  getAll: async (filters = {}) => {
    const query = buildQueryString(filters);
    return await api.get(`/products?${query}`);
  },

  /**
   * Get product by ID
   */
  getById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  /**
   * Search products
   */
  search: async (keyword, filters = {}) => {
    const query = buildQueryString({ search: keyword, ...filters });
    return await api.get(`/products/search?${query}`);
  },

  /**
   * Get products by category
   */
  getByCategory: async (categoryId, filters = {}) => {
    const query = buildQueryString({ category_id: categoryId, ...filters });
    return await api.get(`/products?${query}`);
  },

  /**
   * Create product (Admin)
   */
  create: async (data) => {
    return await api.post('/products', data);
  },

  /**
   * Update product (Admin)
   */
  update: async (id, data) => {
    return await api.put(`/products/${id}`, data);
  },

  /**
   * Delete product (Admin)
   */
  delete: async (id) => {
    return await api.delete(`/products/${id}`);
  },

  /**
   * Upload product image
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return await api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Get featured products
   */
  getFeatured: async (limit = 10) => {
    return await api.get(`/products/featured?limit=${limit}`);
  },

  /**
   * Get related products
   */
  getRelated: async (productId, limit = 8) => {
    return await api.get(`/products/${productId}/related?limit=${limit}`);
  }
};

export default productService;
