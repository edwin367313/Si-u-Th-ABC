import axios from 'axios';
import { API_URL, TOKEN_KEY } from './constants';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem(TOKEN_KEY);
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          toast.error('Bạn không có quyền truy cập!');
          break;
          
        case 404:
          toast.error('Không tìm thấy dữ liệu!');
          break;
          
        case 422:
          toast.error(data.message || 'Dữ liệu không hợp lệ!');
          break;
          
        case 500:
          toast.error('Lỗi server. Vui lòng thử lại sau!');
          break;
          
        default:
          toast.error(data.message || 'Có lỗi xảy ra!');
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      // Network error
      toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra internet!');
      return Promise.reject({ message: 'Network error' });
    } else {
      toast.error('Có lỗi xảy ra!');
      return Promise.reject(error);
    }
  }
);

export default api;
