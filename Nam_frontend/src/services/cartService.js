import api from '../utils/api';

/**
 * Cart Service
 */
const cartService = {
  /**
   * Get cart
   */
  getCart: async () => {
    return await api.get('/cart');
  },

  /**
   * Add item to cart
   */
  addItem: async (productId, quantity = 1) => {
    return await api.post('/cart/items', { productId, quantity });
  },

  /**
   * Update cart item quantity
   */
  updateQuantity: async (productId, quantity) => {
    return await api.put(`/cart/items/${productId}`, { quantity });
  },

  /**
   * Remove item from cart
   */
  removeItem: async (productId) => {
    return await api.delete(`/cart/items/${productId}`);
  },

  /**
   * Clear cart
   */
  clearCart: async () => {
    return await api.delete('/cart');
  },

  /**
   * Apply voucher
   */
  applyVoucher: async (voucherCode) => {
    return await api.post('/cart/voucher', { code: voucherCode });
  },

  /**
   * Remove voucher
   */
  removeVoucher: async () => {
    return await api.delete('/cart/voucher');
  },

  /**
   * Get cart summary
   */
  getSummary: async () => {
    return await api.get('/cart/summary');
  },

  // Local storage functions for offline cart
  getLocalCart: () => {
    const cart = localStorage.getItem('sieuthiabc_cart');
    return cart ? JSON.parse(cart) : { items: [], total: 0 };
  },

  saveLocalCart: (cart) => {
    localStorage.setItem('sieuthiabc_cart', JSON.stringify(cart));
  },

  clearLocalCart: () => {
    localStorage.removeItem('sieuthiabc_cart');
  },

  /**
   * Sync local cart with server
   */
  syncCart: async () => {
    const localCart = cartService.getLocalCart();
    if (localCart.items.length > 0) {
      // Sync each item
      for (const item of localCart.items) {
        await cartService.addItem(item.productId, item.quantity);
      }
      // Clear local cart after sync
      cartService.clearLocalCart();
    }
    return await cartService.getCart();
  }
};

export default cartService;
