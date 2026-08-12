import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet, View, Text, Pressable, FlatList,
} from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import SectionHeader from '@components/common/SectionHeader';
import GlassCard from '@components/common/GlassCard';
import LiveBadge from '@components/common/LiveBadge';
import LoadingIndicator from '@components/common/LoadingIndicator';
import AdvertisementCarousel from '@components/common/AdvertisementCarousel';
import WaveformAnimation from '@components/player/WaveformAnimation';
import ProgramCard from '@components/cards/ProgramCard';
import NewsCard from '@components/cards/NewsCard';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppSelector } from '@redux/hooks';
import { useGetTodayScheduleQuery } from '@redux/api/scheduleApi';
import { useGetNewsQuery } from '@redux/api/newsApi';
import { useGetActiveStreamQuery, useGetNowPlayingQuery } from '@redux/api/streamsApi';
import { useGetActiveAdvertisementsQuery, useRegisterClickMutation, useRegisterImpressionMutation } from '@redux/api/advertisementsApi';
import { playLiveStream, pausePlayback, resumePlayback, DEFAULT_STREAM_FALLBACK } from '@services/audioPlayerService';
import { joinLiveListenerPresence } from '@services/listenerPresenceService';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { gradients } from '@constants/colors';
import { APP_NAME, STATION_FREQUENCY } from '@constants/config';
import { formatTimeOfDay as formatTime } from '@utils/formatters';
import type { HomeStackParamList, MainTabParamList, ProfileStackParamList } from '@navigation/types';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

// Split so the digits can be typeset larger than the "FM" suffix beside them.
const [frequencyValue, frequencyUnit = ''] = STATION_FREQUENCY.split(' ');

const QUICK_LINKS: Array<{ icon: keyof typeof MaterialCommunityIcons.glyphMap; labelKey: string; screen: keyof ProfileStackParamList | 'Schedule' | 'Podcasts' }> = [
  { icon: 'calendar-clock', labelKey: 'home.quickLinks.schedule', screen: 'Schedule' },
  { icon: 'podcast', labelKey: 'home.quickLinks.podcasts', screen: 'Podcasts' },
  { icon: 'account-group', labelKey: 'home.quickLinks.presenters', screen: 'Presenters' },
  { icon: 'chat-processing-outline', labelKey: 'home.quickLinks.liveChat', screen: 'LiveChat' },
  { icon: 'music-note-plus', labelKey: 'home.quickLinks.requests', screen: 'SongRequest' },
  { icon: 'image-multiple-outline', labelKey: 'home.quickLinks.gallery', screen: 'Gallery' },
  { icon: 'phone-outline', labelKey: 'home.quickLinks.contact', screen: 'Contact' },
];

const HomeScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const { currentTrack, playbackState, liveListenerCount } = useAppSelector((state) => state.player);
  const isPlaying = playbackState === 'playing';
  const isBuffering = playbackState === 'buffering' || playbackState === 'loading';

  const { data: streamData } = useGetActiveStreamQuery();
  const activeStream = streamData?.data;
  const { data: nowPlayingData, refetch: refetchNowPlaying } = useGetNowPlayingQuery(
    activeStream ? { streamId: activeStream.id } : undefined,
    { pollingInterval: 20000 },
  );
  const nowPlaying = nowPlayingData?.data;

  const { data: scheduleData, isLoading: scheduleLoading, refetch: refetchSchedule } = useGetTodayScheduleQuery();
  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useGetNewsQuery({ page: 1 });
  const { data: adsData, refetch: refetchAds } = useGetActiveAdvertisementsQuery(
    { placement: 'home_banner' },
    { pollingInterval: 60000 },
  );
  const [registerImpression] = useRegisterImpressionMutation();
  const [registerClick] = useRegisterClickMutation();
  const ads = adsData?.data ?? [];

  const currentSlot = useMemo(() => {
    if (!scheduleData?.data?.length) return null;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return scheduleData.data.find((slot) => {
      const [sh, sm] = slot.start_time.split(':').map(Number);
      const [eh, em] = slot.end_time.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      return nowMinutes >= start && nowMinutes < end;
    }) ?? null;
  }, [scheduleData]);

  const upcomingSlots = useMemo(() => {
    if (!scheduleData?.data?.length) return [];
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return scheduleData.data.filter((slot) => {
      const [sh, sm] = slot.start_time.split(':').map(Number);
      return sh * 60 + sm > nowMinutes;
    }).slice(0, 6);
  }, [scheduleData]);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      await pausePlayback();
      return;
    }
    if (currentTrack?.source === 'live') {
      await resumePlayback();
    } else {
      const stream = activeStream ?? DEFAULT_STREAM_FALLBACK;
      await playLiveStream(stream, nowPlaying);
      joinLiveListenerPresence(stream.id);
    }
  }, [isPlaying, currentTrack, activeStream, nowPlaying]);

  const onRefresh = useCallback(() => {
    refetchSchedule();
    refetchNews();
    refetchNowPlaying();
    refetchAds();
  }, [refetchSchedule, refetchNews, refetchNowPlaying, refetchAds]);

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={[styles.brandIcon, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="radio-tower" size={20} color={colors.primary} />
          </View>
          <Text style={[typeStyles.h3, { color: colors.textPrimary }]}>{APP_NAME}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.getParent()?.navigate('Search' as never)} hitSlop={10} style={styles.headerIcon}>
            <MaterialCommunityIcons name="magnify" size={24} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'Notifications' })} hitSlop={10} style={styles.headerIcon}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Now Playing Hero */}
      <View style={styles.heroWrap}>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroTop}>
            <LiveBadge size="md" />
            {liveListenerCount != null && (
              <View style={styles.listenersPill}>
                <MaterialCommunityIcons name="headphones" size={13} color="#FFFFFF" />
                <Text style={styles.listenersText}>{t('home.listenersCount', { count: liveListenerCount })}</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroShow} numberOfLines={1}>
            {currentSlot?.program_title || t('home.defaultShowTitle')}
          </Text>
          <Text style={styles.heroSong} numberOfLines={1}>
            {nowPlaying?.songTitle ? `${nowPlaying.artist ? `${nowPlaying.artist} — ` : ''}${nowPlaying.songTitle}` : (currentSlot?.presenter_names || t('home.onAirNow'))}
          </Text>

          <View style={styles.heroControls}>
            <Pressable onPress={togglePlayback} style={styles.playButton}>
              {isBuffering ? (
                <LoadingIndicator size={6} />
              ) : (
                <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={32} color={colors.primary} />
              )}
            </Pressable>

            {/* Station frequency — deliberately the largest type on the banner. */}
            <View style={styles.frequencyWrap}>
              <Text style={styles.frequencyValue}>{frequencyValue}</Text>
              {!!frequencyUnit && <Text style={styles.frequencyUnit}>{frequencyUnit}</Text>}
            </View>

            <WaveformAnimation active={isPlaying} barCount={5} />
          </View>
        </LinearGradient>
      </View>

      {/* Quick access */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={QUICK_LINKS}
        keyExtractor={(item) => item.screen}
        contentContainerStyle={styles.quickLinksRow}
        renderItem={({ item }) => (
          <Pressable
            style={styles.quickLink}
            onPress={() => {
              if (item.screen === 'Schedule') (navigation as any).navigate('ScheduleTab');
              else if (item.screen === 'Podcasts') (navigation as any).navigate('PodcastsTab');
              else (navigation as any).navigate('ProfileTab', { screen: item.screen });
            }}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name={item.icon} size={22} color={colors.primary} />
            </View>
            <Text style={[styles.quickLinkLabel, { color: colors.textSecondary }]}>{t(item.labelKey)}</Text>
          </Pressable>
        )}
      />

      {/* Advertisement */}
      {ads.length > 0 && (
        <AdvertisementCarousel
          ads={ads}
          onImpression={(id) => { void registerImpression(id); }}
          onPress={(item) => {
            void registerClick(item.id);
            (navigation.getParent()?.getParent() as any)?.navigate('AdvertisementDetails', { ad: item });
          }}
          style={styles.adWrap}
          imageStyle={styles.adImage}
        />
      )}

      {/* Upcoming Programs */}
      {upcomingSlots.length > 0 && (
        <>
          <SectionHeader title={t('home.upcomingToday')} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={upcomingSlots}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalListPad}
            ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            renderItem={({ item }) => (
              <GlassCard style={styles.upcomingCard}>
                <Text style={[styles.upcomingTime, { color: colors.primary }]}>{formatTime(item.start_time)}</Text>
                <Text numberOfLines={1} style={[styles.upcomingTitle, { color: colors.textPrimary }]}>{item.program_title}</Text>
                {!!item.presenter_names && (
                  <Text numberOfLines={1} style={[styles.upcomingPresenter, { color: colors.textSecondary }]}>{item.presenter_names}</Text>
                )}
              </GlassCard>
            )}
          />
        </>
      )}

      {/* Featured Podcasts — hidden entirely while the catalogue is placeholder-only,
          since every card would lead to an episode list that can't play. The Podcasts
          tab carries the "coming soon" message. */}

      {/* Latest News */}
      <SectionHeader title={t('home.latestNews')} actionLabel={t('common.seeAll')} onActionPress={() => navigation.navigate('NewsMain')} />
      {newsLoading ? <LoadingIndicator /> : (
        <View style={styles.newsList}>
          {(newsData?.data ?? []).slice(0, 4).map((article) => (
            <View key={article.id} style={styles.newsItem}>
              <NewsCard article={article} onPress={() => navigation.navigate('NewsDetail', { idOrSlug: article.slug })} />
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  brandIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerIcon: { padding: 4 },

  heroWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  hero: { borderRadius: radius.xl, padding: spacing.lg },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  listenersPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.xs, paddingVertical: 4, borderRadius: radius.pill,
  },
  listenersText: { color: '#FFFFFF', fontSize: fontSize.xs, fontFamily: fontFamily.bodyMedium },
  heroShow: { color: '#FFFFFF', fontFamily: fontFamily.headingBold, fontSize: fontSize.xl },
  heroSong: { color: 'rgba(255,255,255,0.85)', fontFamily: fontFamily.body, fontSize: fontSize.base, marginTop: 4 },
  heroControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
  playButton: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  frequencyWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 5,
  },
  frequencyValue: {
    color: '#FFFFFF',
    fontFamily: fontFamily.headingBold,
    // Intentionally above every other size on this banner (the show title is 24).
    fontSize: 40,
    letterSpacing: -0.5,
  },
  frequencyUnit: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize.lg,
    letterSpacing: 0.5,
  },

  quickLinksRow: { paddingHorizontal: spacing.lg, gap: spacing.lg, marginBottom: spacing.lg },
  quickLink: { alignItems: 'center', gap: 6, width: 64 },
  quickLinkIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  quickLinkLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyMedium, textAlign: 'center' },

  adWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  adImage: { width: '100%', aspectRatio: 2.8, borderRadius: radius.lg },

  horizontalListPad: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  upcomingCard: { width: 160, marginRight: 0 },
  upcomingTime: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs, marginBottom: 4 },
  upcomingTitle: { fontFamily: fontFamily.headingMedium, fontSize: fontSize.sm },
  upcomingPresenter: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 2 },

  newsList: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  newsItem: {},
});

export default HomeScreen;
