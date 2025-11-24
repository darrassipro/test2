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
    // Si l'erreur est une erreur de parsing JSON
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

// API Stories
export const storyApi = createApi({
  reducerPath: 'storyApi',
  baseQuery,
  tagTypes: ['Story'],
  endpoints: (builder) => ({
    // Récupérer toutes les stories (dernière story de chaque utilisateur)
    getAllStories: builder.query({
      query: () => '/stories',
      providesTags: ['Story'],
    }),
    // Récupérer toutes les stories d'un utilisateur spécifique
    getStoriesByUser: builder.query({
      query: (userId) => {
        // Normaliser userId (peut être un tableau)
        const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
        return `/stories/user/${normalizedUserId}`;
      },
      providesTags: (result, error, userId) => {
        const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
        return [{ type: 'Story', id: `user-${normalizedUserId}` }];
      },
    }),
    // Récupérer une story par son ID
    getStoryById: builder.query({
      query: (id) => `/stories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Story', id }],
    }),
  }),
});

export const {
  useGetAllStoriesQuery,
  useGetStoriesByUserQuery,
  useGetStoryByIdQuery,
} = storyApi;

