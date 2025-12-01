import { api } from './baseApi';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: { email: string; password: string }) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => {
        // Backend returns { success: true, data: { token, user } }
        if (response.success && response.data) {
          return response.data; // Return { token, user }
        }
        return response;
      },
    }),

    register: builder.mutation({
      query: (userData: any) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} = authApi;
