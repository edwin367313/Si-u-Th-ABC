import { EMAIL_REGEX, PHONE_REGEX, USERNAME_REGEX } from './constants';

/**
 * Validate email
 */
export const validateEmail = (email) => {
  if (!email) return 'Email là bắt buộc';
  if (!EMAIL_REGEX.test(email)) return 'Email không hợp lệ';
  return null;
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  if (!phone) return 'Số điện thoại là bắt buộc';
  if (!PHONE_REGEX.test(phone)) return 'Số điện thoại không hợp lệ';
  return null;
};

/**
 * Validate username
 */
export const validateUsername = (username) => {
  if (!username) return 'Tên đăng nhập là bắt buộc';
  if (username.length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự';
  if (username.length > 20) return 'Tên đăng nhập không được quá 20 ký tự';
  if (!USERNAME_REGEX.test(username)) return 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới';
  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password) return 'Mật khẩu là bắt buộc';
  if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
  return null;
};

/**
 * Validate confirm password
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Vui lòng xác nhận mật khẩu';
  if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'Trường này') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} là bắt buộc`;
  }
  return null;
};

/**
 * Validate number
 */
export const validateNumber = (value, fieldName = 'Giá trị', min = null, max = null) => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} là bắt buộc`;
  }
  
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} phải là số`;
  
  if (min !== null && num < min) return `${fieldName} phải lớn hơn hoặc bằng ${min}`;
  if (max !== null && num > max) return `${fieldName} phải nhỏ hơn hoặc bằng ${max}`;
  
  return null;
};

/**
 * Validate price
 */
export const validatePrice = (price) => {
  return validateNumber(price, 'Giá', 0);
};

/**
 * Validate quantity
 */
export const validateQuantity = (quantity) => {
  return validateNumber(quantity, 'Số lượng', 1);
};

/**
 * Validate discount percent
 */
export const validateDiscountPercent = (percent) => {
  return validateNumber(percent, 'Phần trăm giảm giá', 0, 100);
};

/**
 * Validate file size
 */
export const validateFileSize = (file, maxSize) => {
  if (!file) return 'Vui lòng chọn file';
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return `Kích thước file không được vượt quá ${maxSizeMB}MB`;
  }
  return null;
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file) return 'Vui lòng chọn file';
  if (!allowedTypes.includes(file.type)) {
    return 'Định dạng file không hợp lệ';
  }
  return null;
};

/**
 * Validate form data
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required) {
      const error = validateRequired(value, rule.label || field);
      if (error) {
        errors[field] = error;
        return;
      }
    }
    
    if (rule.type === 'email') {
      const error = validateEmail(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'phone') {
      const error = validatePhone(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'username') {
      const error = validateUsername(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'password') {
      const error = validatePassword(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'number') {
      const error = validateNumber(value, rule.label, rule.min, rule.max);
      if (error) errors[field] = error;
    }
    
    if (rule.custom) {
      const error = rule.custom(value, data);
      if (error) errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePhone,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
  validateNumber,
  validatePrice,
  validateQuantity,
  validateDiscountPercent,
  validateFileSize,
  validateFileType,
  validateForm
};
