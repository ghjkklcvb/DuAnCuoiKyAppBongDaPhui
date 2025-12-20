import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { hideOfflineBanner, showOfflineBanner } from '../components/ui/offline-indicator';

const BASE_URL = 'https://fleague-tournament-system.onrender.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Auto-detect Content-Type based on data
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else if (config.data && typeof config.data === 'object') {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    hideOfflineBanner();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors (no response from server)
    if (!error.response) {
      if (error.message === 'Network Error') {
        showOfflineBanner();
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        showOfflineBanner();
      }

      return Promise.reject(error);
    }

    // Handle 401 OR 403 with invalid token - Try to refresh token
    // Backend returns 403 for invalid/expired tokens
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      const errorMessage = error.response?.data?.message || '';
      
      // For 403, check if it's actually a token issue
      // If not related to token, it's a permission error - don't try to refresh
      if (error.response?.status === 403) {
        const isTokenError = 
          errorMessage.toLowerCase().includes('token') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('authentication');
        
        if (!isTokenError) {
          return Promise.reject(error);
        }
      }

      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${BASE_URL}/user/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
        
        // Save NEW tokens - NO expiry tracking
        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', newRefreshToken],
        ]);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // ONLY clear tokens when refresh fails
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        
        const authError: any = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        authError.name = 'AuthenticationError';
        return Promise.reject(authError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
