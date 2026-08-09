import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, FlatList, useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';
import EmptyState from '@components/common/EmptyState';
import PresenterCard from '@components/cards/PresenterCard';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetPresentersQuery } from '@redux/api/presentersApi';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { ProfileStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const PresentersScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = (windowWidth - spacing.lg * 2 - spacing.md) / 2;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(handle);
  }, [search]);

  const {
    data, isLoading, isError, refetch, isFetching,
  } = useGetPresentersQuery({ search: debouncedSearch || undefined });

  const presenters = data?.data ?? [];

  let body: React.ReactNode;
  if (isLoading) {
    body = <LoadingIndicator fullscreen />;
  } else if (isError) {
    body = <ErrorState onRetry={refetch} description={t('presenters.loadError')} />;
  } else if (presenters.length === 0) {
    body = (
      <EmptyState
        icon="account-group-outline"
        title={t('presenters.noneFound')}
        description={debouncedSearch ? t('podcasts.noResultsFor', { query: debouncedSearch }) : t('presenters.emptyDescription')}
      />
    );
  } else {
    body = (
      <FlatList
        data={presenters}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <PresenterCard
            presenter={item}
            width={cardWidth}
            onPress={() => navigation.navigate('PresenterDetail', { idOrSlug: item.slug })}
          />
        )}
      />
    );
  }

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isFetching && !isLoading}>
      <View style={styles.header}>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('home.quickLinks.presenters')}</Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.surfaceVariant }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('presenters.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.textPrimary }]}
          returnKeyType="search"
        />
      </View>

      {body}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.sm, paddingVertical: 10, borderRadius: radius.pill, marginBottom: spacing.lg,
  },
  searchInput: { flex: 1, fontFamily: fontFamily.body, fontSize: fontSize.base, padding: 0 },
  gridContent: { paddingHorizontal: spacing.lg, gap: spacing.md },
  gridRow: { justifyContent: 'space-between', marginBottom: spacing.md },
});

export default PresentersScreen;
