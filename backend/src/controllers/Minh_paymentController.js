const paymentService = require('../services/paymentService');
const { successResponse } = require('../utils/helpers');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const createPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod } = req.body;
  const result = await paymentService.createPayment(orderId, paymentMethod);
  return successResponse(res, result, 'Tạo thanh toán thành công', 201);
});

const processMomoPayment = asyncHandler(async (req, res) => {
  const { paymentCode } = req.body;
  const result = await paymentService.processMomoPayment(paymentCode);
  return successResponse(res, result, result.message);
});

const processZaloPayPayment = asyncHandler(async (req, res) => {
  const { paymentCode } = req.body;
  const result = await paymentService.processZaloPayPayment(paymentCode);
  return successResponse(res, result, result.message);
});

const processPayPalPayment = asyncHandler(async (req, res) => {
  const { paymentCode } = req.body;
  const result = await paymentService.processPayPalPayment(paymentCode);
  return successResponse(res, result, result.message);
});

const handleMomoCallback = asyncHandler(async (req, res) => {
  const payment = await paymentService.handlePaymentCallback('momo', req.body);
  return successResponse(res, { payment }, 'Callback xử lý thành công');
});

const handleZaloPayCallback = asyncHandler(async (req, res) => {
  const payment = await paymentService.handlePaymentCallback('zalopay', req.body);
  return successResponse(res, { payment }, 'Callback xử lý thành công');
});

const handlePayPalCallback = asyncHandler(async (req, res) => {
  const payment = await paymentService.handlePaymentCallback('paypal', req.body);
  return successResponse(res, { payment }, 'Callback xử lý thành công');
});

const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentStatus(req.params.paymentCode);
  return successResponse(res, { payment }, 'Lấy trạng thái thanh toán thành công');
});

const refundPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.refundPayment(req.params.paymentCode);
  return successResponse(res, { payment }, 'Hoàn tiền thành công');
});

module.exports = {
  createPayment,
  processMomoPayment,
  processZaloPayPayment,
  processPayPalPayment,
  handleMomoCallback,
  handleZaloPayCallback,
  handlePayPalCallback,
  getPaymentStatus,
  refundPayment
};
