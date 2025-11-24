import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';
import { getToken } from '../lib/tokenStorage';

// Base query avec authentification et gestion des erreurs
const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers, { getState }) => {
      // Récupérer le token depuis SecureStore
      const token = await getToken();
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
    credentials: 'include', // Pour les cookies
  });

  const result = await baseQuery(args, api, extraOptions);

  // Gérer les erreurs de parsing JSON (quand le serveur retourne du HTML)
  if (result.error) {
    // Log pour debug
    if (__DEV__) {
      console.log('🔴 Erreur RTK Query:', {
        status: result.error.status,
        error: result.error.error,
        data: typeof result.error.data === 'string' ? result.error.data.substring(0, 100) : result.error.data,
        url: args?.url,
        method: args?.method,
      });
    }

    // Si l'erreur est une erreur de parsing JSON
    if (result.error.status === 'PARSING_ERROR' || 
        (result.error.data && typeof result.error.data === 'string' && result.error.data.trim().startsWith('<'))) {
      if (__DEV__) {
        console.error('❌ Erreur de parsing JSON - Le serveur a retourné du HTML au lieu de JSON');
        console.error('URL appelée:', `${API_BASE_URL}${args?.url}`);
        console.error('Réponse reçue (premiers 200 caractères):', 
          typeof result.error.data === 'string' ? result.error.data.substring(0, 200) : result.error.data);
      }
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

    // Si c'est une erreur réseau
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

const baseQuery = baseQueryWithErrorHandling;

// API d'authentification
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Inscription
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    // Connexion
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Envoyer OTP
    sendOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/sendOTP',
        method: 'POST',
        body: data,
      }),
    }),

    // Vérifier OTP
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/verifyOTP',
        method: 'POST',
        body: data,
      }),
    }),

    // Renvoyer OTP
    resendOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/resendOTP',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
} = authApi;

