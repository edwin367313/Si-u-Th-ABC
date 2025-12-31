const { query } = require('../config/database');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Helper to call ML Service
const callMLService = async (endpoint, method = 'GET', body = null) => {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);
        
        // Ensure endpoint starts with /api/ml if not already
        const fullEndpoint = endpoint.startsWith('/api/ml') ? endpoint : `/api/ml${endpoint}`;
        
        const response = await fetch(`${ML_SERVICE_URL}${fullEndpoint}`, options);
        if (!response.ok) {
            console.warn(`ML Service Warning (${fullEndpoint}): ${response.statusText}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error calling ML Service (${endpoint}):`, error);
        return null;
    }
};

// =============================================
// 1. LINEAR REGRESSION (Revenue Prediction) -> Python (Decision Tree)
// =============================================
const analyzeRevenueTrend = async (startDate, endDate, predictDays = 30) => {
    // Call Python service
    const result = await callMLService('/revenue-prediction/forecast', 'POST', { days: predictDays });
    
    if (result && result.success) {
        return {
            prediction: result.daily_forecasts,
            total_predicted_revenue: result.total_predicted_revenue,
            avg_daily_revenue: result.avg_daily_revenue,
            trend: 'predicted'
        };
    }
    
    return { 
        prediction: [],
        message: "ML Service unavailable"
    };
};

// =============================================
// 2. K-MEANS (Product Clustering) -> Python
// =============================================
const clusterProductsByName = async (k = 5) => {
    // Call Python service
    const result = await callMLService('/product-classifier/clusters');
    
    if (result && result.success) {
        return { 
            clusters: Object.values(result.clusters) 
        };
    }
    
    return { clusters: [], message: "ML Service unavailable" };
};

// =============================================
// 3. DECISION TREE (Customer Segmentation) -> Python
// =============================================
const segmentCustomers = async () => {
    // Call Python service
    const result = await callMLService('/customer-segmentation/segments');
    
    if (result && result.success) {
        return { 
            segments: result.segments, 
            summary: result.statistics 
        };
    }
    
    return { segments: [], summary: {}, message: "ML Service unavailable" };
};

// =============================================
// 4. APRIORI (Market Basket Analysis) -> Python
// =============================================
const getMarketBasketAnalysis = async () => {
    const result = await callMLService('/product-association/rules?top_n=20');
    
    if (result && result.success) {
        return { rules: result.rules };
    }
    
    return { rules: [], message: "ML Service unavailable" };
};

// =============================================
// DASHBOARD STATISTICS
// =============================================
const getDashboardStatistics = async () => {
    try {
        // Tổng doanh thu
        const revenueSql = `
            SELECT 
                SUM(total) as total_revenue,
                COUNT(*) as total_orders,
                AVG(total) as avg_order_value
            FROM Orders
            WHERE order_status = 'delivered'
        `;
        const revenueStats = await query(revenueSql);
        
        // Tổng sản phẩm
        const productSql = `SELECT COUNT(*) as total_products FROM Products`;
        const productStats = await query(productSql);
        
        // Tổng khách hàng
        const customerSql = `SELECT COUNT(*) as total_customers FROM Users WHERE role = 'customer'`;
        const customerStats = await query(customerSql);
        
        // Doanh thu 7 ngày gần nhất
        const recentRevenueSql = `
            SELECT 
                SUM(total) as recent_revenue,
                COUNT(*) as recent_orders
            FROM Orders
            WHERE order_status = 'delivered'
                AND created_at >= DATEADD(day, -7, GETDATE())
        `;
        const recentStats = await query(recentRevenueSql);
        
        return {
            total_revenue: revenueStats[0]?.total_revenue || 0,
            total_orders: revenueStats[0]?.total_orders || 0,
            avg_order_value: revenueStats[0]?.avg_order_value || 0,
            total_products: productStats[0]?.total_products || 0,
            total_customers: customerStats[0]?.total_customers || 0,
            recent_revenue: recentStats[0]?.recent_revenue || 0,
            recent_orders: recentStats[0]?.recent_orders || 0
        };
    } catch (error) {
        console.error('Dashboard statistics error:', error);
        throw error;
    }
};

// Top sản phẩm bán chạy
const getTopSellingProducts = async (limit = 10, days = 30) => {
    try {
        const sql = `
            SELECT TOP ${limit}
                p.id,
                p.name,
                p.price,
                p.images,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.price) as total_revenue,
                COUNT(DISTINCT oi.order_id) as order_count
            FROM Products p
            INNER JOIN OrderItems oi ON p.id = oi.product_id
            INNER JOIN Orders o ON oi.order_id = o.id
            WHERE o.order_status = 'delivered'
                AND o.created_at >= DATEADD(day, -${days}, GETDATE())
            GROUP BY p.id, p.name, p.price, p.images
            ORDER BY total_sold DESC
        `;
        
        return await query(sql);
    } catch (error) {
        console.error('Top selling products error:', error);
        throw error;
    }
};

// Doanh thu theo tháng
const getMonthlyRevenueData = async (months = 12) => {
    try {
        const sql = `
            SELECT 
                FORMAT(created_at, 'yyyy-MM') as month,
                SUM(total) as revenue,
                COUNT(*) as order_count
            FROM Orders
            WHERE order_status = 'delivered'
                AND created_at >= DATEADD(month, -${months}, GETDATE())
            GROUP BY FORMAT(created_at, 'yyyy-MM')
            ORDER BY month
        `;
        
        return await query(sql);
    } catch (error) {
        console.error('Monthly revenue error:', error);
        throw error;
    }
};

module.exports = {
    analyzeRevenueTrend,
    clusterProductsByName,
    segmentCustomers,
    getMarketBasketAnalysis,
    getDashboardStatistics,
    getTopSellingProducts,
    getMonthlyRevenueData
};
