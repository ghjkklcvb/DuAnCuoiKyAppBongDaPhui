// DEBUG SCRIPT - Check stored tokens
import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugTokens = async () => {
  console.log('=== DEBUG TOKENS ===');
  
  const keys = ['accessToken', 'refreshToken', 'accessTokenExpiry', 'refreshTokenExpiry'];
  const values = await AsyncStorage.multiGet(keys);
  
  values.forEach(([key, value]) => {
    console.log(`${key}:`, value ? `${value.substring(0, 20)}...` : 'NULL');
  });
  
  // Check if tokens are expired
  const accessExpiry = values.find(([k]) => k === 'accessTokenExpiry')?.[1];
  const refreshExpiry = values.find(([k]) => k === 'refreshTokenExpiry')?.[1];
  
  if (accessExpiry) {
    const isAccessExpired = new Date(accessExpiry) < new Date();
    console.log('Access token expired:', isAccessExpired);
  }
  
  if (refreshExpiry) {
    const isRefreshExpired = new Date(refreshExpiry) < new Date();
    console.log('Refresh token expired:', isRefreshExpired);
  }
  
  console.log('===================');
};
