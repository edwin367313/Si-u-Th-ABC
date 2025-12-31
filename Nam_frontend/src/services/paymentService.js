import api from '../utils/api';
import { PAYMENT_PROCESSING_DELAY } from '../utils/constants';

/**
 * Payment Service
 */
const paymentService = {
  /**
   * Create Momo payment
   */
  createMomoPayment: async (orderId, amount, orderInfo) => {
    return await api.post('/payment/momo/create', {
      orderId,
      amount,
      orderInfo
    });
  },

  /**
   * Process Momo payment (with 20s delay simulation)
   */
  processMomoPayment: async (paymentData) => {
    // Simulate 20 second processing delay
    await new Promise(resolve => setTimeout(resolve, PAYMENT_PROCESSING_DELAY));
    
    return await api.post('/payment/momo/process', paymentData);
  },

  /**
   * Momo callback handler
   */
  handleMomoCallback: async (callbackData) => {
    return await api.post('/payment/momo/callback', callbackData);
  },

  /**
   * Create ZaloPay payment
   */
  createZaloPayPayment: async (orderId, amount, description) => {
    return await api.post('/payment/zalopay/create', {
      orderId,
      amount,
      description
    });
  },

  /**
   * Process ZaloPay payment (with 20s delay simulation)
   */
  processZaloPayPayment: async (paymentData) => {
    // Simulate 20 second processing delay
    await new Promise(resolve => setTimeout(resolve, PAYMENT_PROCESSING_DELAY));
    
    return await api.post('/payment/zalopay/process', paymentData);
  },

  /**
   * ZaloPay callback handler
   */
  handleZaloPayCallback: async (callbackData) => {
    return await api.post('/payment/zalopay/callback', callbackData);
  },

  /**
   * Create PayPal payment
   */
  createPayPalPayment: async (orderId, amount, description) => {
    return await api.post('/payment/paypal/create', {
      orderId,
      amount,
      description
    });
  },

  /**
   * Execute PayPal payment (with 20s delay simulation)
   */
  executePayPalPayment: async (paymentId, payerId) => {
    // Simulate 20 second processing delay
    await new Promise(resolve => setTimeout(resolve, PAYMENT_PROCESSING_DELAY));
    
    return await api.post('/payment/paypal/execute', {
      paymentId,
      payerId
    });
  },

  /**
   * Get payment status
   */
  getPaymentStatus: async (orderId) => {
    return await api.get(`/payment/status/${orderId}`);
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (page = 1, limit = 10) => {
    return await api.get(`/payment/history?page=${page}&limit=${limit}`);
  },

  /**
   * Refund payment (Admin)
   */
  refundPayment: async (orderId, reason) => {
    return await api.post(`/payment/refund/${orderId}`, { reason });
  },

  /**
   * Verify payment signature
   */
  verifySignature: async (paymentData, signature) => {
    return await api.post('/payment/verify-signature', {
      paymentData,
      signature
    });
  }
};

export default paymentService;
