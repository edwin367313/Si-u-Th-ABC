import moment from 'moment';
import { DATE_FORMAT, DATETIME_FORMAT } from './constants';

/**
 * Format currency (VND)
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

/**
 * Format number with thousand separator
 */
export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';
  return new Intl.NumberFormat('vi-VN').format(number);
};

/**
 * Format date
 */
export const formatDate = (date, format = DATE_FORMAT) => {
  if (!date) return '';
  return moment(date).format(format);
};

/**
 * Format datetime
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return moment(date).format(DATETIME_FORMAT);
};

/**
 * Format relative time (e.g., "2 giờ trước")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return moment(date).fromNow();
};

/**
 * Calculate discounted price
 */
export const calculateDiscountedPrice = (price, discountPercent) => {
  if (!price) return 0;
  if (!discountPercent) return price;
  return price * (100 - discountPercent) / 100;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return !obj;
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

/**
 * Convert file to base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Download file
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return Promise.resolve();
  }
};

/**
 * Get query params from URL
 */
export const getQueryParams = (search = window.location.search) => {
  const params = new URLSearchParams(search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Build query string from object
 */
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  return query.toString();
};

/**
 * Scroll to top
 */
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

/**
 * Scroll to element
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

/**
 * Get order status color
 */
export const getOrderStatusColor = (status) => {
  const colors = {
    PENDING: 'gold',
    PROCESSING: 'blue',
    CONFIRMED: 'cyan',
    SHIPPING: 'purple',
    DELIVERED: 'green',
    CANCELLED: 'red',
    REFUNDED: 'orange'
  };
  return colors[status] || 'default';
};

/**
 * Get order status text
 */
export const getOrderStatusText = (status) => {
  const texts = {
    PENDING: 'Chờ xác nhận',
    PROCESSING: 'Đang xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao hàng',
    DELIVERED: 'Đã giao hàng',
    CANCELLED: 'Đã hủy',
    REFUNDED: 'Đã hoàn tiền'
  };
  return texts[status] || status;
};

/**
 * Get payment method text
 */
export const getPaymentMethodText = (method) => {
  const texts = {
    momo: 'Ví MoMo',
    zalopay: 'Ví ZaloPay',
    paypal: 'PayPal',
    cod: 'Thanh toán khi nhận hàng'
  };
  return texts[method] || method;
};

export default {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  calculateDiscountedPrice,
  calculatePercentage,
  truncateText,
  generateId,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  getFileExtension,
  fileToBase64,
  downloadFile,
  copyToClipboard,
  getQueryParams,
  buildQueryString,
  scrollToTop,
  scrollToElement,
  isAdmin,
  getOrderStatusColor,
  getOrderStatusText,
  getPaymentMethodText
};
