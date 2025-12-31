const analyticsService = require('../services/analyticsService');

// Phân tích doanh thu theo thời gian (Linear Regression)
const getRevenueAnalysis = async (req, res) => {
    try {
        const { startDate, endDate, predictDays = 30 } = req.query;
        
        const analysis = await analyticsService.analyzeRevenueTrend(
            startDate,
            endDate,
            parseInt(predictDays)
        );
        
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Revenue analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi phân tích doanh thu',
            error: error.message
        });
    }
};

// Phân cụm sản phẩm theo tên (K-Means)
const getProductClusters = async (req, res) => {
    try {
        const { k = 5 } = req.query;
        
        const clusters = await analyticsService.clusterProductsByName(parseInt(k));
        
        res.json({
            success: true,
            data: clusters
        });
    } catch (error) {
        console.error('Product clustering error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi phân cụm sản phẩm',
            error: error.message
        });
    }
};

// Phân loại khách hàng (Decision Tree)
const getCustomerSegmentation = async (req, res) => {
    try {
        const segmentation = await analyticsService.segmentCustomers();
        
        res.json({
            success: true,
            data: segmentation
        });
    } catch (error) {
        console.error('Customer segmentation error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi phân loại khách hàng',
            error: error.message
        });
    }
};

// Dashboard tổng hợp
const getDashboardStats = async (req, res) => {
    try {
        const stats = await analyticsService.getDashboardStatistics();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thống kê dashboard',
            error: error.message
        });
    }
};

// Top sản phẩm bán chạy
const getTopProducts = async (req, res) => {
    try {
        const { limit = 10, days = 30 } = req.query;
        
        const topProducts = await analyticsService.getTopSellingProducts(
            parseInt(limit),
            parseInt(days)
        );
        
        res.json({
            success: true,
            data: topProducts
        });
    } catch (error) {
        console.error('Top products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy top sản phẩm',
            error: error.message
        });
    }
};

// Doanh thu theo tháng
const getMonthlyRevenue = async (req, res) => {
    try {
        const { months = 12 } = req.query;
        
        const revenue = await analyticsService.getMonthlyRevenueData(parseInt(months));
        
        res.json({
            success: true,
            data: revenue
        });
    } catch (error) {
        console.error('Monthly revenue error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy doanh thu tháng',
            error: error.message
        });
    }
};

module.exports = {
    getRevenueAnalysis,
    getProductClusters,
    getCustomerSegmentation,
    getDashboardStats,
    getTopProducts,
    getMonthlyRevenue
};
