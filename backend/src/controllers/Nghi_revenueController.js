const revenueService = require('../services/revenueService');
const { successResponse } = require('../utils/helpers');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const getRevenueOverview = asyncHandler(async (req, res) => {
  const overview = await revenueService.getRevenueOverview();
  return successResponse(res, overview, 'Lấy tổng quan doanh thu thành công');
});

const getRevenueByPeriod = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await revenueService.getRevenueByPeriod(startDate, endDate);
  return successResponse(res, result, 'Lấy doanh thu theo khoảng thời gian thành công');
});

const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const results = await revenueService.getMonthlyRevenue(year || new Date().getFullYear());
  return successResponse(res, { results }, 'Lấy doanh thu theo tháng thành công');
});

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await revenueService.getTopProducts(req.query.limit);
  return successResponse(res, { products }, 'Lấy sản phẩm bán chạy thành công');
});

const getRevenueByCategory = asyncHandler(async (req, res) => {
  const categories = await revenueService.getRevenueByCategory();
  return successResponse(res, { categories }, 'Lấy doanh thu theo danh mục thành công');
});

const exportRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const report = await revenueService.exportRevenueReport(startDate, endDate);
  return successResponse(res, report, 'Export báo cáo thành công');
});

module.exports = {
  getRevenueOverview,
  getRevenueByPeriod,
  getMonthlyRevenue,
  getTopProducts,
  getRevenueByCategory,
  exportRevenueReport
};
