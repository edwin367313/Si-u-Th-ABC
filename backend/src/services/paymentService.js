const Payment = require('../models/Minh_Payment');
const Order = require('../models/Order');
const { generatePaymentCode, sleep } = require('../utils/helpers');
const MomoGateway = require('../payment-gateways/momoGateway');
const ZaloPayGateway = require('../payment-gateways/zaloPayGateway');
const PayPalGateway = require('../payment-gateways/paypalGateway');

// Payment processing delay - 20 seconds
const PAYMENT_PROCESSING_DELAY = 20000;

/**
 * Tạo payment cho đơn hàng
 */
const createPayment = async (orderId, paymentMethod) => {
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error('Đơn hàng không tồn tại');
  }

  // Tạo payment record
  const payment = await Payment.create({
    orderId,
    paymentCode: generatePaymentCode(),
    paymentMethod,
    amount: order.total,
    status: 'pending',
    transactionId: null
  });

  let paymentUrl = null;

  // Tạo payment URL dựa vào method
  switch (paymentMethod) {
    case 'momo':
      paymentUrl = await MomoGateway.createPayment(payment.paymentCode, order.total, order.orderCode);
      break;
    case 'zalopay':
      paymentUrl = await ZaloPayGateway.createPayment(payment.paymentCode, order.total, order.orderCode);
      break;
    case 'paypal':
      paymentUrl = await PayPalGateway.createPayment(payment.paymentCode, order.total, order.orderCode);
      break;
    case 'cod':
      paymentUrl = null;
      break;
    default:
      throw new Error('Phương thức thanh toán không hợp lệ');
  }

  return {
    payment,
    paymentUrl
  };
};

/**
 * Xử lý thanh toán - Momo
 */
const processMomoPayment = async (paymentCode) => {
  const payment = await Payment.findOne({ where: { paymentCode } });

  if (!payment) {
    throw new Error('Thanh toán không tồn tại');
  }

  // Simulate 20 seconds processing
  await sleep(PAYMENT_PROCESSING_DELAY);

  // Process payment with 90% success rate
  const result = await MomoGateway.processPayment(paymentCode, payment.amount);

  // Update payment status
  await payment.update({
    status: result.success ? 'success' : 'failed',
    transactionId: result.transactionId,
    responseData: result
  });

  // Update order payment status
  if (result.success) {
    await Order.update(
      { paymentStatus: 'paid', orderStatus: 'confirmed' },
      { where: { id: payment.orderId } }
    );
  }

  return {
    success: result.success,
    message: result.message,
    payment
  };
};

/**
 * Xử lý thanh toán - ZaloPay
 */
const processZaloPayPayment = async (paymentCode) => {
  const payment = await Payment.findOne({ where: { paymentCode } });

  if (!payment) {
    throw new Error('Thanh toán không tồn tại');
  }

  // Simulate 20 seconds processing
  await sleep(PAYMENT_PROCESSING_DELAY);

  const result = await ZaloPayGateway.processPayment(paymentCode, payment.amount);

  await payment.update({
    status: result.success ? 'success' : 'failed',
    transactionId: result.transactionId,
    responseData: result
  });

  if (result.success) {
    await Order.update(
      { paymentStatus: 'paid', orderStatus: 'confirmed' },
      { where: { id: payment.orderId } }
    );
  }

  return {
    success: result.success,
    message: result.message,
    payment
  };
};

/**
 * Xử lý thanh toán - PayPal
 */
const processPayPalPayment = async (paymentCode) => {
  const payment = await Payment.findOne({ where: { paymentCode } });

  if (!payment) {
    throw new Error('Thanh toán không tồn tại');
  }

  // Simulate 20 seconds processing
  await sleep(PAYMENT_PROCESSING_DELAY);

  const result = await PayPalGateway.processPayment(paymentCode, payment.amount);

  await payment.update({
    status: result.success ? 'success' : 'failed',
    transactionId: result.transactionId,
    responseData: result
  });

  if (result.success) {
    await Order.update(
      { paymentStatus: 'paid', orderStatus: 'confirmed' },
      { where: { id: payment.orderId } }
    );
  }

  return {
    success: result.success,
    message: result.message,
    payment
  };
};

/**
 * Callback handler cho các payment gateways
 */
const handlePaymentCallback = async (paymentMethod, callbackData) => {
  let paymentCode;
  let isValid = false;

  switch (paymentMethod) {
    case 'momo':
      isValid = MomoGateway.verifyCallback(callbackData);
      paymentCode = callbackData.paymentCode;
      break;
    case 'zalopay':
      isValid = ZaloPayGateway.verifyCallback(callbackData);
      paymentCode = callbackData.paymentCode;
      break;
    case 'paypal':
      isValid = PayPalGateway.verifyCallback(callbackData);
      paymentCode = callbackData.paymentCode;
      break;
  }

  if (!isValid) {
    throw new Error('Callback không hợp lệ');
  }

  const payment = await Payment.findOne({ where: { paymentCode } });

  if (!payment) {
    throw new Error('Thanh toán không tồn tại');
  }

  await payment.update({
    status: 'success',
    transactionId: callbackData.transactionId,
    responseData: callbackData
  });

  await Order.update(
    { paymentStatus: 'paid', orderStatus: 'confirmed' },
    { where: { id: payment.orderId } }
  );

  return payment;
};

/**
 * Lấy trạng thái thanh toán
 */
const getPaymentStatus = async (paymentCode) => {
  const payment = await Payment.findOne({
    where: { paymentCode },
    include: [{ model: Order, as: 'order' }]
  });

  if (!payment) {
    throw new Error('Thanh toán không tồn tại');
  }

  return payment;
};

/**
 * Hoàn tiền
 */
const refundPayment = async (paymentCode) => {
  const payment = await Payment.findOne({ where: { paymentCode } });

  if (!payment) {
    throw new Error('Thanh toán không tồn tại');
  }

  if (payment.status !== 'success') {
    throw new Error('Chỉ có thể hoàn tiền cho thanh toán thành công');
  }

  // TODO: Implement actual refund logic for each gateway

  await payment.update({ status: 'refunded' });

  return payment;
};

module.exports = {
  createPayment,
  processMomoPayment,
  processZaloPayPayment,
  processPayPalPayment,
  handlePaymentCallback,
  getPaymentStatus,
  refundPayment
};
