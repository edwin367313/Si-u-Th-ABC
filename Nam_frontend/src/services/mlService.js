import axios from 'axios';
import { ML_SERVICE_URL } from '../utils/constants';

// Create ML service axios instance
const mlApi = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 60000, // ML operations may take longer
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * ML Service - Machine Learning Analytics
 */
const mlService = {
  /**
   * Customer Segmentation (K-Means)
   */
  segmentCustomers: async () => {
    return await mlApi.post('/api/customer-segmentation');
  },

  /**
   * Get customer segments
   */
  getCustomerSegments: async () => {
    return await mlApi.get('/api/customer-segments');
  },

  /**
   * Revenue Prediction (Decision Tree)
   */
  predictRevenue: async (data) => {
    return await mlApi.post('/api/revenue-prediction', data);
  },

  /**
   * Get revenue forecast
   */
  getRevenueForecast: async (months = 6) => {
    return await mlApi.get(`/api/revenue-forecast?months=${months}`);
  },

  /**
   * Product Association (Apriori)
   */
  getProductAssociations: async (minSupport = 0.01, minConfidence = 0.5) => {
    return await mlApi.get(`/api/product-associations?min_support=${minSupport}&min_confidence=${minConfidence}`);
  },

  /**
   * Get frequently bought together
   */
  getFrequentlyBoughtTogether: async (productId) => {
    return await mlApi.get(`/api/frequently-bought-together/${productId}`);
  },

  /**
   * Product Classification by Name (NLP)
   */
  classifyProductByName: async (productName) => {
    return await mlApi.post('/api/classify-product-name', { name: productName });
  },

  /**
   * Product Classification by Image
   */
  classifyProductByImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return await mlApi.post('/api/classify-product-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Auto categorize product
   */
  autoCategorizeProduct: async (productData) => {
    return await mlApi.post('/api/auto-categorize', productData);
  },

  /**
   * Shopping Behavior Analysis
   */
  analyzeShoppingBehavior: async (userId = null) => {
    const url = userId ? `/api/shopping-behavior/${userId}` : '/api/shopping-behavior';
    return await mlApi.get(url);
  },

  /**
   * Get product recommendations
   */
  getRecommendations: async (userId) => {
    return await mlApi.get(`/api/recommendations/${userId}`);
  },

  /**
   * Get trending products
   */
  getTrendingProducts: async (period = 'week', limit = 10) => {
    return await mlApi.get(`/api/trending-products?period=${period}&limit=${limit}`);
  },

  /**
   * Predict customer churn
   */
  predictChurn: async () => {
    return await mlApi.post('/api/predict-churn');
  },

  /**
   * Customer Lifetime Value prediction
   */
  predictCustomerLTV: async (userId) => {
    return await mlApi.get(`/api/customer-ltv/${userId}`);
  },

  /**
   * Train ML models (Admin)
   */
  trainModels: async (modelType) => {
    return await mlApi.post('/api/train-models', { modelType });
  },

  /**
   * Get model performance metrics
   */
  getModelMetrics: async (modelType) => {
    return await mlApi.get(`/api/model-metrics/${modelType}`);
  }
};

export default mlService;
