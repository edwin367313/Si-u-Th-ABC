import { useState } from 'react';
import paymentService from '../services/paymentService';
import { PAYMENT_PROCESSING_DELAY, PAYMENT_METHODS } from '../utils/constants';
import toast from 'react-hot-toast';

/**
 * Payment hook with 20-second processing delay
 */
export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [countdown, setCountdown] = useState(0);

  /**
   * Process Momo payment with countdown
   */
  const processMomoPayment = async (paymentData) => {
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');
      
      // Start countdown
      let timeLeft = PAYMENT_PROCESSING_DELAY / 1000; // Convert to seconds
      setCountdown(timeLeft);
      
      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      toast.loading('Đang xử lý thanh toán Momo... Vui lòng chờ 20 giây', {
        duration: PAYMENT_PROCESSING_DELAY
      });

      const result = await paymentService.processMomoPayment(paymentData);
      
      clearInterval(countdownInterval);
      setPaymentStatus(result.status);
      setIsProcessing(false);
      
      return result;
    } catch (error) {
      setIsProcessing(false);
      setPaymentStatus('failed');
      throw error;
    }
  };

  /**
   * Process ZaloPay payment with countdown
   */
  const processZaloPayPayment = async (paymentData) => {
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');
      
      let timeLeft = PAYMENT_PROCESSING_DELAY / 1000;
      setCountdown(timeLeft);
      
      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      toast.loading('Đang xử lý thanh toán ZaloPay... Vui lòng chờ 20 giây', {
        duration: PAYMENT_PROCESSING_DELAY
      });

      const result = await paymentService.processZaloPayPayment(paymentData);
      
      clearInterval(countdownInterval);
      setPaymentStatus(result.status);
      setIsProcessing(false);
      
      return result;
    } catch (error) {
      setIsProcessing(false);
      setPaymentStatus('failed');
      throw error;
    }
  };

  /**
   * Execute PayPal payment with countdown
   */
  const executePayPalPayment = async (paymentId, payerId) => {
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');
      
      let timeLeft = PAYMENT_PROCESSING_DELAY / 1000;
      setCountdown(timeLeft);
      
      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      toast.loading('Đang xử lý thanh toán PayPal... Vui lòng chờ 20 giây', {
        duration: PAYMENT_PROCESSING_DELAY
      });

      const result = await paymentService.executePayPalPayment(paymentId, payerId);
      
      clearInterval(countdownInterval);
      setPaymentStatus(result.status);
      setIsProcessing(false);
      
      return result;
    } catch (error) {
      setIsProcessing(false);
      setPaymentStatus('failed');
      throw error;
    }
  };

  /**
   * Create payment for any method
   */
  const createPayment = async (method, orderId, amount, description) => {
    try {
      let result;
      
      switch (method) {
        case PAYMENT_METHODS.MOMO:
          result = await paymentService.createMomoPayment(orderId, amount, description);
          break;
        case PAYMENT_METHODS.ZALOPAY:
          result = await paymentService.createZaloPayPayment(orderId, amount, description);
          break;
        case PAYMENT_METHODS.PAYPAL:
          result = await paymentService.createPayPalPayment(orderId, amount, description);
          break;
        case PAYMENT_METHODS.COD:
          result = { method: 'cod', status: 'pending' };
          break;
        default:
          throw new Error('Phương thức thanh toán không hợp lệ');
      }
      
      return result;
    } catch (error) {
      toast.error(error.message || 'Không thể tạo thanh toán');
      throw error;
    }
  };

  /**
   * Check payment status
   */
  const checkPaymentStatus = async (orderId) => {
    try {
      const result = await paymentService.getPaymentStatus(orderId);
      setPaymentStatus(result.status);
      return result;
    } catch (error) {
      toast.error('Không thể kiểm tra trạng thái thanh toán');
      throw error;
    }
  };

  const reset = () => {
    setIsProcessing(false);
    setPaymentStatus(null);
    setCountdown(0);
  };

  return {
    isProcessing,
    paymentStatus,
    countdown,
    processMomoPayment,
    processZaloPayPayment,
    executePayPalPayment,
    createPayment,
    checkPaymentStatus,
    reset
  };
};

export default usePayment;
