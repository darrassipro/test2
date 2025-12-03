import { api } from './baseApi';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: { email: string; password: string }) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation({
      query: (userData: any) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Admin', 'Community', 'Post'],
    }),

    verifyOTP: builder.mutation({
      query: (data: { email: string; otp: string }) => ({
        url: '/auth/verifyOTP',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    resendOTP: builder.mutation({
      query: (data: { email: string }) => ({
        url: '/auth/resendOTP',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
} = authApi;
