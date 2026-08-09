import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';
import EmptyState from '@components/common/EmptyState';
import AppButton from '@components/common/AppButton';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppSelector } from '@redux/hooks';
import { useGetMyNotificationsQuery, useMarkNotificationReadMutation } from '@redux/api/notificationsApi';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { truncate, formatRelativeTime } from '@utils/formatters';
import type { NotificationItem } from '@apptypes/models';
import type { ProfileStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Notifications'>;

const NOTIF_ICONS: Record<NotificationItem['type'], keyof typeof MaterialCommunityIcons.glyphMap> = {
  breaking_news: 'flash-alert-outline',
  live_show: 'radio-tower',
  new_podcast: 'podcast',
  announcement: 'bullhorn-outline',
};

const NotificationsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  const goToSignIn = useCallback(() => {
    (navigation.getParent()?.getParent() as any)?.navigate('Auth', { screen: 'Login' });
  }, [navigation]);

  const {
    data, isLoading, isError, isFetching, refetch,
  } = useGetMyNotificationsQuery(undefined, { skip: !isAuthenticated });
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const items = data?.data ?? [];

  const handlePress = useCallback((item: NotificationItem) => {
    if (!item.is_read) void markNotificationRead(item.id);

    const screen = item.data?.screen;
    const idOrSlug = item.data?.idOrSlug ?? item.data?.id ?? item.data?.slug;
    if (typeof screen !== 'string' || typeof idOrSlug !== 'string') return;

    const tabNav = navigation.getParent() as any;
    switch (screen) {
      case 'NewsDetail':
        tabNav?.navigate('HomeTab', { screen: 'NewsDetail', params: { idOrSlug } });
        break;
      case 'ProgramDetail':
        tabNav?.navigate('HomeTab', { screen: 'ProgramDetail', params: { idOrSlug } });
        break;
      case 'PresenterDetail':
        tabNav?.navigate('HomeTab', { screen: 'PresenterDetail', params: { idOrSlug } });
        break;
      case 'PodcastDetail':
        tabNav?.navigate('PodcastsTab', { screen: 'PodcastDetail', params: { idOrSlug } });
        break;
      default:
        break;
    }
  }, [markNotificationRead, navigation]);

  if (!isAuthenticated) {
    return (
      <ScreenContainer edges={['top']}>
        <View style={styles.header}>
          <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('profile.menu.notifications')}</Text>
        </View>
        <EmptyState
          icon="bell-outline"
          title={t('notifications.signInTitle')}
          description={t('notifications.signInDescription')}
          action={<AppButton label={t('auth.login.signInButton')} onPress={goToSignIn} style={styles.signInButton} />}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isFetching} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('profile.menu.notifications')}</Text>
      </View>

      {isLoading ? (
        <LoadingIndicator fullscreen />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="bell-off-outline" title={t('notifications.emptyTitle')} description={t('notifications.emptyDescription')} />
      ) : (
        <View style={styles.list}>
          {items.map((item) => {
            const unread = !item.is_read;
            return (
              <Pressable
                key={item.id}
                onPress={() => handlePress(item)}
                style={[styles.row, { backgroundColor: unread ? colors.primaryContainer : colors.card }]}
              >
                <View style={[styles.iconWrap, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialCommunityIcons name={NOTIF_ICONS[item.type] ?? 'bell-outline'} size={20} color={colors.primary} />
                </View>
                <View style={styles.rowBody}>
                  <Text numberOfLines={1} style={[unread ? styles.titleUnread : styles.title, { color: colors.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={2} style={[styles.body, { color: colors.textSecondary }]}>
                    {truncate(item.body, 120)}
                  </Text>
                  <Text style={[styles.time, { color: colors.textMuted }]}>
                    {formatRelativeTime(item.created_at)}
                  </Text>
                </View>
                {unread && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  signInButton: { minWidth: 200 },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderRadius: radius.md,
    padding: spacing.sm, marginBottom: spacing.sm,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1 },
  title: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.base },
  titleUnread: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base },
  body: { fontFamily: fontFamily.body, fontSize: fontSize.sm, marginTop: 2 },
  time: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});

export default NotificationsScreen;
