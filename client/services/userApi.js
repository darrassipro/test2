import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
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

