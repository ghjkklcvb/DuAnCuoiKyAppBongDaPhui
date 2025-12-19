import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
};

export const authService = {
  // POST /user/register
  register: async (data: RegisterData) => {
    const response = await api.post('/user/register', data);
    return response.data;
  },

  // POST /user/login
  login: async (data: LoginData) => {
    const response = await api.post('/user/login', data);
    const { accessToken, refreshToken } = response.data;
    
    console.log('📥 Login response received');
    console.log('Access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING');
    console.log('Refresh token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'MISSING');
    
    // Save tokens - NO expiry tracking
    await AsyncStorage.multiSet([
      [TOKEN_KEYS.ACCESS_TOKEN, accessToken],
      [TOKEN_KEYS.REFRESH_TOKEN, refreshToken],
    ]);
    
    console.log('✅ Tokens saved (interceptor will handle refresh)');
    
    return response.data;
  },

  // POST /user/logout
  logout: async () => {
    const refreshToken = await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    
    // Only call logout API if we have a refresh token
    if (refreshToken) {
      try {
        await api.post('/user/logout', { refreshToken });
      } catch (error) {
        console.log('⚠️ Logout API call failed, but continuing with local cleanup');
      }
    } else {
      console.log('⚠️ No refresh token found, skipping logout API call');
    }
    
    // Always clear local tokens
    await AsyncStorage.multiRemove([
      TOKEN_KEYS.ACCESS_TOKEN,
      TOKEN_KEYS.REFRESH_TOKEN,
    ]);
  },

  // POST /user/refresh - Refresh access token
  // This is now ONLY called by the interceptor, not manually
  refreshToken: async () => {
    const refreshToken = await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post('/user/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
    
    // Update tokens - NO expiry tracking
    await AsyncStorage.multiSet([
      [TOKEN_KEYS.ACCESS_TOKEN, accessToken],
      [TOKEN_KEYS.REFRESH_TOKEN, newRefreshToken],
    ]);
    
    console.log('✅ Tokens refreshed by interceptor');
    
    return response.data.tokens;
  },

  // GET /user/profile
  getProfile: async () => {
    // Interceptor will handle refresh automatically on 401/403
    const response = await api.get('/user/profile');
    return response.data.infoUser;
  },

  // PATCH /user/update-profile
  updateProfile: async (data: FormData | { username?: string; address?: string; phone?: string; avatar?: string }) => {
    const response = await api.patch('/user/update-profile', data);
    return {
      user: response.data.infoUser || response.data.user,
      message: response.data.message
    };
  },

  // PATCH /user/change-password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
  }) => {
    const response = await api.patch('/user/change-password', {
      oldPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword || data.newPassword,
    });
    return response.data;
  },

  // DELETE /user/delete-account
  deleteAccount: async (password: string) => {
    const response = await api.delete('/user/delete-account', {
      data: { password },
    });
    return response.data;
  },

  // POST /auth/forgot-password - Send OTP to email
  sendOTP: async (email: string) => {
    const response = await api.post('/user/forgot-password', { email });
    return response.data;
  },

  // POST /auth/verify-otp - Verify OTP and get resetToken
  verifyOTP: async (email: string, otp: string) => {
    const response = await api.post('/user/verify-otp', { email, otp });
    return response.data;
  },

  // POST /auth/reset-password - Reset password with resetToken
  resetPassword: async (email: string, resetToken: string, newPassword: string) => {
    const response = await api.post('/user/reset-password', { 
      email, 
      resetToken, 
      newPassword 
    });
    return response.data;
  },
};
