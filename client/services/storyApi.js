import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
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

