import { baseApi } from '@api/baseApi';
import type { ApiEnvelope, ContactInformation } from '@apptypes/models';

interface ContactInput {
  stationName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<ApiEnvelope<Record<string, unknown>>, void>({
      query: () => ({ url: '/settings' }),
      providesTags: [{ type: 'Settings', id: 'ALL' }],
    }),
    updateSetting: builder.mutation<ApiEnvelope<null>, { key: string; value: unknown }>({
      query: ({ key, value }) => ({ url: `/settings/${key}`, method: 'PUT', data: { value } }),
      invalidatesTags: [{ type: 'Settings', id: 'ALL' }],
    }),
    getContactInfo: builder.query<ApiEnvelope<ContactInformation>, void>({
      query: () => ({ url: '/contact' }),
      providesTags: [{ type: 'Contact', id: 'INFO' }],
    }),
    updateContactInfo: builder.mutation<ApiEnvelope<ContactInformation>, ContactInput>({
      query: (data) => ({ url: '/contact', method: 'PUT', data }),
      invalidatesTags: [{ type: 'Contact', id: 'INFO' }],
    }),
  }),
});

export const {
  useGetSettingsQuery, useUpdateSettingMutation, useGetContactInfoQuery, useUpdateContactInfoMutation,
} = settingsApi;
