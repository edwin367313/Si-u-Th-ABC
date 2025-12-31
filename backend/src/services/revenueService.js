const { query } = require('../config/database');

/**
 * Lấy tổng quan doanh thu
 */
const getRevenueOverview = async () => {
  // Daily Revenue
  const dailyResult = await query(`
    SELECT SUM(total_amount) as total 
    FROM Orders 
    WHERE status = 'DELIVERED' 
    AND CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)
  `);

  // Monthly Revenue
  const monthlyResult = await query(`
    SELECT SUM(total_amount) as total 
    FROM Orders 
    WHERE status = 'DELIVERED' 
    AND MONTH(created_at) = MONTH(GETDATE()) 
    AND YEAR(created_at) = YEAR(GETDATE())
  `);

  // Yearly Revenue
  const yearlyResult = await query(`
    SELECT SUM(total_amount) as total 
    FROM Orders 
    WHERE status = 'DELIVERED' 
    AND YEAR(created_at) = YEAR(GETDATE())
  `);

  // Total Orders
  const ordersResult = await query(`
    SELECT COUNT(*) as total 
    FROM Orders 
  `);

  // Total Products
  const productsResult = await query(`
    SELECT COUNT(*) as total 
    FROM Products 
    WHERE status = 'active'
  `);

  // Total Users
  const usersResult = await query(`
    SELECT COUNT(*) as total 
    FROM Users 
    WHERE role = 'customer'
  `);

  return {
    dailyRevenue: dailyResult[0]?.total || 0,
    monthlyRevenue: monthlyResult[0]?.total || 0,
    yearlyRevenue: yearlyResult[0]?.total || 0,
    totalOrders: ordersResult[0]?.total || 0,
    totalProducts: productsResult[0]?.total || 0,
    totalUsers: usersResult[0]?.total || 0
  };
};

/**
 * Lấy doanh thu theo khoảng thời gian
 */
const getRevenueByPeriod = async (startDate, endDate) => {
  const result = await query(`
    SELECT 
      SUM(total_amount) as revenue,
      COUNT(*) as orders
    FROM Orders
    WHERE status = 'DELIVERED'
    AND created_at BETWEEN @startDate AND @endDate
  `, { startDate, endDate });

  return {
    revenue: result[0]?.revenue || 0,
    orders: result[0]?.orders || 0,
    startDate,
    endDate
  };
};

/**
 * Lấy doanh thu theo tháng
 */
const getMonthlyRevenue = async (year) => {
  const result = await query(`
    SELECT 
      MONTH(created_at) as month,
      SUM(total_amount) as revenue,
      COUNT(*) as orders
    FROM Orders
    WHERE YEAR(created_at) = @year
      AND status = 'DELIVERED'
    GROUP BY MONTH(created_at)
    ORDER BY month
  `, { year });
  
  return result;
};

/**
 * Lấy top sản phẩm bán chạy
 */
const getTopProducts = async (limit = 5) => {
  const result = await query(`
    SELECT TOP (@limit)
      p.id,
      p.name,
      SUM(oi.quantity) as sold_quantity,
      SUM(oi.price * oi.quantity) as revenue
    FROM OrderItems oi
    JOIN Orders o ON oi.order_id = o.id
    JOIN Products p ON oi.product_id = p.id
    WHERE o.status = 'DELIVERED'
    GROUP BY p.id, p.name
    ORDER BY sold_quantity DESC
  `, { limit: parseInt(limit) });
  
  return result;
};

/**
 * Lấy doanh thu theo danh mục
 */
const getRevenueByCategory = async () => {
  const result = await query(`
    SELECT 
      c.name as category,
      SUM(oi.price * oi.quantity) as revenue
    FROM OrderItems oi
    JOIN Orders o ON oi.order_id = o.id
    JOIN Products p ON oi.product_id = p.id
    JOIN Categories c ON p.category_id = c.id
    WHERE o.status = 'DELIVERED'
    GROUP BY c.name
    ORDER BY revenue DESC
  `);
  
  return result;
};

/**
 * Export báo cáo doanh thu
 */
const exportRevenueReport = async (startDate, endDate) => {
  const result = await query(`
    SELECT 
      o.id as 'Mã đơn',
      o.created_at as 'Ngày tạo',
      o.full_name as 'Khách hàng',
      o.total_amount as 'Tổng tiền',
      o.payment_method as 'Phương thức thanh toán'
    FROM Orders o
    WHERE o.status = 'DELIVERED'
    AND o.created_at BETWEEN @startDate AND @endDate
    ORDER BY o.created_at DESC
  `, { startDate, endDate });
  
  return result;
};

module.exports = {
  getRevenueOverview,
  getRevenueByPeriod,
  getMonthlyRevenue,
  getTopProducts,
  getRevenueByCategory,
  exportRevenueReport
};
