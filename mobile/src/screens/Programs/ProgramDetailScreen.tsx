import React from 'react';
import {
  StyleSheet, View, Text, Pressable, FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer, { BOTTOM_INSET } from '@components/common/ScreenContainer';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';
import SectionHeader from '@components/common/SectionHeader';
import PresenterCard from '@components/cards/PresenterCard';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetProgramQuery } from '@redux/api/programsApi';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { formatTimeOfDay, formatDayLabel } from '@utils/formatters';
import type { HomeStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type DetailRoute = RouteProp<HomeStackParamList, 'ProgramDetail'>;

const ProgramDetailScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { idOrSlug } = route.params;

  const {
    data, isLoading, isError, refetch,
  } = useGetProgramQuery(idOrSlug);
  const program = data?.data;

  if (isLoading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingIndicator fullscreen />
      </ScreenContainer>
    );
  }

  if (isError || !program) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.backRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <ErrorState onRetry={refetch} description={t('programs.loadError')} />
      </ScreenContainer>
    );
  }

  const schedule = (program.schedule ?? []).slice().sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <ScreenContainer edges={['top']} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerWrap}>
        {program.cover_image_url ? (
          <Image source={{ uri: program.cover_image_url }} style={styles.headerImage} transition={200} />
        ) : (
          <View style={[styles.headerImage, styles.headerPlaceholder, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="microphone-variant" size={64} color={colors.primary} />
          </View>
        )}
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.body}>
        {!!program.category && (
          <View style={[styles.categoryChip, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{program.category.toUpperCase()}</Text>
          </View>
        )}
        <Text style={[typeStyles.h1, { color: colors.textPrimary, marginTop: spacing.sm }]}>{program.title}</Text>
        {!!program.description && (
          <Text style={[typeStyles.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>{program.description}</Text>
        )}
      </View>

      {!!program.presenters?.length && (
        <>
          <SectionHeader title={t('home.quickLinks.presenters')} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={program.presenters}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalListPad}
            ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            renderItem={({ item }) => (
              <PresenterCard presenter={item} onPress={() => navigation.navigate('PresenterDetail', { idOrSlug: item.slug })} />
            )}
          />
        </>
      )}

      <SectionHeader title={t('programs.thisWeek')} />
      {schedule.length === 0 ? (
        <Text style={[typeStyles.body, { color: colors.textMuted, paddingHorizontal: spacing.lg }]}>
          {t('programs.noAirtimes')}
        </Text>
      ) : (
        <View style={styles.scheduleList}>
          {schedule.map((slot) => (
            <View key={slot.id} style={[styles.scheduleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.scheduleDay, { color: colors.textPrimary }]}>{formatDayLabel(slot.day_of_week)}</Text>
              <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>
                {formatTimeOfDay(slot.start_time)} – {formatTimeOfDay(slot.end_time)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: BOTTOM_INSET },
  backRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  headerWrap: { width: '100%', aspectRatio: 1.6, position: 'relative', marginBottom: spacing.lg },
  headerImage: { width: '100%', height: '100%' },
  headerPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  backButton: {
    position: 'absolute', top: spacing.md, left: spacing.lg, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },

  body: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  categoryChip: {
    alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill,
  },
  categoryText: { fontFamily: fontFamily.bodySemiBold, fontSize: 10, letterSpacing: 0.6 },

  horizontalListPad: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },

  scheduleList: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  scheduleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.sm, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth,
  },
  scheduleDay: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  scheduleTime: { fontFamily: fontFamily.body, fontSize: fontSize.sm },
});

export default ProgramDetailScreen;
