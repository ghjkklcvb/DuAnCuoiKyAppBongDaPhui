/**
 * QUICK FIX GUIDE
 * 
 * Vấn đề: "No refresh token found"
 * 
 * Nguyên nhân có thể:
 * 1. Đăng nhập cũ (trước khi fix code) nên không có refresh token
 * 2. Tokens bị clear nhầm ở đâu đó
 * 
 * Giải pháp:
 * 1. LOGOUT và đăng nhập lại để có tokens mới
 * 2. Hoặc clear AsyncStorage manually:
 * 
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * 
 * const clearAll = async () => {
 *   await AsyncStorage.clear();
 *   console.log('✅ All storage cleared - please login again');
 * };
 * 
 * 3. Sau khi đăng nhập lại, check logs:
 *    - "📥 Login response received"
 *    - "✅ Tokens saved with 7-day refresh token expiry"
 *    - "✅ Verified refresh token saved: YES"
 * 
 * Nếu vẫn lỗi, check:
 * - Backend có trả về refreshToken không?
 * - AsyncStorage có permission không?
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Run this to clear all and start fresh
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ All storage cleared - please login again');
  } catch (error) {
    console.error('❌ Failed to clear storage:', error);
  }
};

// Run this to check current tokens
export const checkTokens = async () => {
  const keys = ['accessToken', 'refreshToken', 'accessTokenExpiry', 'refreshTokenExpiry'];
  const values = await AsyncStorage.multiGet(keys);
  
  console.log('=== CURRENT TOKENS ===');
  values.forEach(([key, value]) => {
    if (value) {
      if (key.includes('Expiry')) {
        const date = new Date(value);
        const isExpired = date < new Date();
        console.log(`${key}: ${date.toLocaleString()} ${isExpired ? '(EXPIRED)' : '(VALID)'}`);
      } else {
        console.log(`${key}: ${value.substring(0, 30)}...`);
      }
    } else {
      console.log(`${key}: ⚠️ NULL/MISSING`);
    }
  });
  console.log('=====================');
};
