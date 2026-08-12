import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useAppTheme } from '@theme/ThemeProvider';
import { useAppSelector } from '@redux/hooks';
import { pausePlayback, resumePlayback, stopAudioPlayback } from '@services/audioPlayerService';
import GlassCard from '@components/common/GlassCard';
import WaveformAnimation from './WaveformAnimation';
import LiveBadge from '@components/common/LiveBadge';
import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import type { RootStackParamList } from '@navigation/types';

/**
 * Persistent bottom bar shown above the tab bar whenever a track is loaded.
 * Tapping it opens the full NowPlaying screen; the play/pause control works in place.
 */
const MiniPlayer: React.FC = () => {
  const { colors } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentTrack, playbackState, isMiniPlayerVisible } = useAppSelector((state) => state.player);

  if (!isMiniPlayerVisible || !currentTrack) return null;

  const isPlaying = playbackState === 'playing';
  const isBuffering = playbackState === 'buffering' || playbackState === 'loading';

  const togglePlayback = () => {
    if (isPlaying) void pausePlayback();
    else void resumePlayback();
  };

  const onClose = () => {
    void stopAudioPlayback();
  };

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.wrapper}>
      <Pressable
        onPress={() => navigation.navigate('NowPlaying', { source: currentTrack.source, episodeId: currentTrack.source === 'episode' ? currentTrack.id : undefined })}
      >
        <GlassCard style={styles.card} padded={false} strong>
          <View style={styles.row}>
            {currentTrack.artworkUrl ? (
              <Image source={{ uri: currentTrack.artworkUrl }} style={styles.artwork} />
            ) : (
              <View style={[styles.artwork, { backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name="radio" size={20} color={colors.primary} />
              </View>
            )}

            <View style={styles.meta}>
              <Text numberOfLines={1} style={[styles.title, { color: colors.textPrimary }]}>{currentTrack.title}</Text>
              <View style={styles.subRow}>
                {currentTrack.source === 'live' && <LiveBadge size="sm" />}
                <Text numberOfLines={1} style={[styles.artist, { color: colors.textSecondary }]}>{currentTrack.artist}</Text>
              </View>
            </View>

            {isPlaying && <WaveformAnimation active barCount={3} />}

            <Pressable onPress={togglePlayback} hitSlop={10} style={styles.playButton}>
              {isBuffering ? (
                <MaterialCommunityIcons name="progress-clock" size={26} color={colors.primary} />
              ) : (
                <MaterialCommunityIcons name={isPlaying ? 'pause-circle' : 'play-circle'} size={38} color={colors.primary} />
              )}
            </Pressable>

            <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 0,
  },
  card: {
    borderRadius: radius.lg,
    // Lifts the bar off the content scrolling beneath it, so the frosted panel
    // reads as a distinct floating surface rather than a washed-out overlay.
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
  },
  meta: { flex: 1 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  title: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base },
  artist: { fontFamily: fontFamily.body, fontSize: fontSize.xs, flexShrink: 1 },
  playButton: { marginLeft: spacing.xs },
  closeButton: { marginLeft: spacing.xxs },
});

export default MiniPlayer;
