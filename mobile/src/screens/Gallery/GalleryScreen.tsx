import React, { useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, FlatList, Dimensions, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';
import EmptyState from '@components/common/EmptyState';
import AppButton from '@components/common/AppButton';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetGalleryQuery } from '@redux/api/galleryApi';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { GalleryItem } from '@apptypes/models';

type FilterValue = 'all' | 'photo' | 'video';

const FILTERS: Array<{ labelKey: string; value: FilterValue }> = [
  { labelKey: 'common.categoryAll', value: 'all' },
  { labelKey: 'gallery.photos', value: 'photo' },
  { labelKey: 'gallery.videos', value: 'video' },
];

const NUM_COLUMNS = 3;
const GAP = spacing.xs;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const GalleryScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterValue>('all');
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const {
    data, isLoading, isError, isFetching, refetch,
  } = useGetGalleryQuery(filter === 'all' ? undefined : { media_type: filter });
  const items = data?.data ?? [];

  const renderItem = ({ item }: { item: GalleryItem }) => (
    <Pressable onPress={() => setSelected(item)} style={styles.thumbWrap}>
      <Image
        source={{ uri: item.thumbnail_url || item.media_url }}
        style={[styles.thumb, { backgroundColor: colors.surfaceVariant }]}
        contentFit="cover"
        transition={150}
      />
      {item.media_type === 'video' && (
        <View style={styles.playBadge}>
          <MaterialCommunityIcons name="play-circle" size={22} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );

  return (
    <ScreenContainer scroll={false} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('home.quickLinks.gallery')}</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const isActive = f.value === filter;
          return (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[
                styles.filterPill,
                { backgroundColor: isActive ? colors.primary : colors.surfaceVariant },
              ]}
            >
              <Text style={[styles.filterLabel, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>
                {t(f.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.gridWrap}>
        {isLoading ? (
          <LoadingIndicator fullscreen />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState icon="image-multiple-outline" title={t('gallery.emptyTitle')} description={t('gallery.emptyDescription')} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={NUM_COLUMNS}
            renderItem={renderItem}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            onRefresh={refetch}
            refreshing={isFetching}
          />
        )}
      </View>

      <Portal>
        <Modal visible={!!selected} onDismiss={() => setSelected(null)} contentContainerStyle={styles.lightboxWrap}>
          {selected && (
            <View style={styles.lightbox}>
              <Pressable onPress={() => setSelected(null)} style={styles.closeButton} hitSlop={10}>
                <MaterialCommunityIcons name="close" size={26} color="#FFFFFF" />
              </Pressable>
              <Image source={{ uri: selected.media_url }} style={styles.lightboxImage} contentFit="contain" />
              {!!selected.title && <Text style={styles.lightboxTitle}>{selected.title}</Text>}
              {selected.media_type === 'video' && (
                <View style={styles.videoNote}>
                  <Text style={styles.videoNoteText}>{t('gallery.videoUnavailable')}</Text>
                  <AppButton
                    label={t('gallery.openVideo')}
                    onPress={() => { void Linking.openURL(selected.media_url); }}
                    style={styles.openVideoButton}
                  />
                </View>
              )}
            </View>
          )}
        </Modal>
      </Portal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  filterRow: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  filterPill: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  filterLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  gridWrap: { flex: 1 },
  gridContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  columnWrapper: { gap: GAP },
  thumbWrap: { width: ITEM_SIZE, height: ITEM_SIZE, marginBottom: GAP, borderRadius: radius.sm, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  playBadge: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  lightboxWrap: { flex: 1, margin: 0, backgroundColor: 'rgba(5,5,10,0.95)' },
  lightbox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  closeButton: { position: 'absolute', top: spacing.xl, right: spacing.lg, zIndex: 1, padding: spacing.xs },
  lightboxImage: { width: '100%', aspectRatio: 1 },
  lightboxTitle: {
    color: '#FFFFFF', fontFamily: fontFamily.bodyMedium, fontSize: fontSize.base, textAlign: 'center', marginTop: spacing.md,
  },
  videoNote: { alignItems: 'center', marginTop: spacing.lg },
  videoNoteText: { color: 'rgba(255,255,255,0.75)', fontFamily: fontFamily.body, fontSize: fontSize.sm, textAlign: 'center' },
  openVideoButton: { marginTop: spacing.sm, minWidth: 180 },
});

export default GalleryScreen;
