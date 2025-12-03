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
      query: (data) => ({
        url: '/users/update',
        method: 'PUT',
        body: data,
      }),
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

