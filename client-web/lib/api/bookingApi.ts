import { api } from './baseApi';

export const bookingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchPlaces: builder.query({
      query: (params?: any) => ({
        url: '/booking/places',
        params,
      }),
      providesTags: ['Booking'],
    }),

    listHotels: builder.query({
      query: (params?: any) => ({
        url: '/booking/hotels',
        params,
      }),
      providesTags: ['Booking'],
    }),

    getHotelDetails: builder.query({
      query: (params: any) => ({
        url: '/booking/hotel',
        params,
      }),
      providesTags: ['Booking'],
    }),

    getHotelReviews: builder.query({
      query: (params: any) => ({
        url: '/booking/hotel/reviews',
        params,
      }),
      providesTags: ['Booking'],
    }),

    askHotelQuestion: builder.query({
      query: (params: any) => ({
        url: '/booking/hotel/question',
        params,
      }),
    }),

    searchRates: builder.mutation({
      query: (body: any) => ({
        url: '/booking/rates',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useSearchPlacesQuery,
  useLazySearchPlacesQuery,
  useListHotelsQuery,
  useLazyListHotelsQuery,
  useGetHotelDetailsQuery,
  useGetHotelReviewsQuery,
  useLazyAskHotelQuestionQuery,
  useSearchRatesMutation,
} = bookingApi;
