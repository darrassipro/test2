import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Function to get local IP address dynamically
const getApiBaseUrl = () => {
  // If explicitly set in .env, use that
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Auto-detect for development using Expo's manifest
  const manifest = Constants.expoConfig?.hostUri;
  
  if (manifest) {
    // Extract IP address from Expo's debug server URL 
    const debuggerHost = manifest.split(':')[0];
    const apiUrl = `http://${debuggerHost}:8080/api`;
    console.log('✅ Auto-detected API URL from Expo:', apiUrl);
    return apiUrl;
  }

  // Fallback for web
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }

  // Last resort fallback
  console.warn('⚠️ Could not auto-detect IP. Please set EXPO_PUBLIC_API_URL in .env file');
  return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔗 Expo Host URI:', Constants.expoConfig?.hostUri);

// Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    SEND_OTP: '/auth/sendOTP',
    VERIFY_OTP: '/auth/verifyOTP',
    RESEND_OTP: '/auth/resendOTP',
  },
  // User
  USER: {
    ME: '/users/me',
    ALL: '/users',
    BY_ID: (id) => `/users/${id}`,
    UPDATE: '/users/update',
    UPDATE_PASSWORD: '/users/updatePassword',
    DELETE: '/users/delete',
  },
};
