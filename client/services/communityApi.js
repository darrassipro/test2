import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';

export const communityApi = createApi({
  reducerPath: 'communityApi',
  baseQuery,
  tagTypes: ['Community'],
  endpoints: (builder) => ({
    createCommunity: builder.mutation({
      // data expected: { name, description, country, socialLinks, bannerImage?, avatarImage?, files?: string[] }
      query: (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.country) formData.append('country', data.country);
        if (data.socialLinks) formData.append('socialLinks', JSON.stringify(data.socialLinks));

        // bannerImage and avatarImage expected to be { uri, name?, type? } or simple uri string
        // We append each file under 'images' and append a matching 'roles' entry so the backend can map roles by index
        if (data.bannerImage) {
          const banner = typeof data.bannerImage === 'string' ? { uri: data.bannerImage, name: 'banner.jpg', type: 'image/jpeg' } : data.bannerImage;
          formData.append('images', banner);
          formData.append('roles', 'banner');
        }

        if (data.avatarImage) {
          const avatar = typeof data.avatarImage === 'string' ? { uri: data.avatarImage, name: 'avatar.jpg', type: 'image/jpeg' } : data.avatarImage;
          formData.append('images', avatar);
          formData.append('roles', 'avatar');
        }

        if (data.files && Array.isArray(data.files)) {
          data.files.forEach((f) => {
            const file = typeof f === 'string' ? { uri: f, name: f.split('/').pop() || 'file.jpg', type: 'image/jpeg' } : f;
            formData.append('images', file);
            formData.append('roles', 'gallery');
          });
        }

        return {
          url: '/communities',
          method: 'POST',
          body: formData,
          headers: {
            // Let environment/tools set proper boundary; this header may be required in some native environments
            'Content-Type': 'multipart/form-data',
          },
        };
      },
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
    })
  }),
});

export const { useCreateCommunityMutation, useGetAllCommunitiesQuery, useGetCommunitiesNotJoinedQuery, useGetCommunityByIdQuery, useGetCommunityMembersQuery, useJoinCommunityMutation } = communityApi;
