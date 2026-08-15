import React, { useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer, { BOTTOM_INSET } from '@components/common/ScreenContainer';
import LoadingIndicator from '@components/common/LoadingIndicator';
import EmptyState from '@components/common/EmptyState';
import ErrorState from '@components/common/ErrorState';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetFavoritesQuery, useRemoveFavoriteMutation } from '@redux/api/favoritesApi';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { ProfileStackParamList } from '@navigation/types';
import type { Favorite, FavoriteEntityType } from '@apptypes/models';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const FILTERS: { labelKey: string; value: FavoriteEntityType | 'all' }[] = [
  { labelKey: 'common.categoryAll', value: 'all' },
  { labelKey: 'favorites.filters.podcasts', value: 'podcast' },
  { labelKey: 'favorites.filters.episodes', value: 'episode' },
  { labelKey: 'favorites.filters.news', value: 'news' },
  { labelKey: 'favorites.filters.programs', value: 'program' },
  { labelKey: 'favorites.filters.presenters', value: 'presenter' },
];

const ENTITY_ICON: Record<FavoriteEntityType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  podcast: 'podcast',
  episode: 'waveform',
  news: 'newspaper-variant',
  program: 'calendar-clock',
  presenter: 'account-voice',
};

const ENTITY_LABEL_KEY: Record<FavoriteEntityType, string> = {
  podcast: 'favorites.entityLabels.podcast',
  episode: 'favorites.entityLabels.episode',
  news: 'favorites.entityLabels.news',
  program: 'favorites.entityLabels.program',
  presenter: 'favorites.entityLabels.presenter',
};

const FavoritesScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<FavoriteEntityType | 'all'>('all');

  const {
    data, isLoading, isFetching, error, refetch,
  } = useGetFavoritesQuery(filter === 'all' ? undefined : { entityType: filter });
  const [removeFavorite, { isLoading: removing }] = useRemoveFavoriteMutation();

  const favorites = data?.data ?? [];

  const handleViewEntity = (favorite: Favorite) => {
    if (favorite.entity_type === 'presenter') {
      navigation.navigate('PresenterDetail', { idOrSlug: favorite.entity_id });
    }
    // Other entity types (podcast/episode/news/program) live on other tabs' stacks —
    // Favorites only carries entity_type/entity_id, so we surface the record here and
    // leave deep navigation into those tabs to the owning screens' detail routes.
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.header}>
        <Text style={[typeStyles.h1, { color: colors.textPrimary }]}>{t('profile.menu.favorites')}</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const isActive = item.value === filter;
          return (
            <Pressable
              onPress={() => setFilter(item.value)}
              style={[
                styles.pill,
                { backgroundColor: isActive ? colors.primary : colors.surfaceVariant },
              ]}
            >
              <Text style={[styles.pillLabel, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>{t(item.labelKey)}</Text>
            </Pressable>
          );
        }}
      />

      {isLoading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title={t('favorites.emptyTitle')}
          description={t('favorites.emptyDescription')}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          style={styles.flexList}
          contentContainerStyle={styles.listContent}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
                <MaterialCommunityIcons name={ENTITY_ICON[item.entity_type]} size={20} color={colors.primary} />
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{t(ENTITY_LABEL_KEY[item.entity_type])}</Text>
                <Text numberOfLines={1} style={[styles.rowId, { color: colors.textMuted }]}>{item.entity_id}</Text>
              </View>
              {item.entity_type === 'presenter' && (
                <Pressable onPress={() => handleViewEntity(item)} hitSlop={8} style={styles.viewButton}>
                  <Text style={[styles.viewLabel, { color: colors.primary }]}>{t('favorites.view')}</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => removeFavorite({ entityType: item.entity_type, entityId: item.entity_id })}
                disabled={removing}
                hitSlop={10}
              >
                <MaterialCommunityIcons name="heart" size={22} color={colors.error} />
              </Pressable>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  filterRow: { paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.md },
  flexList: { flex: 1 },
  pill: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  pillLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: BOTTOM_INSET, gap: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.sm, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  rowId: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 2 },
  viewButton: { paddingHorizontal: spacing.xs },
  viewLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs },
});

export default FavoritesScreen;
