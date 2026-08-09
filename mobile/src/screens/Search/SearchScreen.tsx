import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, TextInput, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import SectionHeader from '@components/common/SectionHeader';
import LoadingIndicator from '@components/common/LoadingIndicator';
import EmptyState from '@components/common/EmptyState';
import ProgramCard from '@components/cards/ProgramCard';
import PresenterCard from '@components/cards/PresenterCard';
import NewsCard from '@components/cards/NewsCard';
import PodcastCard from '@components/cards/PodcastCard';
import EpisodeRow from '@components/cards/EpisodeRow';

import { useAppTheme } from '@theme/ThemeProvider';
import { useLazySearchQuery } from '@redux/api/searchApi';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import { APP_NAME } from '@constants/config';
import type {
  Program, Presenter, NewsArticle, Podcast, PodcastEpisode,
} from '@apptypes/models';
import type { RootStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Search'>;

const SearchScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [trigger, { data, isFetching }] = useLazySearchQuery();

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (debounced.length >= 2) {
      void trigger({ q: debounced });
    }
  }, [debounced, trigger]);

  const hasQuery = debounced.length >= 2;
  const results = data?.data;
  const totalResults = results
    ? (results.programs?.length ?? 0) + (results.presenters?.length ?? 0) + (results.news?.length ?? 0)
      + (results.podcasts?.length ?? 0) + (results.episodes?.length ?? 0)
    : 0;

  const goToProgram = useCallback((item: Program) => {
    (navigation as any).navigate('Main', { screen: 'HomeTab', params: { screen: 'ProgramDetail', params: { idOrSlug: item.slug } } });
  }, [navigation]);

  const goToPresenter = useCallback((item: Presenter) => {
    (navigation as any).navigate('Main', { screen: 'HomeTab', params: { screen: 'PresenterDetail', params: { idOrSlug: item.slug } } });
  }, [navigation]);

  const goToNews = useCallback((item: NewsArticle) => {
    (navigation as any).navigate('Main', { screen: 'HomeTab', params: { screen: 'NewsDetail', params: { idOrSlug: item.slug } } });
  }, [navigation]);

  const goToPodcast = useCallback((item: Podcast) => {
    (navigation as any).navigate('Main', { screen: 'PodcastsTab', params: { screen: 'PodcastDetail', params: { idOrSlug: item.slug } } });
  }, [navigation]);

  const goToEpisode = useCallback((item: PodcastEpisode) => {
    (navigation as any).navigate('Main', { screen: 'PodcastsTab', params: { screen: 'PodcastDetail', params: { idOrSlug: item.podcast_id } } });
  }, [navigation]);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            returnKeyType="search"
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {!hasQuery && (
        <EmptyState icon="magnify" title={t('search.emptyTitle', { appName: APP_NAME })} description={t('search.emptyDescription')} />
      )}

      {hasQuery && isFetching && <LoadingIndicator fullscreen />}

      {hasQuery && !isFetching && totalResults === 0 && (
        <EmptyState icon="file-search-outline" title={t('search.noResultsTitle')} description={t('search.noResultsDescription', { query: debounced })} />
      )}

      {hasQuery && !isFetching && totalResults > 0 && (
        <View style={styles.results}>
          {!!results?.programs?.length && (
            <>
              <SectionHeader title={t('search.programs')} />
              <FlatList
                horizontal
                data={results.programs}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalPad}
                ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
                renderItem={({ item }) => <ProgramCard program={item} onPress={() => goToProgram(item)} />}
              />
            </>
          )}

          {!!results?.presenters?.length && (
            <>
              <SectionHeader title={t('home.quickLinks.presenters')} />
              <FlatList
                horizontal
                data={results.presenters}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalPad}
                ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
                renderItem={({ item }) => <PresenterCard presenter={item} onPress={() => goToPresenter(item)} />}
              />
            </>
          )}

          {!!results?.podcasts?.length && (
            <>
              <SectionHeader title={t('tabs.podcasts')} />
              <FlatList
                horizontal
                data={results.podcasts}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalPad}
                ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
                renderItem={({ item }) => <PodcastCard podcast={item} onPress={() => goToPodcast(item)} />}
              />
            </>
          )}

          {!!results?.news?.length && (
            <>
              <SectionHeader title={t('news.title')} />
              <View style={styles.newsList}>
                {results.news.map((article) => (
                  <View key={article.id} style={styles.newsItem}>
                    <NewsCard article={article} onPress={() => goToNews(article)} />
                  </View>
                ))}
              </View>
            </>
          )}

          {!!results?.episodes?.length && (
            <>
              <SectionHeader title={t('podcasts.detail.episodes')} />
              <View style={[styles.episodesList, { borderColor: colors.border }]}>
                {results.episodes.map((episode) => (
                  <EpisodeRow key={episode.id} episode={episode} onPress={() => goToEpisode(episode)} />
                ))}
              </View>
            </>
          )}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  closeButton: { padding: 4 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, height: 44,
  },
  searchInput: { flex: 1, fontFamily: fontFamily.body, fontSize: fontSize.base, height: '100%' },
  results: { paddingBottom: spacing.xl },
  horizontalPad: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  newsList: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  newsItem: {},
  episodesList: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});

export default SearchScreen;
