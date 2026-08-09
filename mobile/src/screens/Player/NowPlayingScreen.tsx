import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, Share, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useProgress } from 'react-native-track-player';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import WaveformAnimation from '@components/player/WaveformAnimation';
import { useAppTheme } from '@theme/ThemeProvider';
import { useAppSelector } from '@redux/hooks';
import {
  pausePlayback, resumePlayback, seekAudioTo, jumpForward, jumpBackward,
} from '@services/audioPlayerService';
import { useAddFavoriteMutation, useCheckFavoriteQuery, useRemoveFavoriteMutation } from '@redux/api/favoritesApi';
import { formatDuration } from '@utils/formatters';
import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { APP_NAME } from '@constants/config';
import type { RootStackParamList } from '@navigation/types';

const NowPlayingScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'NowPlaying'>>();

  const { currentTrack, playbackState } = useAppSelector((state) => state.player);
  const isPlaying = playbackState === 'playing';
  const isEpisode = currentTrack?.source === 'episode';
  const progress = useProgress(500);

  const [showLyrics, setShowLyrics] = useState(false);

  const { data: favData } = useCheckFavoriteQuery(
    isEpisode && currentTrack ? { entityType: 'episode', entityId: currentTrack.id } : { entityType: 'episode', entityId: '' },
    { skip: !isEpisode || !currentTrack },
  );
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const isFavorited = !!favData?.data?.isFavorited;

  useEffect(() => {
    // reset lyrics panel whenever the track changes
    setShowLyrics(false);
  }, [currentTrack?.id]);

  if (!currentTrack) {
    navigation.goBack();
    return null;
  }

  const togglePlayback = () => {
    if (isPlaying) void pausePlayback(); else void resumePlayback();
  };

  const toggleFavorite = () => {
    if (!isEpisode) return;
    if (isFavorited) removeFavorite({ entityType: 'episode', entityId: currentTrack.id });
    else addFavorite({ entityType: 'episode', entityId: currentTrack.id });
  };

  const onShare = () => {
    void Share.share({
      message: t('nowPlaying.shareMessage', { title: currentTrack.title, artist: currentTrack.artist, appName: APP_NAME }),
    });
  };

  const duration = currentTrack.durationSeconds ?? progress.duration;

  return (
    <ScreenContainer edges={['top', 'bottom']} scroll={false}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-down" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>
          {currentTrack.source === 'live' ? t('nowPlaying.playingLive') : t('nowPlaying.nowPlaying')}
        </Text>
        <Pressable onPress={onShare} hitSlop={12}>
          <MaterialCommunityIcons name="share-variant" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.artworkWrap}>
        {currentTrack.artworkUrl ? (
          <Image source={{ uri: currentTrack.artworkUrl }} style={styles.artwork} contentFit="cover" transition={250} />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="radio-tower" size={64} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.meta}>
        <Text numberOfLines={2} style={[typeStyles.h2, { color: colors.textPrimary, textAlign: 'center' }]}>{currentTrack.title}</Text>
        <Text numberOfLines={1} style={[typeStyles.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
          {currentTrack.artist}
        </Text>
      </View>

      {isEpisode ? (
        <View style={styles.progressWrap}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={Math.max(duration, 1)}
            value={progress.position}
            onSlidingComplete={(value) => void seekAudioTo(value)}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.progressLabels}>
            <Text style={[styles.progressTime, { color: colors.textMuted }]}>{formatDuration(progress.position)}</Text>
            <Text style={[styles.progressTime, { color: colors.textMuted }]}>{formatDuration(duration)}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.waveformWrap}>
          <WaveformAnimation active={isPlaying} barCount={9} />
        </View>
      )}

      <View style={styles.controlsRow}>
        <Pressable onPress={toggleFavorite} style={styles.sideButton} disabled={!isEpisode}>
          <MaterialCommunityIcons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={26}
            color={isFavorited ? colors.accent : (isEpisode ? colors.textPrimary : colors.textMuted)}
          />
        </Pressable>

        {isEpisode && (
          <Pressable onPress={() => void jumpBackward(15)} style={styles.sideButton}>
            <MaterialCommunityIcons name="rewind-15" size={28} color={colors.textPrimary} />
          </Pressable>
        )}

        <Pressable onPress={togglePlayback} style={[styles.playButton, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={38} color="#FFFFFF" />
        </Pressable>

        {isEpisode && (
          <Pressable onPress={() => void jumpForward(30)} style={styles.sideButton}>
            <MaterialCommunityIcons name="fast-forward-30" size={28} color={colors.textPrimary} />
          </Pressable>
        )}

        <Pressable onPress={() => setShowLyrics((v) => !v)} style={styles.sideButton}>
          <MaterialCommunityIcons name="text-long" size={24} color={showLyrics ? colors.primary : colors.textPrimary} />
        </Pressable>
      </View>

      {showLyrics && (
        <ScrollView style={[styles.lyricsPanel, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.lyricsText, { color: colors.textSecondary }]}>
            {isEpisode
              ? t('nowPlaying.lyricsUnavailableEpisode', { appName: APP_NAME })
              : t('nowPlaying.lyricsUnavailableBroadcast', { appName: APP_NAME })}
          </Text>
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  headerLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs, letterSpacing: 1 },
  artworkWrap: { alignItems: 'center', marginBottom: spacing.xl },
  artwork: { width: 280, height: 280, borderRadius: radius.xl },
  artworkPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  meta: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  progressWrap: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  slider: { width: '100%', height: 32 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTime: { fontFamily: fontFamily.body, fontSize: fontSize.xs },
  waveformWrap: { alignItems: 'center', marginBottom: spacing.xl },
  controlsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  sideButton: { padding: spacing.xs },
  playButton: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  lyricsPanel: { marginHorizontal: spacing.lg, borderRadius: radius.lg, padding: spacing.lg, maxHeight: 160 },
  lyricsText: { fontFamily: fontFamily.body, fontSize: fontSize.sm, lineHeight: 20 },
});

export default NowPlayingScreen;
