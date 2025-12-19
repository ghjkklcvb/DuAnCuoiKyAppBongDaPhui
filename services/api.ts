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
      console.error('API Error:', {
        message: error.message,
        url: error.config?.url,
        code: error.code,
        isTimeout: error.code === 'ECONNABORTED' || error.message?.includes('timeout'),
        isNetworkError: error.message === 'Network Error',
      });

      if (error.message === 'Network Error') {
        console.warn('Network Error - No internet connection or server unreachable');
        showOfflineBanner();
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn('Request timeout - server may be slow or unavailable');
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
          console.log('⚠️ 403 is permission error (not token) - keeping tokens');
          console.log('403 message:', errorMessage);
          return Promise.reject(error);
        }
        
        console.log('🔄 403 with token error - attempting refresh');
      } else {
        console.log('🔄 Got 401 - attempting token refresh');
      }

      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('❌ No refresh token found');
          throw new Error('No refresh token');
        }

        console.log('🔄 Calling refresh token API...');
        const response = await axios.post(`${BASE_URL}/user/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
        
        // Save NEW tokens - NO expiry tracking
        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', newRefreshToken],
        ]);
        
        console.log('✅ Token refreshed successfully');

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.log('❌ Token refresh failed - clearing tokens');
        
        // ONLY clear tokens when refresh fails
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        console.log('🚪 User will be logged out');
        
        const authError: any = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        authError.name = 'AuthenticationError';
        return Promise.reject(authError);
      }
    }

    // Log other API errors for debugging
    // Skip logging expected errors (e.g., logout with invalidated token after password change)
    const isLogoutWithInvalidToken = 
      error.config?.url?.includes('/user/logout') && error.response?.status === 400;
    
    if (!isLogoutWithInvalidToken) {
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        url: error.config?.url,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
