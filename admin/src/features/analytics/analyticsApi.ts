import { baseApi } from '@api/baseApi';
import type {
  AnalyticsOverview, ApiEnvelope, CityStat, CountryStat, DeviceStat, TrendPoint,
} from '@apptypes/models';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query<ApiEnvelope<AnalyticsOverview>, void>({
      query: () => ({ url: '/analytics/overview' }),
      providesTags: [{ type: 'Analytics', id: 'OVERVIEW' }],
    }),
    getCountries: builder.query<ApiEnvelope<CountryStat[]>, void>({
      query: () => ({ url: '/analytics/countries' }),
    }),
    getCities: builder.query<ApiEnvelope<CityStat[]>, void>({
      query: () => ({ url: '/analytics/cities' }),
    }),
    getDevices: builder.query<ApiEnvelope<DeviceStat[]>, void>({
      query: () => ({ url: '/analytics/devices' }),
    }),
    getTrend: builder.query<ApiEnvelope<TrendPoint[]>, { days?: number } | void>({
      query: (params) => ({ url: '/analytics/trend', params: params ?? { days: 30 } }),
    }),
  }),
});

export const {
  useGetOverviewQuery, useGetCountriesQuery, useGetCitiesQuery, useGetDevicesQuery, useGetTrendQuery,
} = analyticsApi;
