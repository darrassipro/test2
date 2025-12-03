import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';

export const communityApi = createApi({
  reducerPath: 'communityApi',
  baseQuery,
  tagTypes: ['Community'],
  endpoints: (builder) => ({
    createCommunity: builder.mutation({
      // data is FormData prepared by the component with images and roles fields
      query: (formData) => ({
        url: '/communities',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Community'],
    }),
    getAllCommunities: builder.query({
      query: (params) => ({
        url: '/communities',
        method: 'GET',
        params,
      }),
      providesTags: ['Community'],
    }),

    getCommunitiesNotJoined: builder.query({
      query: (params) => ({
        url: '/communities/not-joined',
        method: 'GET',
        params,
      }),
      providesTags: ['Community'],
    }),
    getCommunityById: builder.query({
      query: (id) => ({
        url: `/communities/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Community', id }],
    }),
    getUserCommunities: builder.query({
      // GET /api/communities/user-joined
      query: (params) => ({
        url: '/communities/user-joined',
        method: 'GET',
        params,
      }),
      providesTags: ['Community'],
    }),
    getCommunityMembers: builder.query({
      // args: { id, page, limit }
      query: ({ id, page = 1, limit = 50 }) => ({
        url: `/communities/${id}/members`,
        method: 'GET',
        params: { page, limit }
      }),
      providesTags: ['Community'],
    }),
    joinCommunity: builder.mutation({
      query: (id) => ({
        url: `/communities/${id}/join`,
        method: 'POST'
      }),
      invalidatesTags: ['Community']
    }),
    updateCommunity: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/communities/${id}`,
        method: 'PUT',
        body: formData,
        // Don't set Content-Type for FormData - let the browser/RN handle it
      }),
      invalidatesTags: (result, error, { id }) => [
        'Community',
        { type: 'Community', id }
      ],
    })
  }),
});

export const { useCreateCommunityMutation, useUpdateCommunityMutation, useGetAllCommunitiesQuery, useGetCommunitiesNotJoinedQuery, useGetCommunityByIdQuery, useGetUserCommunitiesQuery, useGetCommunityMembersQuery, useJoinCommunityMutation } = communityApi;
