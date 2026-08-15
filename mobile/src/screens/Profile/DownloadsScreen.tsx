import React from 'react';
import {
  StyleSheet, View, Text, Pressable, FlatList, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer, { BOTTOM_INSET } from '@components/common/ScreenContainer';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ComingSoonState from '@components/common/ComingSoonState';
import ErrorState from '@components/common/ErrorState';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetDownloadsQuery, useRemoveDownloadMutation } from '@redux/api/downloadsApi';
import { deleteDownloadedEpisode } from '@services/downloadService';
import { playEpisode } from '@services/audioPlayerService';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { formatFileSize } from '@utils/formatters';
import type { RootStackParamList } from '@navigation/types';
import type { DownloadItem, PodcastEpisode } from '@apptypes/models';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_LABEL_KEY: Record<DownloadItem['status'], string> = {
  queued: 'downloads.status.queued',
  downloading: 'downloads.status.downloading',
  completed: 'downloads.status.completed',
  failed: 'downloads.status.failed',
};

const DownloadsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const {
    data, isLoading, isFetching, error, refetch,
  } = useGetDownloadsQuery();
  const [removeDownload] = useRemoveDownloadMutation();

  const downloads = data?.data ?? [];

  const handlePlay = async (item: DownloadItem) => {
    const episode: PodcastEpisode = {
      id: item.episode_id,
      podcast_id: '',
      title: item.episode_title ?? t('downloads.downloadedEpisode'),
      description: null,
      audio_url: item.local_uri ?? '',
      cover_image_url: item.cover_image_url ?? null,
      duration_seconds: 0,
      episode_number: null,
      season_number: null,
      play_count: 0,
      published_at: new Date().toISOString(),
      podcast_title: item.podcast_title,
    };
    await playEpisode(episode);
    navigation.navigate('NowPlaying', { source: 'episode', episodeId: item.episode_id });
  };

  const handleDelete = (item: DownloadItem) => {
    Alert.alert(
      t('downloads.removeTitle'),
      t('downloads.removeMessage', { title: item.episode_title ?? t('downloads.thisEpisode') }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('downloads.remove'),
          style: 'destructive',
          onPress: async () => {
            // DownloadItem doesn't carry the original audio_url extension, so on-device file
            // cleanup relies on local_uri (already the on-disk path) when present; otherwise
            // we can only remove the DB record.
            if (item.local_uri) {
              try {
                await deleteDownloadedEpisode({
                  id: item.episode_id,
                  audio_url: item.local_uri,
                } as unknown as PodcastEpisode);
              } catch {
                // Non-fatal — proceed to remove the DB record regardless.
              }
            }
            await removeDownload(item.id).unwrap().catch(() => undefined);
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.header}>
        <Text style={[typeStyles.h1, { color: colors.textPrimary }]}>{t('profile.menu.downloads')}</Text>
      </View>

      {isLoading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : downloads.length === 0 ? (
        // Downloads can only come from podcast episodes, which aren't live yet — so
        // an empty list here means "not available yet", not "you haven't saved any".
        // The list rendering below stays intact and takes over once episodes are real.
        <ComingSoonState icon="download-outline" description={t('comingSoon.downloads')} />
      ) : (
        <FlatList
          data={downloads}
          keyExtractor={(item) => item.id}
          style={styles.flexList}
          contentContainerStyle={styles.listContent}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { void handlePlay(item); }}
              style={[styles.row, { borderBottomColor: colors.border }]}
            >
              {item.cover_image_url ? (
                <Image source={{ uri: item.cover_image_url }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.placeholder, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialCommunityIcons name="waveform" size={20} color={colors.primary} />
                </View>
              )}

              <View style={styles.body}>
                <Text numberOfLines={2} style={[styles.title, { color: colors.textPrimary }]}>
                  {item.episode_title ?? t('downloads.untitledEpisode')}
                </Text>
                {!!item.podcast_title && (
                  <Text numberOfLines={1} style={[styles.podcast, { color: colors.textSecondary }]}>{item.podcast_title}</Text>
                )}
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {item.status === 'completed' ? formatFileSize(item.file_size_bytes) || t('downloads.downloaded') : t(STATUS_LABEL_KEY[item.status])}
                </Text>
              </View>

              <Pressable onPress={() => handleDelete(item)} hitSlop={10}>
                <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  flexList: { flex: 1 },
  listContent: { paddingBottom: BOTTOM_INSET },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cover: { width: 52, height: 52, borderRadius: radius.sm },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  title: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  podcast: { fontFamily: fontFamily.body, fontSize: fontSize.xs },
  meta: { fontFamily: fontFamily.body, fontSize: fontSize.xs },
});

export default DownloadsScreen;
