import { baseApi } from './baseApi';
import type { ApiEnvelope, ContactInformation } from '@apptypes/models';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRemoteSettings: builder.query<ApiEnvelope<Record<string, unknown>>, void>({
      query: () => ({ url: '/settings' }),
      providesTags: [{ type: 'Settings', id: 'ALL' }],
    }),
    getContactInformation: builder.query<ApiEnvelope<ContactInformation>, void>({
      query: () => ({ url: '/contact' }),
      providesTags: [{ type: 'Contact', id: 'INFO' }],
    }),
  }),
});

export const { useGetRemoteSettingsQuery, useGetContactInformationQuery } = settingsApi;
