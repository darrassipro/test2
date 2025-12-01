import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/apiConfig';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

export type SearchRatesPayload = Record<string, any>;

const normalizeBaseUrl = (url: string) => {
  if (!url.endsWith('/')) return url;
  return url.slice(0, -1);
};

const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${normalizeBaseUrl(API_BASE_URL)}/booking/`,
  }),
  endpoints: (builder) => ({
    searchPlaces: builder.query<any, QueryParams | void>({
      query: (params = {}) => ({
        url: 'places',
        method: 'GET',
        params: params as Record<string, any>,
      }),
    }),
    listHotels: builder.query<any, QueryParams | void>({
      query: (params = {}) => ({
        url: 'hotels',
        method: 'GET',
        params: params as Record<string, any>,
      }),
    }),
    getHotelDetails: builder.query<any, QueryParams>({
      query: (params) => ({
        url: 'hotel',
        method: 'GET',
        params,
      }),
    }),
    getHotelReviews: builder.query<any, QueryParams>({
      query: (params) => ({
        url: 'hotel/reviews',
        method: 'GET',
        params,
      }),
    }),
    searchRates: builder.query<any, SearchRatesPayload>({
      query: (body) => ({
        url: 'rates',
        method: 'POST',
        body,
      }),
    }),
    askHotelQuestion: builder.query<
      any,
      { hotelId: string; query: string; allowWebSearch?: boolean }
    >({
      query: ({ hotelId, query, allowWebSearch = false }) => ({
        url: 'hotel/ask',
        method: 'GET',
        params: {
          hotelId,
          query,
          allowWebSearch,
        },
      }),
    }),
  }),
});

export const {
  useLazySearchPlacesQuery,
  useLazyListHotelsQuery,
  useGetHotelDetailsQuery,
  useGetHotelReviewsQuery,
  useLazySearchRatesQuery,
  useLazyAskHotelQuestionQuery,
} = bookingApi;

export default bookingApi;

