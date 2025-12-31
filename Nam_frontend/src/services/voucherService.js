import api from '../utils/api';

/**
 * Voucher Service
 */
const voucherService = {
  /**
   * Get all available vouchers
   */
  getAvailable: async () => {
    return await api.get('/vouchers/available');
  },

  /**
   * Get voucher by code
   */
  getByCode: async (code) => {
    return await api.get(`/vouchers/code/${code}`);
  },

  /**
   * Validate voucher
   */
  validate: async (code, totalAmount) => {
    return await api.post('/vouchers/validate', { code, totalAmount });
  },

  /**
   * Get all vouchers (Admin)
   */
  getAll: async (page = 1, limit = 20) => {
    return await api.get(`/vouchers?page=${page}&limit=${limit}`);
  },

  /**
   * Create voucher (Admin)
   */
  create: async (data) => {
    return await api.post('/vouchers', data);
  },

  /**
   * Update voucher (Admin)
   */
  update: async (id, data) => {
    return await api.put(`/vouchers/${id}`, data);
  },

  /**
   * Delete voucher (Admin)
   */
  delete: async (id) => {
    return await api.delete(`/vouchers/${id}`);
  }
};

export default voucherService;
