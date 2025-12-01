import { api } from './baseApi';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params?: { page?: number; limit?: number; search?: string; role?: string }) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),

    getUserProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    banUser: builder.mutation({
      query: ({ userId, reason }: { userId: number; reason?: string }) => ({
        url: `/users/${userId}/ban`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['User'],
    }),

    unbanUser: builder.mutation({
      query: (userId: number) => ({
        url: `/users/${userId}/unban`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),

    updateUserRole: builder.mutation({
      query: ({ userId, role }: { userId: number; role: string }) => ({
        url: `/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation({
      query: (userId: number) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserProfileQuery,
  useUpdateUserMutation,
  useBanUserMutation,
  useUnbanUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = userApi;
