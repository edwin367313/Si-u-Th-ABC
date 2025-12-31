import api from '../utils/api';
import { buildQueryString } from '../utils/helpers';

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
   * Get revenue by period
   */
  getByPeriod: async (period = 'month', year = new Date().getFullYear()) => {
    return await api.get(`/revenue/period?period=${period}&year=${year}`);
  },

  /**
   * Get monthly revenue
   */
  getMonthly: async (month, year) => {
    return await api.get(`/revenue/monthly?month=${month}&year=${year}`);
  },

  /**
   * Get quarterly revenue
   */
  getQuarterly: async (quarter, year) => {
    return await api.get(`/revenue/quarterly?quarter=${quarter}&year=${year}`);
  },

  /**
   * Get yearly revenue
   */
  getYearly: async (year) => {
    return await api.get(`/revenue/yearly?year=${year}`);
  },

  /**
   * Get revenue chart data
   */
  getChartData: async (period = 'month', startDate, endDate) => {
    const query = buildQueryString({ period, startDate, endDate });
    return await api.get(`/revenue/chart?${query}`);
  },

  /**
   * Get top selling products
   */
  getTopProducts: async (limit = 10, period = 'month') => {
    return await api.get(`/revenue/top-products?limit=${limit}&period=${period}`);
  },

  /**
   * Get revenue by category
   */
  getByCategory: async (period = 'month') => {
    return await api.get(`/revenue/by-category?period=${period}`);
  },

  /**
   * Export revenue report
   */
  exportReport: async (startDate, endDate, format = 'excel') => {
    const query = buildQueryString({ startDate, endDate, format });
    return await api.get(`/revenue/export?${query}`, {
      responseType: 'blob'
    });
  },

  /**
   * Get revenue comparison
   */
  getComparison: async (period1, period2) => {
    return await api.get(`/revenue/comparison?period1=${period1}&period2=${period2}`);
  }
};

export default revenueService;
