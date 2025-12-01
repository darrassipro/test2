import { api } from './baseApi';

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),

    getAnalytics: builder.query({
      query: (params?: { timeRange?: string; metric?: string }) => ({
        url: '/admin/analytics',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getReports: builder.query({
      query: (params?: { status?: string; severity?: string; type?: string }) => ({
        url: '/admin/reports',
        params,
      }),
      providesTags: ['Admin'],
    }),

    approveReport: builder.mutation({
      query: (reportId: number) => ({
        url: `/admin/reports/${reportId}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Admin'],
    }),

    rejectReport: builder.mutation({
      query: ({ reportId, contentId, contentType, reason }: any) => ({
        url: `/admin/reports/${reportId}/reject`,
        method: 'PATCH',
        body: { contentId, contentType, reason },
      }),
      invalidatesTags: ['Admin'],
    }),

    dismissReport: builder.mutation({
      query: (reportId: number) => ({
        url: `/admin/reports/${reportId}/dismiss`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Admin'],
    }),

    getSettings: builder.query({
      query: (section?: string) => ({
        url: '/admin/settings',
        params: section ? { section } : undefined,
      }),
      providesTags: ['Admin'],
    }),

    updateSettings: builder.mutation({
      query: ({ section, settings }: { section: string; settings: any }) => ({
        url: '/admin/settings',
        method: 'PATCH',
        body: { section, settings },
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAnalyticsQuery,
  useGetReportsQuery,
  useApproveReportMutation,
  useRejectReportMutation,
  useDismissReportMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = adminApi;
