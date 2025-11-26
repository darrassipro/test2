import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';
import { getToken } from '../lib/tokenStorage';

// Centralized baseQuery used by RTK Query APIs in the app.
// Handles auth header injection and common error shaping (parsing/network).
export const baseQuery = async (args, api, extraOptions) => {
  const innerBaseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers, apiWrapper) => {
      try {
        const token = await getToken();
        if (token) headers.set('authorization', `Bearer ${token}`);
      } catch (e) {

      }

      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
    credentials: 'include',
  });

  // Dev-only logging to help debug 401s. Avoid logging sensitive token values in production.
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    try {
      const argUrl = typeof args === 'string' ? args : args?.url;
      const argMethod = typeof args === 'string' ? 'GET' : args?.method || 'GET';
      const token = await getToken();
      console.debug('RTK baseQuery -> request', { url: argUrl, method: argMethod, hasToken: !!token });
    } catch (e) {}
  }

  const result = await innerBaseQuery(args, api, extraOptions);

  if (result.error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      try {
        console.debug('RTK Query baseQuery error', { status: result.error.status, url: args?.url, method: args?.method });
      } catch (e) {}
    }
    if (result.error.status === 'PARSING_ERROR' ||
        (result.error.data && typeof result.error.data === 'string' && result.error.data.trim().startsWith('<'))) {
      return {
        error: {
          status: 'CUSTOM_ERROR',
          data: {
            error: 'Le serveur a retourné une réponse invalide. Vérifiez que le serveur est bien démarré et accessible.',
            code: 'INVALID_RESPONSE',
            message: 'Réponse non-JSON reçue du serveur',
          },
        },
      };
    }

    if (result.error.status === 'FETCH_ERROR') {
      return {
        error: {
          status: 'CUSTOM_ERROR',
          data: {
            error: 'Impossible de se connecter au serveur. Vérifiez votre connexion et que le serveur est démarré.',
            code: 'NETWORK_ERROR',
            message: result.error.error || 'Erreur de connexion',
          },
        },
      };
    }
  }

  return result;
};

export default baseQuery;
