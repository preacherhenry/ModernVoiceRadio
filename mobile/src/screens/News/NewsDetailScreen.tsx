import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, Share, FlatList, Dimensions, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Portal, Modal } from 'react-native-paper';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
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
import { truncate, formatRelativeTime } from '@utils/formatters';
import type { HomeStackParamList } from '@navigation/types';
import type { NewsMediaItem } from '@apptypes/models';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  const {
    data, isLoading, isError, refetch,
  } = useGetNewsArticleQuery(idOrSlug);
  const article = data?.data;

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

  return (
    <ScreenContainer edges={['top']} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerWrap}>
        {article.cover_image_url ? (
          <Image source={{ uri: article.cover_image_url }} style={styles.headerImage} transition={200} />
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
              <Image source={{ uri: selectedMedia.media_url }} style={styles.lightboxImage} contentFit="contain" />
            </Pressable>
          )}
        </Modal>
      </Portal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl },
  backRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  headerWrap: { width: '100%', aspectRatio: 16 / 10, position: 'relative', marginBottom: spacing.lg },
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
  lightboxImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
});

export default NewsDetailScreen;
