import api from '../utils/api';

/**
 * Order Service
 */
const orderService = {
  /**
   * Create order from cart
   */
  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  /**
   * Get user orders
   */
  getMyOrders: async (page = 1, limit = 10) => {
    return await api.get(`/orders/my-orders?page=${page}&limit=${limit}`);
  },

  /**
   * Get order by ID
   */
  getById: async (id) => {
    return await api.get(`/orders/${id}`);
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id, reason) => {
    return await api.post(`/orders/${id}/cancel`, { reason });
  },

  /**
   * Get all orders (Admin)
   */
  getAllOrders: async (page = 1, limit = 20, status = null) => {
    const statusParam = status ? `&status=${status}` : '';
    return await api.get(`/orders?page=${page}&limit=${limit}${statusParam}`);
  },

  /**
   * Update order status (Admin)
   */
  updateStatus: async (id, status) => {
    return await api.put(`/orders/${id}/status`, { status });
  },

  /**
   * Get order statistics (Admin)
   */
  getStatistics: async () => {
    return await api.get('/orders/statistics');
  }
};

export default orderService;
