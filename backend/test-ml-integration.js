require('dotenv').config();
const analyticsService = require('./src/services/analyticsService');

async function testIntegration() {
    console.log('Testing ML Service Integration...');

    try {
        // 1. Test Revenue Prediction
        console.log('\n--- Testing Revenue Prediction ---');
        const revenue = await analyticsService.analyzeRevenueTrend();
        console.log('Revenue Result:', JSON.stringify(revenue, null, 2));

        // 2. Test Product Clustering
        console.log('\n--- Testing Product Clustering ---');
        const clusters = await analyticsService.clusterProductsByName();
        console.log('Clusters Result:', JSON.stringify(clusters, null, 2));

        // 3. Test Customer Segmentation
        console.log('\n--- Testing Customer Segmentation ---');
        const segments = await analyticsService.segmentCustomers();
        console.log('Segments Result:', JSON.stringify(segments, null, 2));

        // 4. Test Market Basket Analysis
        console.log('\n--- Testing Market Basket Analysis ---');
        const rules = await analyticsService.getMarketBasketAnalysis();
        console.log('Rules Result:', JSON.stringify(rules, null, 2));

    } catch (error) {
        console.error('Integration Test Failed:', error);
    }
}

testIntegration();
