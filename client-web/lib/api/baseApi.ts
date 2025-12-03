import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Base query with HTTP-only cookies
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include', // Important: Send cookies with requests
  prepareHeaders: (headers) => {
    // Cookies are automatically sent, no need to manually add token
    return headers;
  },
});

// Create the main API
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User', 'Community', 'Post', 'Story', 'Admin', 'Analytics', 'Booking', 'Creators'],
  endpoints: () => ({}),
});
