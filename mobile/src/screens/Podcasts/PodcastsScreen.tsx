import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, FlatList, useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import SectionHeader from '@components/common/SectionHeader';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';
import EmptyState from '@components/common/EmptyState';
import PodcastCard from '@components/cards/PodcastCard';
import EpisodeRow from '@components/cards/EpisodeRow';

import { useAppTheme } from '@theme/ThemeProvider';
import {
  useGetPodcastCategoriesQuery, useGetPodcastsQuery, useGetContinueListeningQuery,
} from '@redux/api/podcastsApi';
import { playEpisode } from '@services/audioPlayerService';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { PodcastsStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<PodcastsStackParamList>;

const PodcastsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = (windowWidth - spacing.lg * 2 - spacing.md) / 2;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(handle);
  }, [search]);

  const { data: categoriesData } = useGetPodcastCategoriesQuery();
  const categories = categoriesData?.data ?? [];

  const { data: continueData } = useGetContinueListeningQuery();
  const continueEpisodes = continueData?.data ?? [];

  const {
    data, isLoading, isError, refetch, isFetching,
  } = useGetPodcastsQuery({ search: debouncedSearch || undefined, category_id: selectedCategoryId });
  const podcasts = data?.data ?? [];

  const onPlayContinue = (episode: (typeof continueEpisodes)[number]) => {
    void playEpisode(episode, episode.progress_seconds ?? 0);
    (navigation.getParent()?.getParent() as any)?.navigate('NowPlaying', {
      source: 'episode', episodeId: episode.id,
    });
  };

  let body: React.ReactNode;
  if (isLoading) {
    body = <LoadingIndicator fullscreen />;
  } else if (isError) {
    body = <ErrorState onRetry={refetch} description={t('podcasts.loadError')} />;
  } else if (podcasts.length === 0) {
    body = (
      <EmptyState
        icon="podcast"
        title={t('podcasts.noneFound')}
        description={debouncedSearch ? t('podcasts.noResultsFor', { query: debouncedSearch }) : t('podcasts.checkBackSoon')}
      />
    );
  } else {
    body = (
      <FlatList
        data={podcasts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <PodcastCard
            podcast={item}
            width={cardWidth}
            onPress={() => navigation.navigate('PodcastDetail', { idOrSlug: item.slug })}
          />
        )}
      />
    );
  }

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isFetching && !isLoading}>
      <View style={styles.header}>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('tabs.podcasts')}</Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.surfaceVariant }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('podcasts.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.textPrimary }]}
          returnKeyType="search"
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: undefined, name: t('common.categoryAll'), slug: 'all', icon: null }, ...categories]}
        keyExtractor={(item) => item.id ?? 'all'}
        contentContainerStyle={styles.categoryRow}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedCategoryId;
          return (
            <Text
              onPress={() => setSelectedCategoryId(item.id)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                  color: isSelected ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
            >
              {item.name}
            </Text>
          );
        }}
      />

      {continueEpisodes.length > 0 && (
        <>
          <SectionHeader title={t('podcasts.continueListening')} />
          <View style={styles.continueList}>
            {continueEpisodes.map((episode) => (
              <EpisodeRow key={episode.id} episode={episode} onPress={() => onPlayContinue(episode)} />
            ))}
          </View>
        </>
      )}

      <SectionHeader title={t('podcasts.allPodcasts')} />
      {body}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.sm, paddingVertical: 10, borderRadius: radius.pill, marginBottom: spacing.md,
  },
  searchInput: { flex: 1, fontFamily: fontFamily.body, fontSize: fontSize.base, padding: 0 },

  categoryRow: { paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.lg },
  categoryChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill,
    fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, overflow: 'hidden',
  },

  continueList: { marginBottom: spacing.lg },

  gridContent: { paddingHorizontal: spacing.lg, gap: spacing.md },
  gridRow: { justifyContent: 'space-between', marginBottom: spacing.md },
});

export default PodcastsScreen;
