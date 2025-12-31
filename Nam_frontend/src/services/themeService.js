import api from '../utils/api';

/**
 * Theme Service
 */
const themeService = {
  /**
   * Get active theme
   */
  getActiveTheme: async () => {
    return await api.get('/themes/active');
  },

  /**
   * Get all themes
   */
  getAll: async () => {
    return await api.get('/themes');
  },

  /**
   * Get theme by ID
   */
  getById: async (id) => {
    return await api.get(`/themes/${id}`);
  },

  /**
   * Create theme (Admin)
   */
  create: async (data) => {
    return await api.post('/themes', data);
  },

  /**
   * Update theme (Admin)
   */
  update: async (id, data) => {
    return await api.put(`/themes/${id}`, data);
  },

  /**
   * Delete theme (Admin)
   */
  delete: async (id) => {
    return await api.delete(`/themes/${id}`);
  },

  /**
   * Set active theme (Admin)
   */
  setActive: async (id) => {
    return await api.post(`/themes/${id}/activate`);
  },

  /**
   * Upload theme icon
   */
  uploadIcon: async (file) => {
    const formData = new FormData();
    formData.append('icon', file);
    return await api.post('/themes/upload-icon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Get theme presets
   */
  getPresets: () => {
    return [
      {
        type: 'tet',
        name: 'Tết Nguyên Đán',
        config: {
          backgroundColor: '#FF0000',
          iconUrl: '🎆',
          effectType: 'fireworks',
          primaryColor: '#FF0000',
          secondaryColor: '#FFD700'
        }
      },
      {
        type: 'spring',
        name: 'Mùa Xuân',
        config: {
          backgroundColor: '#90EE90',
          iconUrl: '🌸',
          effectType: 'flowers',
          primaryColor: '#FF69B4',
          secondaryColor: '#90EE90'
        }
      },
      {
        type: 'summer',
        name: 'Mùa Hè',
        config: {
          backgroundColor: '#87CEEB',
          iconUrl: '☀️',
          effectType: 'sun',
          primaryColor: '#FFD700',
          secondaryColor: '#87CEEB'
        }
      },
      {
        type: 'autumn',
        name: 'Mùa Thu',
        config: {
          backgroundColor: '#FFA500',
          iconUrl: '🍂',
          effectType: 'leaves',
          primaryColor: '#FFA500',
          secondaryColor: '#8B4513'
        }
      },
      {
        type: 'winter',
        name: 'Mùa Đông',
        config: {
          backgroundColor: '#E0F2FF',
          iconUrl: '❄️',
          effectType: 'snow',
          primaryColor: '#ADD8E6',
          secondaryColor: '#FFFFFF'
        }
      }
    ];
  },

  // Local storage for theme
  getLocalTheme: () => {
    const theme = localStorage.getItem('sieuthiabc_theme');
    return theme ? JSON.parse(theme) : null;
  },

  saveLocalTheme: (theme) => {
    localStorage.setItem('sieuthiabc_theme', JSON.stringify(theme));
  },

  clearLocalTheme: () => {
    localStorage.removeItem('sieuthiabc_theme');
  }
};

export default themeService;
