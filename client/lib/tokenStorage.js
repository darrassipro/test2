import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const REMEMBER_ME_KEY = 'remember_me_preference';

// Import conditionnel de SecureStore
let SecureStore = null;
try {
  if (Platform.OS !== 'web') {
    SecureStore = require('expo-secure-store');
  }
} catch (error) {
  // SecureStore n'est pas disponible, on utilisera AsyncStorage
  console.warn('expo-secure-store not available, using AsyncStorage fallback');
}

// Vérifier si SecureStore est disponible
const isSecureStoreAvailable = () => {
  if (Platform.OS === 'web') {
    return false;
  }
  
  try {
    return SecureStore && 
           typeof SecureStore.setItemAsync === 'function' &&
           typeof SecureStore.getItemAsync === 'function' &&
           typeof SecureStore.deleteItemAsync === 'function';
  } catch (error) {
    return false;
  }
};

/**
 * Sauvegarde le token de manière sécurisée
 * @param {string} token - Le token JWT à sauvegarder
 * @returns {Promise<boolean>} - true si sauvegardé avec succès
 */
export const saveToken = async (token) => {
  try {
    if (isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      // Fallback vers AsyncStorage pour le web ou si SecureStore n'est pas disponible
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

/**
 * Récupère le token depuis le stockage sécurisé
 * @returns {Promise<string|null>} - Le token ou null si non trouvé
 */
export const getToken = async () => {
  try {
    if (isSecureStoreAvailable()) {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      return token;
    } else {
      // Fallback vers AsyncStorage pour le web ou si SecureStore n'est pas disponible
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token;
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Supprime le token du stockage sécurisé
 * @returns {Promise<boolean>} - true si supprimé avec succès
 */
export const removeToken = async () => {
  try {
    if (isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } else {
      // Fallback vers AsyncStorage pour le web ou si SecureStore n'est pas disponible
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    await AsyncStorage.removeItem(REMEMBER_ME_KEY);
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

/**
 * Sauvegarde la préférence "Remember me"
 * @param {boolean} remember - true pour rester connecté
 * @returns {Promise<boolean>}
 */
export const saveRememberMe = async (remember) => {
  try {
    await AsyncStorage.setItem(REMEMBER_ME_KEY, remember ? '1' : '0');
    return true;
  } catch (error) {
    console.error('Error saving remember me preference:', error);
    return false;
  }
};

/**
 * Récupère la préférence "Remember me"
 * @returns {Promise<boolean>}
 */
export const getRememberMe = async () => {
  try {
    const value = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    return value === '1';
  } catch (error) {
    console.error('Error getting remember me preference:', error);
    return false;
  }
};

