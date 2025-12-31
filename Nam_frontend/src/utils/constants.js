// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';

// App Info
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Siêu Thị ABC';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Local Storage Keys
export const TOKEN_KEY = 'sieuthiabc_token';
export const USER_KEY = 'sieuthiabc_user';
export const CART_KEY = 'sieuthiabc_cart';
export const THEME_KEY = 'sieuthiabc_theme';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

// Upload
export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Payment Methods
export const PAYMENT_METHODS = {
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
  PAYPAL: 'paypal',
  COD: 'cod'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  CONFIRMED: 'CONFIRMED',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Theme Types
export const THEME_TYPES = {
  TET: 'tet',
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter',
  CUSTOM: 'custom'
};

// Theme Names (Vietnamese)
export const THEME_NAMES = {
  tet: 'Tết Nguyên Đán',
  spring: 'Mùa Xuân',
  summer: 'Mùa Hè',
  autumn: 'Mùa Thu',
  winter: 'Mùa Đông',
  custom: 'Tùy Chỉnh'
};

// Sort Options
export const SORT_OPTIONS = [
  { value: 'created_at_DESC', label: 'Mới nhất' },
  { value: 'created_at_ASC', label: 'Cũ nhất' },
  { value: 'price_ASC', label: 'Giá thấp đến cao' },
  { value: 'price_DESC', label: 'Giá cao đến thấp' },
  { value: 'name_ASC', label: 'Tên A-Z' },
  { value: 'name_DESC', label: 'Tên Z-A' }
];

// Payment Processing Delay (20 seconds as specified)
export const PAYMENT_PROCESSING_DELAY = 20000; // 20 seconds

// Date Formats
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm:ss';
export const TIME_FORMAT = 'HH:mm:ss';

// Regex Patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Đăng nhập thành công!',
    REGISTER: 'Đăng ký thành công!',
    LOGOUT: 'Đăng xuất thành công!',
    ADD_TO_CART: 'Đã thêm vào giỏ hàng!',
    UPDATE_CART: 'Đã cập nhật giỏ hàng!',
    REMOVE_FROM_CART: 'Đã xóa khỏi giỏ hàng!',
    ORDER_CREATED: 'Đặt hàng thành công!',
    PAYMENT_SUCCESS: 'Thanh toán thành công!',
    PROFILE_UPDATED: 'Cập nhật thông tin thành công!',
    PRODUCT_ADDED: 'Thêm sản phẩm thành công!',
    PRODUCT_UPDATED: 'Cập nhật sản phẩm thành công!',
    PRODUCT_DELETED: 'Xóa sản phẩm thành công!',
    THEME_UPDATED: 'Cập nhật theme thành công!'
  },
  ERROR: {
    GENERIC: 'Có lỗi xảy ra, vui lòng thử lại!',
    NETWORK: 'Lỗi kết nối mạng!',
    LOGIN_FAILED: 'Đăng nhập thất bại!',
    UNAUTHORIZED: 'Bạn không có quyền truy cập!',
    SESSION_EXPIRED: 'Phiên đăng nhập hết hạn!',
    INVALID_INPUT: 'Dữ liệu không hợp lệ!',
    FILE_TOO_LARGE: 'File quá lớn!',
    INVALID_FILE_TYPE: 'Định dạng file không hợp lệ!',
    PAYMENT_FAILED: 'Thanh toán thất bại!',
    OUT_OF_STOCK: 'Sản phẩm hết hàng!',
    CART_EMPTY: 'Giỏ hàng trống!'
  },
  CONFIRM: {
    DELETE_PRODUCT: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
    REMOVE_CART_ITEM: 'Bạn có chắc chắn muốn xóa sản phẩm khỏi giỏ hàng?',
    CLEAR_CART: 'Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?',
    CANCEL_ORDER: 'Bạn có chắc chắn muốn hủy đơn hàng?',
    LOGOUT: 'Bạn có chắc chắn muốn đăng xuất?'
  }
};

export default {
  API_URL,
  ML_SERVICE_URL,
  APP_NAME,
  APP_VERSION,
  TOKEN_KEY,
  USER_KEY,
  CART_KEY,
  THEME_KEY,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  PAYMENT_METHODS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  USER_ROLES,
  THEME_TYPES,
  THEME_NAMES,
  SORT_OPTIONS,
  PAYMENT_PROCESSING_DELAY,
  DATE_FORMAT,
  DATETIME_FORMAT,
  TIME_FORMAT,
  EMAIL_REGEX,
  PHONE_REGEX,
  USERNAME_REGEX,
  MESSAGES
};
