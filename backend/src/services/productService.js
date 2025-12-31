const { query } = require('../config/database');

/**
 * Lấy danh sách sản phẩm với phân trang và filter
 */
const getProducts = async (filters = {}) => {
  const {
    page = 1,
    limit = 12,
    category_id,
    search,
    sort_by = 'created_at',
    sort_order = 'DESC',
    min_price,
    max_price,
    status = 'active'
  } = filters;

  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereConditions = ['p.status = @status'];
  const params = { status };

  if (category_id) {
    whereConditions.push('p.category_id = @category_id');
    params.category_id = category_id;
  }

  if (search) {
    whereConditions.push('(p.name LIKE @search OR p.description LIKE @search)');
    params.search = `%${search}%`;
  }

  if (min_price) {
    whereConditions.push('p.price >= @min_price');
    params.min_price = min_price;
  }

  if (max_price) {
    whereConditions.push('p.price <= @max_price');
    params.max_price = max_price;
  }

  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';

  // Count total
  const countResult = await query(
    `SELECT COUNT(*) as total 
     FROM Products p
     LEFT JOIN Categories c ON p.category_id = c.id
     ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  // Get products
  const productsResult = await query(`
    SELECT p.*, p.images as image_url, c.name as category_name
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY p.${sort_by} ${sort_order}
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `, {
    ...params,
    offset: parseInt(offset),
    limit: parseInt(limit)
  });

  return {
    products: productsResult,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Lấy chi tiết sản phẩm
 */
const getProductById = async (productId) => {
  const result = await query(`
    SELECT p.*, p.images as image_url, c.name as category_name
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.id
    WHERE p.id = @productId
  `, { productId });

  if (result.length === 0) {
    throw new Error('Sản phẩm không tồn tại');
  }

  return result[0];
};

/**
 * Tạo sản phẩm mới (Admin)
 */
const createProduct = async (productData) => {
  const {
    name,
    description,
    price,
    discount_percent = 0,
    stock,
    category_id,
    images = '[]',
    unit,
    status = 'active'
  } = productData;

  const result = await query(`
    INSERT INTO Products (name, description, price, discount_percent, stock, category_id, images, unit, status, created_at)
    OUTPUT INSERTED.*
    VALUES (@name, @description, @price, @discount_percent, @stock, @category_id, @images, @unit, @status, GETDATE())
  `, {
    name,
    description,
    price,
    discount_percent,
    stock,
    category_id,
    images: JSON.stringify(images),
    unit,
    status
  });

  return result[0];
};

/**
 * Cập nhật sản phẩm (Admin)
 */
const updateProduct = async (productId, updateData) => {
  const {
    name,
    description,
    price,
    discount_percent,
    stock,
    category_id,
    images,
    unit,
    status
  } = updateData;

  const result = await query(`
    UPDATE Products
    SET name = COALESCE(@name, name),
        description = COALESCE(@description, description),
        price = COALESCE(@price, price),
        discount_percent = COALESCE(@discount_percent, discount_percent),
        stock = COALESCE(@stock, stock),
        category_id = COALESCE(@category_id, category_id),
        images = COALESCE(@images, images),
        unit = COALESCE(@unit, unit),
        status = COALESCE(@status, status),
        updated_at = GETDATE()
    OUTPUT INSERTED.*
    WHERE id = @productId
  `, {
    productId,
    name,
    description,
    price,
    discount_percent,
    stock,
    category_id,
    images: images ? JSON.stringify(images) : null,
    unit,
    status
  });

  if (result.length === 0) {
    throw new Error('Sản phẩm không tồn tại');
  }

  return result[0];
};

/**
 * Xóa sản phẩm (Admin)
 */
const deleteProduct = async (productId) => {
  await query('DELETE FROM Products WHERE id = @productId', { productId });
  return { message: 'Xóa sản phẩm thành công' };
};

/**
 * Lấy danh mục
 */
const getCategories = async () => {
  const result = await query('SELECT * FROM Categories ORDER BY name');
  return result;
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
