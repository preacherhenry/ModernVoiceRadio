import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';
import EmptyState from '@components/common/EmptyState';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppSelector } from '@redux/hooks';
import {
  useGetWeeklyScheduleQuery, useGetMyRemindersQuery, useSetReminderMutation, useRemoveReminderMutation,
} from '@redux/api/scheduleApi';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { formatTimeOfDay, formatDayLabel } from '@utils/formatters';
import type { ScheduleStackParamList } from '@navigation/types';
import type { ScheduleSlot } from '@apptypes/models';

type Nav = NativeStackNavigationProp<ScheduleStackParamList>;

const DAYS = [0, 1, 2, 3, 4, 5, 6];

const ScheduleScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(today);

  const {
    data: scheduleData, isLoading, isError, refetch, isFetching,
  } = useGetWeeklyScheduleQuery();
  const { data: remindersData, refetch: refetchReminders } = useGetMyRemindersQuery(undefined, { skip: !isAuthenticated });
  const [setReminder] = useSetReminderMutation();
  const [removeReminder] = useRemoveReminderMutation();

  const reminderIds = useMemo(
    () => new Set((remindersData?.data ?? []).map((slot) => slot.id)),
    [remindersData],
  );

  const slotsForDay = useMemo(() => {
    const all = scheduleData?.data ?? [];
    return all
      .filter((slot) => slot.day_of_week === selectedDay)
      .slice()
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [scheduleData, selectedDay]);

  const onRefresh = () => {
    refetch();
    if (isAuthenticated) refetchReminders();
  };

  const onToggleReminder = (slot: ScheduleSlot) => {
    if (!isAuthenticated) {
      (navigation.getParent()?.getParent() as any)?.navigate('Auth', { screen: 'Login' });
      return;
    }
    if (reminderIds.has(slot.id)) {
      void removeReminder(slot.id);
    } else {
      void setReminder(slot.id);
    }
  };

  const onPressSlot = (slot: ScheduleSlot) => {
    if (slot.program_slug) {
      navigation.navigate('ProgramDetail', { idOrSlug: slot.program_slug });
    }
  };

  let body: React.ReactNode;
  if (isLoading) {
    body = <LoadingIndicator fullscreen />;
  } else if (isError) {
    body = <ErrorState onRetry={refetch} description={t('schedule.loadError')} />;
  } else if (slotsForDay.length === 0) {
    body = (
      <EmptyState
        icon="calendar-blank-outline"
        title={t('schedule.nothingScheduled')}
        description={t('schedule.nothingScheduledDescription', { day: formatDayLabel(selectedDay) })}
      />
    );
  } else {
    body = (
      <View style={styles.list}>
        {slotsForDay.map((slot) => {
          const isReminded = reminderIds.has(slot.id);
          return (
            <Pressable
              key={slot.id}
              onPress={() => onPressSlot(slot)}
              style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {slot.cover_image_url ? (
                <Image source={{ uri: slot.cover_image_url }} style={styles.cover} transition={200} />
              ) : (
                <View style={[styles.cover, styles.placeholder, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialCommunityIcons name="microphone-variant" size={20} color={colors.primary} />
                </View>
              )}

              <View style={styles.rowBody}>
                <Text style={[styles.time, { color: colors.primary }]}>
                  {formatTimeOfDay(slot.start_time)} – {formatTimeOfDay(slot.end_time)}
                </Text>
                <Text numberOfLines={1} style={[styles.title, { color: colors.textPrimary }]}>
                  {slot.program_title || t('schedule.untitledProgram')}
                </Text>
                {!!slot.presenter_names && (
                  <Text numberOfLines={1} style={[styles.presenter, { color: colors.textSecondary }]}>{slot.presenter_names}</Text>
                )}
              </View>

              <Pressable onPress={() => onToggleReminder(slot)} hitSlop={10} style={styles.bell}>
                <MaterialCommunityIcons
                  name={isReminded ? 'bell' : 'bell-outline'}
                  size={22}
                  color={isReminded ? colors.primary : colors.textMuted}
                />
              </Pressable>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={isFetching && !isLoading}>
      <View style={styles.header}>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('tabs.schedule')}</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={DAYS}
        keyExtractor={(d) => String(d)}
        contentContainerStyle={styles.dayRow}
        renderItem={({ item: day }) => {
          const isSelected = day === selectedDay;
          const isToday = day === today;
          return (
            <Pressable
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayPill,
                { backgroundColor: isSelected ? colors.primary : colors.surfaceVariant },
              ]}
            >
              <Text style={[styles.dayLabel, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                {formatDayLabel(day).slice(0, 3)}
              </Text>
              {isToday && (
                <View style={[styles.todayDot, { backgroundColor: isSelected ? '#FFFFFF' : colors.primary }]} />
              )}
            </Pressable>
          );
        }}
      />

      {body}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  dayRow: { paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.lg },
  dayPill: {
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.pill, minWidth: 56, gap: 4,
  },
  dayLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  todayDot: { width: 4, height: 4, borderRadius: 2 },

  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm,
    borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth,
  },
  cover: { width: 52, height: 52, borderRadius: radius.sm },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, gap: 2 },
  time: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs },
  title: { fontFamily: fontFamily.headingMedium, fontSize: fontSize.base },
  presenter: { fontFamily: fontFamily.body, fontSize: fontSize.xs },
  bell: { padding: 4 },
});

export default ScheduleScreen;
