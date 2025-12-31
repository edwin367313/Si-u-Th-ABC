import api from '../utils/api';

/**
 * Revenue Service (for Admin analytics)
 */
const revenueService = {
  /**
   * Get revenue overview
   */
  getOverview: async () => {
    return await api.get('/revenue/overview');
  },

  /**
   * Get revenue by date range
   */
  getByDateRange: async (startDate, endDate) => {
    return await api.get(`/revenue/period?startDate=${startDate}&endDate=${endDate}`);
  },

  /**
   * Get monthly revenue for a year
   */
  getMonthlyRevenue: async (year) => {
    return await api.get(`/revenue/monthly?year=${year}`);
  },

  /**
   * Get top selling products
   */
  getTopProducts: async (limit = 5) => {
    return await api.get(`/revenue/top-products?limit=${limit}`);
  },

  /**
   * Get revenue by category
   */
  getRevenueByCategory: async () => {
    return await api.get('/revenue/by-category');
  },

  /**
   * Export revenue report
   */
  exportReport: async (startDate, endDate) => {
    return await api.get(`/revenue/export?startDate=${startDate}&endDate=${endDate}`, {
      responseType: 'blob'
    });
  }
};

export default revenueService;
