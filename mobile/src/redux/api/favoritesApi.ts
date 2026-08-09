import { baseApi } from './baseApi';
import type { ApiEnvelope, Favorite, FavoriteEntityType } from '@apptypes/models';

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query<ApiEnvelope<Favorite[]>, { entityType?: FavoriteEntityType; page?: number } | void>({
      query: (params) => ({ url: '/favorites', params: params ?? undefined }),
      providesTags: (result) => (result?.data
        ? [...result.data.map((f) => ({ type: 'Favorite' as const, id: `${f.entity_type}:${f.entity_id}` })), { type: 'Favorite' as const, id: 'LIST' }]
        : [{ type: 'Favorite' as const, id: 'LIST' }]),
    }),
    checkFavorite: builder.query<ApiEnvelope<{ isFavorited: boolean }>, { entityType: FavoriteEntityType; entityId: string }>({
      query: (params) => ({ url: '/favorites/check', params }),
      providesTags: (result, error, { entityType, entityId }) => [{ type: 'Favorite', id: `${entityType}:${entityId}` }],
    }),
    addFavorite: builder.mutation<ApiEnvelope<null>, { entityType: FavoriteEntityType; entityId: string }>({
      query: (data) => ({ url: '/favorites', method: 'POST', data }),
      invalidatesTags: (result, error, { entityType, entityId }) => [
        { type: 'Favorite', id: `${entityType}:${entityId}` }, { type: 'Favorite', id: 'LIST' },
      ],
    }),
    removeFavorite: builder.mutation<ApiEnvelope<null>, { entityType: FavoriteEntityType; entityId: string }>({
      query: ({ entityType, entityId }) => ({ url: `/favorites/${entityType}/${entityId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { entityType, entityId }) => [
        { type: 'Favorite', id: `${entityType}:${entityId}` }, { type: 'Favorite', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetFavoritesQuery, useCheckFavoriteQuery, useAddFavoriteMutation, useRemoveFavoriteMutation,
} = favoritesApi;
