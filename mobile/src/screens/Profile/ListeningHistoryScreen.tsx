import React, { useMemo } from 'react';
import {
  StyleSheet, View, Text, SectionList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isToday, isYesterday } from 'date-fns';
import { useTranslation } from 'react-i18next';
import i18n from '@i18n/index';

import ScreenContainer from '@components/common/ScreenContainer';
import LoadingIndicator from '@components/common/LoadingIndicator';
import EmptyState from '@components/common/EmptyState';
import ErrorState from '@components/common/ErrorState';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetListeningHistoryQuery } from '@redux/api/usersApi';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { formatDuration, formatFullDate, formatRelativeTime } from '@utils/formatters';

interface HistoryEntry {
  id: string;
  entity_type: 'live' | 'episode';
  entity_id: string | null;
  duration_seconds: number;
  device_type: string | null;
  created_at: string;
}

interface Section {
  title: string;
  data: HistoryEntry[];
}

function sectionLabelFor(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return i18n.t('common.today');
  if (isYesterday(date)) return i18n.t('common.yesterday');
  return formatFullDate(date);
}

function groupByDate(entries: HistoryEntry[]): Section[] {
  const groups = new Map<string, HistoryEntry[]>();
  entries.forEach((entry) => {
    const label = sectionLabelFor(entry.created_at);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(entry);
  });
  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
}

const ListeningHistoryScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, i18n: i18nInstance } = useTranslation();
  const {
    data, isLoading, isFetching, error, refetch,
  } = useGetListeningHistoryQuery();

  const entries: HistoryEntry[] = data?.data ?? [];
  // Re-groups on language change too — sectionLabelFor's "Today"/"Yesterday"/date labels
  // are translated, so this needs to recompute even when `entries` itself hasn't changed.
  const sections = useMemo(() => groupByDate(entries), [entries, i18nInstance.language]);

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.header}>
        <Text style={[typeStyles.h1, { color: colors.textPrimary }]}>{t('listeningHistory.title')}</Text>
      </View>

      {isLoading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon="history"
          title={t('listeningHistory.emptyTitle')}
          description={t('listeningHistory.emptyDescription')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          style={styles.flexList}
          contentContainerStyle={styles.listContent}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
                <MaterialCommunityIcons
                  name={item.entity_type === 'live' ? 'radio-tower' : 'podcast'}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                  {item.entity_type === 'live' ? t('listeningHistory.liveRadio') : t('listeningHistory.podcastEpisode')}
                </Text>
                <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>
                  {t('listeningHistory.durationListened', { duration: formatDuration(item.duration_seconds) })}
                  {item.device_type ? ` · ${item.device_type}` : ''}
                </Text>
              </View>
              <Text style={[styles.rowTime, { color: colors.textMuted }]}>
                {formatRelativeTime(item.created_at)}
              </Text>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  flexList: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs, letterSpacing: 0.4,
    textTransform: 'uppercase', marginTop: spacing.md, marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.sm, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  rowMeta: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 2 },
  rowTime: { fontFamily: fontFamily.body, fontSize: fontSize.xs },
});

export default ListeningHistoryScreen;
