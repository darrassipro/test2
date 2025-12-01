import { api } from './baseApi';

export const communityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCommunities: builder.query({
      query: (params?: { page?: number; limit?: number; search?: string }) => ({
        url: '/communities',
        params,
      }),
      providesTags: ['Community'],
    }),

    getCommunityById: builder.query({
      query: (id: string) => `/communities/${id}`,
      providesTags: ['Community'],
    }),

    createCommunity: builder.mutation({
      query: (formData) => ({
        url: '/communities',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Community'],
    }),

    updateCommunity: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/communities/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Community'],
    }),

    deleteCommunity: builder.mutation({
      query: (id: string) => ({
        url: `/communities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Community'],
    }),

    suspendCommunity: builder.mutation({
      query: ({ communityId, reason }: { communityId: number; reason?: string }) => ({
        url: `/communities/${communityId}/suspend`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Community'],
    }),

    activateCommunity: builder.mutation({
      query: (communityId: number) => ({
        url: `/communities/${communityId}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Community'],
    }),

    joinCommunity: builder.mutation({
      query: (id: string) => ({
        url: `/communities/${id}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['Community'],
    }),
  }),
});

export const {
  useGetCommunitiesQuery,
  useGetCommunityByIdQuery,
  useCreateCommunityMutation,
  useUpdateCommunityMutation,
  useDeleteCommunityMutation,
  useSuspendCommunityMutation,
  useActivateCommunityMutation,
  useJoinCommunityMutation,
} = communityApi;
