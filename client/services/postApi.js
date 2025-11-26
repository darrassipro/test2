import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';

export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery,
  tagTypes: ['Post', 'Community'],
  endpoints: (builder) => ({
    createPost: builder.mutation({
      // Expects FormData with files and fields
      query: (formData) => ({
        url: '/posts',
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ['Post', 'Community'],
    }),
    getPosts: builder.query({
      query: (params) => ({ url: '/posts', method: 'GET', params }),
      providesTags: ['Post'],
    }),
    getPostById: builder.query({
      query: (postId) => ({ url: `/posts/${postId}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    approvePost: builder.mutation({
      query: ({ communityId, postId }) => ({
        url: `/posts/${communityId}/${postId}/approve`,
        method: 'PUT'
      }),
      invalidatesTags: ['Post', 'Community']
    }),
    rejectPost: builder.mutation({
      query: ({ communityId, postId, reason }) => ({
        url: `/posts/${communityId}/${postId}/reject`,
        method: 'PUT',
        body: { reason },
        headers: { 'Content-Type': 'application/json' }
      }),
      invalidatesTags: ['Post', 'Community']
    })
    ,
    togglePostLike: builder.mutation({
      query: (postId) => ({ url: `/posts/${postId}/like`, method: 'POST' }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }, { type: 'Community' }],
    }),

    createComment: builder.mutation({
      query: ({ postId, commentText, replyId }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: { commentText, replyId },
        headers: { 'Content-Type': 'application/json' }
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),

    toggleSavePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/toggle-save`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    recordShare: builder.mutation({
      query: ({ postId, shareText }) => ({
        url: `/posts/${postId}/share`,
        method: 'POST',
        body: { shareText },
        headers: { 'Content-Type': 'application/json' }
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    })
    ,
    toggleCommentLike: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}/like`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }]
    })
  }),
});

export const { useCreatePostMutation, useGetPostsQuery, useGetPostByIdQuery, useApprovePostMutation, useRejectPostMutation, useTogglePostLikeMutation, useToggleSavePostMutation, useCreateCommentMutation, useRecordShareMutation, useToggleCommentLikeMutation } = postApi;
