import api from '../utils/api';

/**
 * Category Service
 */
const categoryService = {
  /**
   * Get all categories
   */
  getAll: async () => {
    return await api.get('/categories');
  },

  /**
   * Get category by ID
   */
  getById: async (id) => {
    return await api.get(`/categories/${id}`);
  },

  /**
   * Create category (Admin)
   */
  create: async (data) => {
    return await api.post('/categories', data);
  },

  /**
   * Update category (Admin)
   */
  update: async (id, data) => {
    return await api.put(`/categories/${id}`, data);
  },

  /**
   * Delete category (Admin)
   */
  delete: async (id) => {
    return await api.delete(`/categories/${id}`);
  }
};

export default categoryService;
