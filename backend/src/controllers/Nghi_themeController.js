const themeService = require('../services/themeService');
const { successResponse } = require('../utils/helpers');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const getActiveTheme = asyncHandler(async (req, res) => {
  const theme = await themeService.getActiveTheme();
  return successResponse(res, { theme }, 'Lấy theme active thành công');
});

const getAllThemes = asyncHandler(async (req, res) => {
  const themes = await themeService.getAllThemes();
  return successResponse(res, { themes }, 'Lấy danh sách themes thành công');
});

const createTheme = asyncHandler(async (req, res) => {
  const theme = await themeService.createTheme(req.body);
  return successResponse(res, { theme }, 'Tạo theme thành công', 201);
});

const updateTheme = asyncHandler(async (req, res) => {
  const theme = await themeService.updateTheme(req.params.id, req.body);
  return successResponse(res, { theme }, 'Cập nhật theme thành công');
});

const deleteTheme = asyncHandler(async (req, res) => {
  await themeService.deleteTheme(req.params.id);
  return successResponse(res, null, 'Xóa theme thành công');
});

const setActiveTheme = asyncHandler(async (req, res) => {
  const theme = await themeService.setActiveTheme(req.params.id);
  return successResponse(res, { theme }, 'Set theme active thành công');
});

module.exports = {
  getActiveTheme,
  getAllThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  setActiveTheme
};
