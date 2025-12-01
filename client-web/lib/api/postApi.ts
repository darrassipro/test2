import { api } from './baseApi';

export const postApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: (params?: { page?: number; limit?: number; search?: string }) => ({
        url: '/posts',
        params,
      }),
      providesTags: ['Post'],
    }),

    getPostById: builder.query({
      query: (id: string) => `/posts/${id}`,
      providesTags: ['Post'],
    }),

    createPost: builder.mutation({
      query: (formData) => ({
        url: '/posts',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Post'],
    }),

    updatePost: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Post'],
    }),

    deletePost: builder.mutation({
      query: (id: number) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),

    approvePost: builder.mutation({
      query: (postId: number) => ({
        url: `/posts/${postId}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Post'],
    }),

    rejectPost: builder.mutation({
      query: ({ postId, reason }: { postId: number; reason?: string }) => ({
        url: `/posts/${postId}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Post'],
    }),

    hidePost: builder.mutation({
      query: (postId: number) => ({
        url: `/posts/${postId}/hide`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Post'],
    }),

    boostPost: builder.mutation({
      query: (postId: number) => ({
        url: `/posts/${postId}/boost`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Post'],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useApprovePostMutation,
  useRejectPostMutation,
  useHidePostMutation,
  useBoostPostMutation,
} = postApi;
