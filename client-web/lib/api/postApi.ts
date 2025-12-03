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

    toggleLike: builder.mutation({
      query: (postId: number) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'],
    }),

    toggleSave: builder.mutation({
      query: (postId: number) => ({
        url: `/posts/${postId}/toggle-save`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'],
    }),

    createComment: builder.mutation({
      query: ({ postId, commentText, replyId }: { postId: number; commentText: string; replyId?: number }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: { commentText, replyId },
      }),
      invalidatesTags: ['Post'],
    }),

    toggleCommentLike: builder.mutation({
      query: ({ postId, commentId }: { postId: number; commentId: number }) => ({
        url: `/posts/${postId}/comments/${commentId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'],
    }),

    recordShare: builder.mutation({
      query: ({ postId, shareText }: { postId: number; shareText?: string }) => ({
        url: `/posts/${postId}/share`,
        method: 'POST',
        body: { shareText },
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
  useToggleLikeMutation,
  useToggleSaveMutation,
  useCreateCommentMutation,
  useToggleCommentLikeMutation,
  useRecordShareMutation,
} = postApi;
