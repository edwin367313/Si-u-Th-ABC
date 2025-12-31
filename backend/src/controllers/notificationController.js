const Notification = require('../models/Notification');
const { successResponse } = require('../utils/helpers');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const getAdminNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  const result = await Notification.getForAdmin(parseInt(limit), parseInt(offset));
  
  return successResponse(res, {
    notifications: result.notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  }, 'Lấy danh sách thông báo thành công');
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Notification.markAsRead(id);
  return successResponse(res, null, 'Đã đánh dấu đã đọc');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.markAllAsRead();
  return successResponse(res, null, 'Đã đánh dấu tất cả đã đọc');
});

module.exports = {
  getAdminNotifications,
  markAsRead,
  markAllAsRead
};
