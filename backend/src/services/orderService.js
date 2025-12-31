const Order = require('../models/Order');
const Notification = require('../models/Notification');

/**
 * Tạo đơn hàng mới
 */
const createOrder = async (userId, orderData) => {
  const order = await Order.create(userId, orderData);
  
  // Create notification for admin
  try {
    await Notification.create({
      userId: null, // For all admins
      title: 'Đơn hàng mới',
      message: `Đơn hàng #${order.id} vừa được tạo bởi khách hàng. Tổng tiền: ${order.total_amount.toLocaleString('vi-VN')}đ`,
      type: 'order',
      referenceId: order.id
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't fail the order creation if notification fails
  }
  
  return order;
};

/**
 * Lấy đơn hàng của user
 */
const getUserOrders = async (userId, filters = {}) => {
  const { page = 1, limit = 10 } = filters;
  return await Order.getUserOrders(userId, page, limit);
};

/**
 * Lấy chi tiết đơn hàng
 */
const getOrderById = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Đơn hàng không tồn tại');
  }
  // Check ownership if userId is provided (for customers)
  if (userId && order.user_id !== userId) {
    throw new Error('Bạn không có quyền xem đơn hàng này');
  }
  return order;
};

/**
 * Hủy đơn hàng
 */
const cancelOrder = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Đơn hàng không tồn tại');
  }
  if (userId && order.user_id !== userId) {
    throw new Error('Bạn không có quyền hủy đơn hàng này');
  }
  if (order.status !== 'pending') {
    throw new Error('Chỉ có thể hủy đơn hàng đang chờ xử lý');
  }
  
  return await Order.updateStatus(orderId, 'cancelled');
};

/**
 * Lấy tất cả đơn hàng (Admin)
 */
const getAllOrders = async (filters = {}) => {
  return await Order.getAll(filters);
};

/**
 * Cập nhật trạng thái đơn hàng (Admin)
 */
const updateOrderStatus = async (orderId, status) => {
  return await Order.updateStatus(orderId, status);
};

/**
 * Cập nhật trạng thái thanh toán (Admin)
 */
const updatePaymentStatus = async (orderId, status) => {
  // Currently Order model doesn't have separate payment status update method, 
  // but we can implement it or just use updateStatus if status includes payment states.
  // For now, let's assume updateStatus handles it or we need to add it to Order model.
  // The SQL table has `status` and `payment_method`. It doesn't have `payment_status`.
  // So maybe we just update the main status?
  // Or maybe we should add `updatePaymentStatus` to Order model if needed.
  // For now, let's just throw error or implement basic update.
  // Since the controller calls it, we should provide it.
  // But wait, the SQL schema doesn't have payment_status column.
  // So this feature might be broken or not supported by DB.
  // I will just return null or throw error "Not supported".
  // Or better, just update the main status if it makes sense.
  // Let's leave it as a placeholder or remove it from controller?
  // Controller calls `updatePaymentStatus`.
  // I'll implement it to update `status` for now, or just do nothing.
  throw new Error('Chức năng cập nhật trạng thái thanh toán chưa được hỗ trợ trong database hiện tại');
};

/**
 * Thống kê đơn hàng
 */
const getOrderStatistics = async () => {
  // Implement if needed, or return empty
  return {};
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStatistics
};
