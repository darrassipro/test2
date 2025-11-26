import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Determine API base URL with a few fallbacks useful for Expo development
const getApiBaseUrl = () => {
  // 1) Explicit env override
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // 2) Try to infer from Expo constants (works with Expo Go / dev clients)
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || null;
  if (hostUri) {
    const host = String(hostUri).split(':')[0];
    const url = `http://${host}:8080/api`;
    console.log('✅ Auto-detected API URL from Expo runtime:', url);
    return url;
  }

  // 3) Web fallback
  if (Platform.OS === 'web') return 'http://localhost:8080/api';

  // 4) Last resort
  console.warn('⚠️ EXPO_PUBLIC_API_URL not set and Expo host could not be detected. Falling back to http://localhost:8080/api');
  return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔗 Expo Host URI:', Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost);

