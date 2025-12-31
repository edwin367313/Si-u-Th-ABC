import api from '../utils/api';

/**
 * Auth Service - Handle authentication
 */
const authService = {
  /**
   * Login
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    console.log('🔍 Login response:', response);
    console.log('🔍 Response.data:', response.data);
    
    // Backend returns: {success: true, data: {accessToken, refreshToken, user}}
    // After axios interceptor unwraps response.data, we get the same structure
    // So we need to access response.data.data.accessToken OR response.data.accessToken
    const tokenData = response.data?.data || response.data; // Handle both cases
    
    if (tokenData?.accessToken) {
      console.log('✅ Saving token:', tokenData.accessToken.substring(0, 20) + '...');
      localStorage.setItem('sieuthiabc_token', tokenData.accessToken);
      localStorage.setItem('sieuthiabc_user', JSON.stringify(tokenData.user));
      
      // Set token to axios default headers immediately
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenData.accessToken}`;
    } else {
      console.error('❌ No accessToken found in response');
      console.error('❌ Response structure:', JSON.stringify(response, null, 2));
    }
    
    // Return the tokenData (unwrapped) so AuthContext can access user directly
    return tokenData;
  },

  /**
   * Register
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const tokenData = response.data?.data || response.data;
    if (tokenData?.accessToken) {
      localStorage.setItem('sieuthiabc_token', tokenData.accessToken);
      localStorage.setItem('sieuthiabc_user', JSON.stringify(tokenData.user));
    }
    return tokenData;
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('sieuthiabc_token');
    localStorage.removeItem('sieuthiabc_user');
    window.location.href = '/login';
  },

  /**
   * Get current user
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('sieuthiabc_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('sieuthiabc_token');
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    return await api.get('/auth/profile');
  },

  /**
   * Update profile
   */
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    if (response.data?.user) {
      localStorage.setItem('sieuthiabc_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data) => {
    return await api.post('/auth/change-password', data);
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    return await api.post('/auth/refresh-token');
  }
};

export default authService;
