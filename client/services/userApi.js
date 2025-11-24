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

// API utilisateur (CRUD)
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Récupérer l'utilisateur actuel
    getCurrentUser: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    // Récupérer tous les utilisateurs
    getAllUsers: builder.query({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),

    // Récupérer un utilisateur par ID
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Mettre à jour le profil utilisateur
    updateUser: builder.mutation({
      query: (data) => {
        // Si des fichiers sont présents, utiliser FormData
        if (data.profileImage || data.banner) {
          const formData = new FormData();
          
          // Ajouter les champs texte
          Object.keys(data).forEach((key) => {
            if (key !== 'profileImage' && key !== 'banner' && data[key] !== undefined) {
              if (typeof data[key] === 'object') {
                formData.append(key, JSON.stringify(data[key]));
              } else {
                formData.append(key, data[key]);
              }
            }
          });
          
          // Ajouter les images si présentes
          if (data.profileImage) {
            formData.append('profileImage', {
              uri: data.profileImage.uri,
              type: data.profileImage.type || 'image/jpeg',
              name: data.profileImage.name || 'profile.jpg',
            });
          }
          
          if (data.banner) {
            formData.append('banner', {
              uri: data.banner.uri,
              type: data.banner.type || 'image/jpeg',
              name: data.banner.name || 'banner.jpg',
            });
          }
          
          return {
            url: '/users/update',
            method: 'PUT',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          };
        }
        
        // Sinon, envoyer en JSON
        return {
          url: '/users/update',
          method: 'PUT',
          body: data,
        };
      },
      invalidatesTags: ['User'],
    }),

    // Mettre à jour le mot de passe
    updatePassword: builder.mutation({
      query: (data) => ({
        url: '/users/updatePassword',
        method: 'PUT',
        body: data,
      }),
    }),

    // Supprimer un utilisateur
    deleteUser: builder.mutation({
      query: () => ({
        url: '/users/delete',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Compléter l'inscription utilisateur
    completeRegistration: builder.mutation({
      query: (data) => ({
        url: '/users/complete-registration',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdatePasswordMutation,
  useDeleteUserMutation,
  useCompleteRegistrationMutation,
} = userApi;

