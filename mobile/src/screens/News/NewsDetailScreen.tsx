import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet, View, Text, Pressable, Share, FlatList, Dimensions, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Portal, Modal } from 'react-native-paper';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer, { BOTTOM_INSET } from '@components/common/ScreenContainer';
import { AuthWall, useRequiresAuth } from '@components/common/AuthRequired';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppSelector } from '@redux/hooks';
import { useGetNewsArticleQuery } from '@redux/api/newsApi';
import {
  useCheckFavoriteQuery, useAddFavoriteMutation, useRemoveFavoriteMutation,
} from '@redux/api/favoritesApi';
import { pausePlayback } from '@services/audioPlayerService';
import { readArticleAloud, stopReadingAloud } from '@services/newsReaderService';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { truncate, formatRelativeTime, formatDayMonthYear } from '@utils/formatters';
import { optimizedImageUrl } from '@utils/imageUrl';
import type { HomeStackParamList } from '@navigation/types';
import type { NewsMediaItem } from '@apptypes/models';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type DetailRoute = RouteProp<HomeStackParamList, 'NewsDetail'>;

const NewsDetailScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { idOrSlug } = route.params;
  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';
  const { playbackState } = useAppSelector((state) => state.player);
  const { blocked, resolving } = useRequiresAuth();

  const {
    data, isLoading, isError, refetch,
  } = useGetNewsArticleQuery(idOrSlug);
  const article = data?.data;

  /**
   * "Reported by: Patrick Kangwa | 15 August 2026". Both credit fields are optional, so
   * whichever parts exist are joined — a name alone, a date alone, or neither (in which
   * case nothing is rendered at all).
   */
  const creditLine = useMemo(() => {
    if (!article) return '';
    const parts: string[] = [];
    if (article.reporter_name?.trim()) {
      parts.push(t('news.detail.reportedBy', { name: article.reporter_name.trim() }));
    }
    if (article.report_date) {
      const formatted = formatDayMonthYear(article.report_date);
      if (formatted) parts.push(formatted);
    }
    return parts.join(' | ');
  }, [article, t]);

  /**
   * The cover's own shape, measured when it loads. Starts at a neutral landscape ratio
   * purely so the space is reserved before the image arrives; once measured, the frame
   * takes the image's real proportions so nothing is cropped away.
   */
  const [coverAspectRatio, setCoverAspectRatio] = useState(16 / 10);

  // Height follows the image's own proportions, capped so a very tall portrait doesn't
  // push the headline and story off the first screen. "contain" keeps the whole picture
  // visible either way — the cap scales it down rather than trimming it.
  const coverHeight = Math.min(SCREEN_WIDTH / coverAspectRatio, SCREEN_HEIGHT * 0.7);

  const [selectedMedia, setSelectedMedia] = useState<NewsMediaItem | null>(null);
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  useEffect(() => () => stopReadingAloud(), []);

  const { data: favData, refetch: refetchFav } = useCheckFavoriteQuery(
    article ? { entityType: 'news', entityId: article.id } : { entityType: 'news', entityId: '' },
    { skip: !article || !isAuthenticated },
  );
  const isFavorited = favData?.data?.isFavorited ?? false;
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const onToggleFavorite = () => {
    if (!article) return;
    if (!isAuthenticated) {
      (navigation.getParent()?.getParent() as any)?.navigate('Auth', { screen: 'Login' });
      return;
    }
    if (isFavorited) {
      void removeFavorite({ entityType: 'news', entityId: article.id }).then(() => refetchFav());
    } else {
      void addFavorite({ entityType: 'news', entityId: article.id }).then(() => refetchFav());
    }
  };

  const onShare = () => {
    if (!article) return;
    void Share.share({
      title: article.title,
      message: `${article.title}\n\n${truncate(article.excerpt || article.content, 140)}`,
    });
  };

  const onToggleReadAloud = () => {
    if (!article) return;
    if (isReadingAloud) {
      stopReadingAloud();
      setIsReadingAloud(false);
      return;
    }
    // Avoid overlapping the narration with live radio/podcast audio already playing.
    if (playbackState === 'playing') void pausePlayback();
    setIsReadingAloud(true);
    readArticleAloud(article.title, article.content, {
      onDone: () => setIsReadingAloud(false),
      onStopped: () => setIsReadingAloud(false),
      onError: () => setIsReadingAloud(false),
    });
  };

  const onPressMedia = (item: NewsMediaItem) => {
    if (item.media_type === 'video') {
      // No in-app video player yet — open in the device's default player/browser.
      void Linking.openURL(item.media_url);
    } else {
      setSelectedMedia(item);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingIndicator fullscreen />
      </ScreenContainer>
    );
  }

  if (isError || !article) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.backRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <ErrorState onRetry={refetch} description={t('news.detail.loadError')} />
      </ScreenContainer>
    );
  }

  // News is for signed-in listeners only.
  if (blocked) {
    return (
      <AuthWall
        resolving={resolving}
        titleKey="news.title"
        descriptionKey="authGate.news"
        icon="newspaper-variant-outline"
      />
    );
  }

  return (
    <ScreenContainer edges={['top']} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.headerWrap, { height: coverHeight, backgroundColor: colors.surfaceVariant }]}>
        {article.cover_image_url ? (
          <Image
            source={{ uri: optimizedImageUrl(article.cover_image_url) }}
            style={styles.headerImage}
            // Show the whole picture rather than filling the frame: a fixed 16:10 box
            // with the default "cover" fit was slicing the top and bottom off portrait
            // photos, which is most of what gets uploaded with a story.
            contentFit="contain"
            transition={200}
            onLoad={(event) => {
              const { width, height } = event.source;
              if (width && height) setCoverAspectRatio(width / height);
            }}
          />
        ) : (
          <View style={[styles.headerImage, styles.headerPlaceholder, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="newspaper-variant" size={56} color={colors.primary} />
          </View>
        )}
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            onPress={onToggleReadAloud}
            hitSlop={10}
            style={[styles.headerActionButton, isReadingAloud && { backgroundColor: colors.primary }]}
          >
            <MaterialCommunityIcons name={isReadingAloud ? 'stop' : 'volume-high'} size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={onShare} hitSlop={10} style={styles.headerActionButton}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={onToggleFavorite} hitSlop={10} style={styles.headerActionButton}>
            <MaterialCommunityIcons
              name={isFavorited ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        {article.is_breaking && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={styles.badgeText}>{t('news.breakingBadge')}</Text>
          </View>
        )}
        <Text style={[typeStyles.h1, { color: colors.textPrimary, marginTop: spacing.sm }]}>{article.title}</Text>
        <Text style={[styles.timestamp, { color: colors.textMuted }]}>
          {formatRelativeTime(article.published_at)}
        </Text>
        <Text style={[typeStyles.bodyLarge, { color: colors.textSecondary, marginTop: spacing.lg }]}>
          {article.content}
        </Text>

        {/* Credits close out the article body itself — deliberately a plain line of text
            continuing the same column, not a titled section or card. Rendered only when
            the article actually carries a credit. */}
        {!!creditLine && (
          <Text style={[styles.credit, { color: colors.textMuted }]}>{creditLine}</Text>
        )}

        {!!article.media?.length && (
          <View style={styles.mediaSection}>
            <Text style={[typeStyles.h4, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              {article.media.length > 1 ? t('news.detail.photosAndVideos') : t('news.detail.media')}
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={article.media}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
              renderItem={({ item }) => (
                <Pressable onPress={() => onPressMedia(item)} style={styles.mediaThumbWrap}>
                  <Image source={{ uri: item.media_url }} style={styles.mediaThumb} transition={200} />
                  {item.media_type === 'video' && (
                    <View style={styles.mediaPlayBadge}>
                      <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              )}
            />
          </View>
        )}
      </View>

      <Portal>
        <Modal
          visible={!!selectedMedia}
          onDismiss={() => setSelectedMedia(null)}
          contentContainerStyle={styles.lightboxWrap}
        >
          {selectedMedia && (
            <Pressable style={styles.lightboxDismiss} onPress={() => setSelectedMedia(null)}>
              <Image source={{ uri: optimizedImageUrl(selectedMedia.media_url, 1400) }} style={styles.lightboxImage} contentFit="contain" />
            </Pressable>
          )}
        </Modal>
      </Portal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: BOTTOM_INSET },
  credit: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  backRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  headerWrap: { width: '100%', position: 'relative', marginBottom: spacing.lg },
  headerImage: { width: '100%', height: '100%' },
  headerPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  backButton: {
    position: 'absolute', top: spacing.md, left: spacing.lg, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  headerActions: {
    position: 'absolute', top: spacing.md, right: spacing.lg, flexDirection: 'row', gap: spacing.xs,
  },
  headerActionButton: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  body: { paddingHorizontal: spacing.lg },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontFamily: fontFamily.bodySemiBold, letterSpacing: 0.6 },
  timestamp: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: spacing.xxs },

  mediaSection: { marginTop: spacing.xl },
  mediaThumbWrap: {
    width: 120, height: 120, borderRadius: radius.md, overflow: 'hidden', position: 'relative',
  },
  mediaThumb: { width: '100%', height: '100%' },
  mediaPlayBadge: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)',
  },

  lightboxWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' },
  lightboxDismiss: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lightboxImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.75 },
});

export default NewsDetailScreen;
