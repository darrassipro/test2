import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
// API d'authentification
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Inscription
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    // Connexion
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Envoyer OTP
    sendOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/sendOTP',
        method: 'POST',
        body: data,
      }),
    }),

    // Vérifier OTP
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/verifyOTP',
        method: 'POST',
        body: data,
      }),
    }),

    // Renvoyer OTP
    resendOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/resendOTP',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
} = authApi;

