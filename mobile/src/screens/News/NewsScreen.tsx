import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import { AuthWall, useRequiresAuth } from '@components/common/AuthRequired';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';
import EmptyState from '@components/common/EmptyState';
import NewsCard from '@components/cards/NewsCard';
import NewsInlineAdCard from '@components/cards/NewsInlineAdCard';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetNewsCategoriesQuery, useGetNewsQuery } from '@redux/api/newsApi';
import { useGetActiveAdvertisementsQuery } from '@redux/api/advertisementsApi';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { HomeStackParamList } from '@navigation/types';
import type { Advertisement, NewsArticle } from '@apptypes/models';

/** How often an ad is inserted into the regular (non-breaking) article feed. */
const AD_INTERVAL = 4;

type FeedItem =
  | { kind: 'article'; article: NewsArticle }
  | { kind: 'ad'; ad: Advertisement; key: string };

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const TABS = [
  { key: 'latest', labelKey: 'news.tabs.latest' },
  { key: 'trending', labelKey: 'news.tabs.trending' },
  { key: 'breaking', labelKey: 'news.tabs.breaking' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const NewsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const [activeTab, setActiveTab] = useState<TabKey>('latest');
  const { blocked, resolving } = useRequiresAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const { data: categoriesData } = useGetNewsCategoriesQuery();
  const categories = categoriesData?.data ?? [];

  const queryParams = {
    ...(activeTab === 'trending' ? { trending: true } : {}),
    ...(activeTab === 'breaking' ? { breaking: true } : {}),
    ...(selectedCategoryId ? { category_id: selectedCategoryId } : {}),
  };

  const {
    data, isLoading, isError, refetch, isFetching,
  } = useGetNewsQuery(queryParams);
  const articles = data?.data ?? [];

  const { data: inlineAdsData } = useGetActiveAdvertisementsQuery(
    { placement: 'news_inline' },
    { pollingInterval: 60000 },
  );
  const inlineAds = inlineAdsData?.data ?? [];

  const breakingArticles = articles.filter((a) => a.is_breaking);
  const restArticles = articles.filter((a) => !a.is_breaking);

  // Breaking articles stay pinned together, uninterrupted, at the top — ads are only
  // interleaved into the regular feed below, cycling through available ads per slot.
  const restFeed = useMemo<FeedItem[]>(() => {
    if (!inlineAds.length) return restArticles.map((article) => ({ kind: 'article', article }));
    const items: FeedItem[] = [];
    let adCursor = 0;
    restArticles.forEach((article, index) => {
      items.push({ kind: 'article', article });
      if ((index + 1) % AD_INTERVAL === 0) {
        const ad = inlineAds[adCursor % inlineAds.length];
        items.push({ kind: 'ad', ad, key: `ad-${ad.id}-${index}` });
        adCursor += 1;
      }
    });
    return items;
  }, [restArticles, inlineAds]);

  let body: React.ReactNode;
  if (isLoading) {
    body = <LoadingIndicator fullscreen />;
  } else if (isError) {
    body = <ErrorState onRetry={refetch} description={t('news.loadError')} />;
  } else if (articles.length === 0) {
    body = <EmptyState icon="newspaper-variant-outline" title={t('news.noneFound')} description={t('news.checkBackSoon')} />;
  } else {
    body = (
      <View style={styles.articleList}>
        {breakingArticles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            variant="featured"
            onPress={() => navigation.navigate('NewsDetail', { idOrSlug: article.slug })}
          />
        ))}
        {restFeed.map((item) => (
          item.kind === 'article' ? (
            <NewsCard
              key={item.article.id}
              article={item.article}
              variant="default"
              onPress={() => navigation.navigate('NewsDetail', { idOrSlug: item.article.slug })}
            />
          ) : (
            <NewsInlineAdCard key={item.key} ad={item.ad} />
          )
        ))}
      </View>
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
    <ScreenContainer onRefresh={refetch} refreshing={isFetching && !isLoading}>
      <View style={styles.header}>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('news.title')}</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isSelected = tab.key === activeTab;
          return (
            <Text
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                  color: isSelected ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
            >
              {t(tab.labelKey)}
            </Text>
          );
        })}
      </View>

      {categories.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, name: t('common.categoryAll'), slug: 'all' }, ...categories]}
          keyExtractor={(item) => item.id ?? 'all'}
          contentContainerStyle={styles.categoryRow}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedCategoryId;
            return (
              <Text
                onPress={() => setSelectedCategoryId(item.id)}
                style={[
                  styles.categoryChip,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    color: isSelected ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {item.name}
              </Text>
            );
          }}
        />
      )}

      {body}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  tabRow: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  tabPill: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill,
    fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, overflow: 'hidden',
  },
  categoryRow: { paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.lg },
  categoryChip: {
    paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1,
    fontFamily: fontFamily.bodyMedium, fontSize: fontSize.xs, overflow: 'hidden',
  },
  articleList: { paddingHorizontal: spacing.lg, gap: spacing.md },
});

export default NewsScreen;
