const Cart = require('../models/Minh_Cart');

/**
 * Lấy giỏ hàng của user
 */
const getCart = async (userId) => {
  const cart = await Cart.getByUserId(userId);
  return cart;
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
const addToCart = async (userId, productId, quantity = 1) => {
  await Cart.addItem(userId, productId, quantity);
  return getCart(userId);
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ
 */
const updateCartItem = async (userId, productId, quantity) => {
  await Cart.updateItemQuantity(userId, productId, quantity);
  return getCart(userId);
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
const removeFromCart = async (userId, productId) => {
  await Cart.removeItem(userId, productId);
  return getCart(userId);
};

/**
 * Xóa toàn bộ giỏ hàng
 */
const clearCart = async (userId) => {
  await Cart.clear(userId);
  return true;
};

/**
 * Áp dụng voucher
 */
const applyVoucher = async (userId, voucherCode) => {
  // TODO: Implement voucher validation logic
  return getCart(userId);
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyVoucher
};
