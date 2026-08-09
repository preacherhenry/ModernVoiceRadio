import { baseApi } from './baseApi';
import type {
  ApiEnvelope, NewsArticle, Podcast, PodcastEpisode, Presenter, Program,
} from '@apptypes/models';

interface SearchResults {
  programs?: Program[];
  presenters?: Presenter[];
  news?: NewsArticle[];
  podcasts?: Podcast[];
  episodes?: PodcastEpisode[];
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query<ApiEnvelope<SearchResults>, { q: string; types?: string[] }>({
      query: ({ q, types }) => ({ url: '/search', params: { q, types: types?.join(',') } }),
    }),
  }),
});

export const { useLazySearchQuery } = searchApi;
