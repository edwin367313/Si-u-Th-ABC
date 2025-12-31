const Joi = require('joi');
const { errorResponse } = require('../utils/helpers');

/**
 * Middleware validate request body
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return errorResponse(res, 'Dữ liệu không hợp lệ', 400, errors);
    }
    
    // Replace body với validated data
    req.body = value;
    next();
  };
};

/**
 * Validation schemas
 */

// Auth schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.alphanum': 'Username chỉ chứa chữ và số',
      'string.min': 'Username phải có ít nhất 3 ký tự',
      'string.max': 'Username không được quá 30 ký tự',
      'any.required': 'Username là bắt buộc'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
  password: Joi.string().min(6).max(100).required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'string.max': 'Mật khẩu không được quá 100 ký tự',
      'any.required': 'Mật khẩu là bắt buộc'
    }),
  fullName: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'any.required': 'Họ tên là bắt buộc'
    }),
  phone: Joi.string().pattern(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/)
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ'
    }),
  address: Joi.string().max(500)
});

const loginSchema = Joi.object({
  usernameOrEmail: Joi.string().required()
    .messages({
      'any.required': 'Username hoặc email là bắt buộc'
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Mật khẩu là bắt buộc'
    })
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  phone: Joi.string().pattern(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/),
  address: Joi.string().max(500),
  avatar: Joi.string().uri()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required()
    .messages({
      'any.required': 'Mật khẩu hiện tại là bắt buộc'
    }),
  newPassword: Joi.string().min(6).max(100).required()
    .messages({
      'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu mới là bắt buộc'
    })
});

// Product schemas
const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required()
    .messages({
      'any.required': 'Tên sản phẩm là bắt buộc'
    }),
  description: Joi.string().max(5000),
  price: Joi.number().min(0).required()
    .messages({
      'number.min': 'Giá phải lớn hơn hoặc bằng 0',
      'any.required': 'Giá là bắt buộc'
    }),
  discountPercent: Joi.number().min(0).max(100).default(0),
  stock: Joi.number().integer().min(0).default(0),
  categoryId: Joi.number().integer().required()
    .messages({
      'any.required': 'Danh mục là bắt buộc'
    }),
  images: Joi.array().items(Joi.string().uri()),
  unit: Joi.string().max(50),
  status: Joi.string().valid('active', 'inactive').default('active')
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string().max(5000),
  price: Joi.number().min(0),
  discountPercent: Joi.number().min(0).max(100),
  stock: Joi.number().integer().min(0),
  categoryId: Joi.number().integer(),
  images: Joi.array().items(Joi.string().uri()),
  unit: Joi.string().max(50),
  status: Joi.string().valid('active', 'inactive')
});

// Order schemas
const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required()
    })
  ).min(1).required()
    .messages({
      'array.min': 'Đơn hàng phải có ít nhất 1 sản phẩm',
      'any.required': 'Danh sách sản phẩm là bắt buộc'
    }),
  shippingAddress: Joi.string().min(5).max(500).required()
    .messages({
      'any.required': 'Địa chỉ giao hàng là bắt buộc'
    }),
  shippingPhone: Joi.string().pattern(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/).required()
    .messages({
      'any.required': 'Số điện thoại là bắt buộc'
    }),
  shippingName: Joi.string().min(2).max(100).required()
    .messages({
      'any.required': 'Tên người nhận là bắt buộc'
    }),
  paymentMethod: Joi.string().valid('cod', 'momo', 'zalopay', 'paypal', 'bank_transfer').required()
    .messages({
      'any.required': 'Phương thức thanh toán là bắt buộc'
    }),
  voucherCode: Joi.string().max(50),
  note: Joi.string().max(500)
});

// Voucher schemas
const createVoucherSchema = Joi.object({
  code: Joi.string().min(4).max(50).required()
    .messages({
      'any.required': 'Mã voucher là bắt buộc'
    }),
  name: Joi.string().min(2).max(200).required(),
  discountType: Joi.string().valid('percent', 'fixed').required()
    .messages({
      'any.required': 'Loại giảm giá là bắt buộc'
    }),
  discountValue: Joi.number().min(0).required()
    .messages({
      'any.required': 'Giá trị giảm giá là bắt buộc'
    }),
  minOrderValue: Joi.number().min(0).default(0),
  maxDiscountAmount: Joi.number().min(0),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  usageLimit: Joi.number().integer().min(1),
  status: Joi.string().valid('active', 'inactive').default('active')
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  createVoucherSchema
};
