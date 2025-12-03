import { api } from './baseApi';

export const storyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStories: builder.query({
      query: (params?: { page?: number; limit?: number }) => ({
        url: '/stories',
        params,
      }),
      providesTags: ['Story'],
    }),

    getStoriesByUser: builder.query({
      query: (userId: number) => `/stories/user/${userId}`,
      providesTags: ['Story'],
    }),

    getStoryById: builder.query({
      query: (storyId: number) => `/stories/${storyId}`,
      providesTags: ['Story'],
    }),

    createStory: builder.mutation({
      query: (formData) => ({
        url: '/stories',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Story'],
    }),

    deleteStory: builder.mutation({
      query: (storyId: number) => ({
        url: `/stories/${storyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Story'],
    }),
  }),
});

export const {
  useGetStoriesQuery,
  useGetStoriesByUserQuery,
  useGetStoryByIdQuery,
  useCreateStoryMutation,
  useDeleteStoryMutation,
} = storyApi;
