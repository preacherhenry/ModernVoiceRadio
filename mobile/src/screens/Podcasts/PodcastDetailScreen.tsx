import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer, { BOTTOM_INSET } from '@components/common/ScreenContainer';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';
import EmptyState from '@components/common/EmptyState';
import SectionHeader from '@components/common/SectionHeader';
import EpisodeRow from '@components/cards/EpisodeRow';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppSelector } from '@redux/hooks';
import { useGetPodcastQuery, useGetEpisodesQuery, useRegisterEpisodePlayMutation } from '@redux/api/podcastsApi';
import { useGetPresenterQuery } from '@redux/api/presentersApi';
import {
  useCheckFavoriteQuery, useAddFavoriteMutation, useRemoveFavoriteMutation,
} from '@redux/api/favoritesApi';
import { useRegisterDownloadMutation } from '@redux/api/downloadsApi';
import { playEpisode } from '@services/audioPlayerService';
import { downloadEpisode, isEpisodeDownloaded } from '@services/downloadService';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { PodcastsStackParamList } from '@navigation/types';
import type { PodcastEpisode } from '@apptypes/models';

type Nav = NativeStackNavigationProp<PodcastsStackParamList>;
type DetailRoute = RouteProp<PodcastsStackParamList, 'PodcastDetail'>;

const PodcastDetailScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { idOrSlug } = route.params;
  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  const {
    data: podcastData, isLoading: podcastLoading, isError: podcastError, refetch: refetchPodcast,
  } = useGetPodcastQuery(idOrSlug);
  const podcast = podcastData?.data;

  const {
    data: episodesData, isLoading: episodesLoading, isError: episodesError, refetch: refetchEpisodes,
  } = useGetEpisodesQuery(podcast ? { podcastId: podcast.id } : { podcastId: '' }, { skip: !podcast });
  const episodes = episodesData?.data ?? [];

  const { data: favData, refetch: refetchFav } = useCheckFavoriteQuery(
    podcast ? { entityType: 'podcast', entityId: podcast.id } : { entityType: 'podcast', entityId: '' },
    { skip: !podcast || !isAuthenticated },
  );
  const isFavorited = favData?.data?.isFavorited ?? false;
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const { data: presenterData } = useGetPresenterQuery(podcast?.presenter_id ?? '', { skip: !podcast?.presenter_id });
  const presenter = presenterData?.data;

  const [registerPlay] = useRegisterEpisodePlayMutation();
  const [registerDownload] = useRegisterDownloadMutation();

  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(episodes.map(async (ep) => [ep.id, await isEpisodeDownloaded(ep)] as const));
      if (!cancelled) setDownloadedIds(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, [episodes]);

  const onToggleFavorite = () => {
    if (!podcast) return;
    if (!isAuthenticated) {
      (navigation.getParent()?.getParent() as any)?.navigate('Auth', { screen: 'Login' });
      return;
    }
    if (isFavorited) {
      void removeFavorite({ entityType: 'podcast', entityId: podcast.id }).then(() => refetchFav());
    } else {
      void addFavorite({ entityType: 'podcast', entityId: podcast.id }).then(() => refetchFav());
    }
  };

  const onPlayEpisode = (episode: PodcastEpisode) => {
    void playEpisode(episode, episode.progress_seconds ?? 0);
    void registerPlay(episode.id);
    (navigation.getParent()?.getParent() as any)?.navigate('NowPlaying', {
      source: 'episode', episodeId: episode.id,
    });
  };

  const onDownloadEpisode = async (episode: PodcastEpisode) => {
    if (downloadedIds[episode.id] || downloadingIds[episode.id] != null) return;
    setDownloadingIds((prev) => ({ ...prev, [episode.id]: 0 }));
    try {
      const { fileSizeBytes } = await downloadEpisode(episode, (ratio) => {
        setDownloadingIds((prev) => ({ ...prev, [episode.id]: ratio }));
      });
      await registerDownload({ episodeId: episode.id, fileSizeBytes });
      setDownloadedIds((prev) => ({ ...prev, [episode.id]: true }));
    } catch {
      // swallow — download failure just leaves the episode not-downloaded
    } finally {
      setDownloadingIds((prev) => {
        const next = { ...prev };
        delete next[episode.id];
        return next;
      });
    }
  };

  if (podcastLoading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingIndicator fullscreen />
      </ScreenContainer>
    );
  }

  if (podcastError || !podcast) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.backRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <ErrorState onRetry={refetchPodcast} description={t('podcasts.detail.loadError')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={onToggleFavorite} hitSlop={10} style={styles.favoriteButton}>
          <MaterialCommunityIcons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorited ? colors.error : colors.textPrimary}
          />
        </Pressable>
      </View>

      <View style={styles.coverWrap}>
        {podcast.cover_image_url ? (
          <Image source={{ uri: podcast.cover_image_url }} style={styles.cover} transition={200} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="podcast" size={56} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={[typeStyles.h1, { color: colors.textPrimary, textAlign: 'center' }]}>{podcast.title}</Text>
        {!!podcast.description && (
          <Text style={[typeStyles.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>{podcast.description}</Text>
        )}
        {!!presenter && (
          <Pressable
            onPress={() => navigation.navigate('PresenterDetail', { idOrSlug: presenter.slug })}
            style={[styles.presenterChip, { backgroundColor: colors.surfaceVariant, alignSelf: 'center' }]}
          >
            <MaterialCommunityIcons name="account-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.presenterChipText, { color: colors.textPrimary }]}>{presenter.full_name}</Text>
          </Pressable>
        )}
      </View>

      <SectionHeader title={t('podcasts.detail.episodes')} />
      {episodesLoading ? (
        <LoadingIndicator />
      ) : episodesError ? (
        <ErrorState onRetry={refetchEpisodes} description={t('podcasts.detail.episodesLoadError')} />
      ) : episodes.length === 0 ? (
        <EmptyState icon="waveform" title={t('podcasts.detail.noEpisodesTitle')} description={t('podcasts.checkBackSoon')} />
      ) : (
        <View style={styles.episodeList}>
          {episodes.map((episode) => {
            const downloadRatio = downloadingIds[episode.id];
            return (
              <View key={episode.id}>
                <EpisodeRow
                  episode={episode}
                  onPress={() => onPlayEpisode(episode)}
                  onDownloadPress={() => onDownloadEpisode(episode)}
                  isDownloaded={!!downloadedIds[episode.id]}
                />
                {downloadRatio != null && (
                  <View style={styles.downloadProgressTrack}>
                    <View
                      style={[
                        styles.downloadProgressFill,
                        { width: `${Math.max(4, downloadRatio * 100)}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: BOTTOM_INSET },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  backRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  backButton: { padding: 4 },
  favoriteButton: { padding: 4 },

  coverWrap: { alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  cover: { width: '100%', aspectRatio: 1, borderRadius: radius.lg },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },

  body: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  presenterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md,
    paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill,
  },
  presenterChipText: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm },

  episodeList: {},
  downloadProgressTrack: {
    height: 2, marginHorizontal: spacing.lg, marginTop: -1, marginBottom: spacing.xxs,
    borderRadius: 1, overflow: 'hidden', backgroundColor: 'transparent',
  },
  downloadProgressFill: { height: '100%' },
});

export default PodcastDetailScreen;
