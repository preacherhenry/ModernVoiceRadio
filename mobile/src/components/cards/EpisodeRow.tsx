import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { radius, spacing } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import { formatDuration } from '@utils/formatters';
import type { PodcastEpisode } from '@apptypes/models';

interface Props {
  episode: PodcastEpisode;
  onPress: () => void;
  onDownloadPress?: () => void;
  isDownloaded?: boolean;
}

const EpisodeRow: React.FC<Props> = ({
  episode, onPress, onDownloadPress, isDownloaded,
}) => {
  const { colors } = useAppTheme();
  const progressRatio = episode.progress_seconds && episode.duration_seconds
    ? Math.min(1, episode.progress_seconds / episode.duration_seconds)
    : 0;

  return (
    <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: colors.border }]}>
      {episode.cover_image_url ? (
        <Image source={{ uri: episode.cover_image_url }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.placeholder, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons name="waveform" size={20} color={colors.primary} />
        </View>
      )}

      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.title, { color: colors.textPrimary }]}>{episode.title}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{formatDuration(episode.duration_seconds)}</Text>
        {progressRatio > 0 && (
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progressRatio * 100}%`, backgroundColor: colors.primary }]} />
          </View>
        )}
      </View>

      {onDownloadPress && (
        <Pressable onPress={onDownloadPress} hitSlop={10}>
          <MaterialCommunityIcons
            name={isDownloaded ? 'check-circle' : 'download-circle-outline'}
            size={26}
            color={isDownloaded ? colors.success : colors.textMuted}
          />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
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
  body: { flex: 1, gap: 4 },
  title: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  meta: { fontFamily: fontFamily.body, fontSize: fontSize.xs },
  progressTrack: { height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 2 },
  progressFill: { height: '100%' },
});

export default EpisodeRow;
