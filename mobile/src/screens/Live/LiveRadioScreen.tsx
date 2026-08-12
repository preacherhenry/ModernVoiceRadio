import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import LiveBadge from '@components/common/LiveBadge';
import WaveformAnimation from '@components/player/WaveformAnimation';
import OptionSheet from '@components/common/OptionSheet';
import LoadingIndicator from '@components/common/LoadingIndicator';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { useGetStreamsQuery, useGetNowPlayingQuery } from '@redux/api/streamsApi';
import {
  playLiveStream, pausePlayback, resumePlayback, stopAudioPlayback,
  startSleepTimer, cancelSleepTimer, setPlayerVolume, DEFAULT_STREAM_FALLBACK,
} from '@services/audioPlayerService';
import { joinLiveListenerPresence, leaveLiveListenerPresence } from '@services/listenerPresenceService';
import { setVolume, setSelectedBitrate } from '@redux/slices/playerSlice';

import { gradients } from '@constants/colors';
import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { SLEEP_TIMER_PRESETS_MIN } from '@constants/config';

const LiveRadioScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const {
    currentTrack, playbackState, liveListenerCount, volume, sleepTimerEndsAt,
  } = useAppSelector((state) => state.player);

  const isPlaying = playbackState === 'playing';
  const isBuffering = playbackState === 'buffering' || playbackState === 'loading';
  const isLiveActive = currentTrack?.source === 'live';

  const { data: streamsData } = useGetStreamsQuery();
  const streams = streamsData?.data ?? [];
  const [selectedStreamId, setSelectedStreamId] = useState<string | undefined>(undefined);
  const activeStream = streams.find((s) => s.id === selectedStreamId) ?? streams.find((s) => s.is_default) ?? DEFAULT_STREAM_FALLBACK;

  const { data: nowPlayingData } = useGetNowPlayingQuery({ streamId: activeStream.id }, { pollingInterval: 15000 });
  const nowPlaying = nowPlayingData?.data;

  const [bitrateSheetOpen, setBitrateSheetOpen] = useState(false);
  const [sleepSheetOpen, setSleepSheetOpen] = useState(false);

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 1200 }), withTiming(1, { duration: 1200 })), -1, true);
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const handlePlayLive = useCallback(async () => {
    await playLiveStream(activeStream, nowPlaying);
    joinLiveListenerPresence(activeStream.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStream, nowPlaying]);

  const togglePlayback = async () => {
    if (isPlaying && isLiveActive) {
      await pausePlayback();
    } else if (!isPlaying && isLiveActive && currentTrack) {
      await resumePlayback();
    } else {
      await handlePlayLive();
    }
  };

  const handleStop = async () => {
    await stopAudioPlayback();
    leaveLiveListenerPresence();
  };

  const onVolumeChange = (value: number) => {
    dispatch(setVolume(value));
    void setPlayerVolume(value);
  };

  const remainingSleepLabel = sleepTimerEndsAt
    ? t('live.minutesLeft', { count: Math.max(0, Math.round((sleepTimerEndsAt - Date.now()) / 60000)) })
    : null;

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('live.title')}</Text>
        <LiveBadge size="md" />
      </View>

      <View style={styles.artworkWrap}>
        <Animated.View style={pulseStyle}>
          <LinearGradient colors={gradients.primary} style={styles.artwork}>
            <MaterialCommunityIcons name="radio-tower" size={72} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
        {liveListenerCount != null && (
          <View style={[styles.listenersPill, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="headphones" size={14} color={colors.primary} />
            <Text style={[styles.listenersText, { color: colors.textPrimary }]}>{t('live.listenersNowCount', { count: liveListenerCount })}</Text>
          </View>
        )}
      </View>

      <View style={styles.meta}>
        <Text numberOfLines={1} style={[typeStyles.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
          {nowPlaying?.songTitle || t('home.defaultShowTitle')}
        </Text>
        <Text numberOfLines={1} style={[typeStyles.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
          {nowPlaying?.artist || t('live.liveBroadcast')}
        </Text>
      </View>

      <View style={styles.waveformWrap}>
        <WaveformAnimation active={isPlaying} barCount={9} />
      </View>

      <View style={styles.controlsRow}>
        <Pressable onPress={handleStop} style={[styles.secondaryButton, { backgroundColor: colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="stop" size={24} color={colors.textPrimary} />
        </Pressable>

        <Pressable onPress={togglePlayback} style={[styles.playButton, { backgroundColor: colors.primary }]}>
          {isBuffering ? (
            <LoadingIndicator size={8} />
          ) : (
            <MaterialCommunityIcons name={isPlaying && isLiveActive ? 'pause' : 'play'} size={40} color="#FFFFFF" />
          )}
        </Pressable>

        <Pressable onPress={() => setBitrateSheetOpen(true)} style={[styles.secondaryButton, { backgroundColor: colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="tune-variant" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.volumeRow}>
        <MaterialCommunityIcons name="volume-low" size={20} color={colors.textSecondary} />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={onVolumeChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <MaterialCommunityIcons name="volume-high" size={20} color={colors.textSecondary} />
      </View>

      <View style={styles.toolRow}>
        <Pressable style={styles.toolButton} onPress={() => setSleepSheetOpen(true)}>
          <MaterialCommunityIcons name="timer-outline" size={22} color={sleepTimerEndsAt ? colors.primary : colors.textSecondary} />
          <Text style={[styles.toolLabel, { color: sleepTimerEndsAt ? colors.primary : colors.textSecondary }]}>
            {remainingSleepLabel || t('live.sleepTimerLabel')}
          </Text>
        </Pressable>
        {/* No equalizer shortcut here: presets have no effect on playback yet. It
            stays in Settings, where it's clearly marked as coming soon. */}
        <Pressable style={styles.toolButton} onPress={() => setBitrateSheetOpen(true)}>
          <MaterialCommunityIcons name="broadcast" size={22} color={colors.textSecondary} />
          <Text style={[styles.toolLabel, { color: colors.textSecondary }]}>{activeStream.bitrate_kbps} kbps</Text>
        </Pressable>
      </View>

      <Text style={[styles.backgroundNote, { color: colors.textMuted }]}>
        {t('live.backgroundNote')}
      </Text>

      <OptionSheet
        visible={bitrateSheetOpen}
        title={t('live.streamQuality')}
        selectedValue={activeStream.id}
        options={streams.map((s) => ({ label: s.name, value: s.id, description: `${s.bitrate_kbps} kbps · ${s.format.toUpperCase()}` }))}
        onSelect={(value) => { setSelectedStreamId(value); dispatch(setSelectedBitrate(streams.find((s) => s.id === value)?.bitrate_kbps ?? 128)); }}
        onDismiss={() => setBitrateSheetOpen(false)}
      />

      <OptionSheet
        visible={sleepSheetOpen}
        title={t('live.sleepTimerLabel')}
        options={[
          { label: t('live.off'), value: '0' },
          ...SLEEP_TIMER_PRESETS_MIN.map((min) => ({ label: t('live.minutesShort', { count: min }), value: String(min) })),
        ]}
        onSelect={(value) => {
          const minutes = Number(value);
          if (minutes === 0) cancelSleepTimer(); else startSleepTimer(minutes);
        }}
        onDismiss={() => setSleepSheetOpen(false)}
      />

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  artworkWrap: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  artwork: {
    width: 220, height: 220, borderRadius: 110, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: { width: 0, height: 12 },
  },
  listenersPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill,
  },
  listenersText: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.xs },
  meta: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  waveformWrap: { alignItems: 'center', marginBottom: spacing.lg },
  controlsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, marginBottom: spacing.lg,
  },
  secondaryButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  playButton: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  volumeRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.lg,
  },
  slider: { flex: 1, height: 32 },
  toolRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  toolButton: { alignItems: 'center', gap: 4, width: 90 },
  toolLabel: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.xs, textAlign: 'center' },
  backgroundNote: {
    fontFamily: fontFamily.body, fontSize: fontSize.xs, textAlign: 'center', paddingHorizontal: spacing.xxl, marginBottom: spacing.xl,
  },
});

export default LiveRadioScreen;
