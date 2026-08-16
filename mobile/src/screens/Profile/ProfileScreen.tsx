import React from 'react';
import {
  StyleSheet, View, Text, Pressable, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import GlassCard from '@components/common/GlassCard';
import EmptyState from '@components/common/EmptyState';
import AppButton from '@components/common/AppButton';
import Avatar from '@components/common/Avatar';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { useLogoutMutation } from '@redux/api/authApi';
import { useGetUnreadCountQuery } from '@redux/api/notificationsApi';
import { signedOut, clearPersistedTokens } from '@redux/slices/authSlice';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { ProfileStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

interface MenuRow {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey: string;
  screen: keyof ProfileStackParamList;
}

const AUTHENTICATED_ROWS: MenuRow[] = [
  { icon: 'heart-outline', labelKey: 'profile.menu.favorites', screen: 'Favorites' },
  { icon: 'history', labelKey: 'profile.menu.listeningHistory', screen: 'ListeningHistory' },
  { icon: 'download-outline', labelKey: 'profile.menu.downloads', screen: 'Downloads' },
  { icon: 'bell-outline', labelKey: 'profile.menu.notifications', screen: 'Notifications' },
  { icon: 'cog-outline', labelKey: 'profile.menu.settings', screen: 'Settings' },
  { icon: 'account-group-outline', labelKey: 'home.quickLinks.presenters', screen: 'Presenters' },
  { icon: 'image-multiple-outline', labelKey: 'home.quickLinks.gallery', screen: 'Gallery' },
  { icon: 'music-note-plus', labelKey: 'profile.menu.songRequest', screen: 'SongRequest' },
  { icon: 'phone-outline', labelKey: 'home.quickLinks.contact', screen: 'Contact' },
  { icon: 'chat-processing-outline', labelKey: 'home.quickLinks.liveChat', screen: 'LiveChat' },
  { icon: 'information-outline', labelKey: 'profile.menu.about', screen: 'About' },
];

const GUEST_ROWS: MenuRow[] = [
  { icon: 'cog-outline', labelKey: 'profile.menu.settings', screen: 'Settings' },
  { icon: 'account-group-outline', labelKey: 'home.quickLinks.presenters', screen: 'Presenters' },
  { icon: 'image-multiple-outline', labelKey: 'home.quickLinks.gallery', screen: 'Gallery' },
  { icon: 'phone-outline', labelKey: 'home.quickLinks.contact', screen: 'Contact' },
  { icon: 'information-outline', labelKey: 'profile.menu.about', screen: 'About' },
];

const ProfileScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();

  const { user, status, refreshToken } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  const { data: unreadData } = useGetUnreadCountQuery(undefined, { skip: !isAuthenticated });
  const unreadCount = unreadData?.data?.count ?? 0;

  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  const goToAuth = () => {
    const rootNav = navigation.getParent()?.getParent();
    rootNav?.reset({ index: 0, routes: [{ name: 'Auth' as never }] });
  };

  const performLogout = async () => {
    try {
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } catch {
      // Best-effort — clear the local session regardless of network/API outcome.
    } finally {
      dispatch(signedOut());
      await clearPersistedTokens();
      goToAuth();
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(t('profile.logOut'), t('profile.logOutConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logOut'), style: 'destructive', onPress: () => { void performLogout(); } },
    ]);
  };

  const menuRows = isAuthenticated ? AUTHENTICATED_ROWS : GUEST_ROWS;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[typeStyles.h1, { color: colors.textPrimary }]}>{t('tabs.profile')}</Text>
      </View>

      {isAuthenticated && user ? (
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar uri={user.avatarUrl} name={user.fullName} size={64} />
            <View style={styles.profileInfo}>
              <Text numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>{user.fullName}</Text>
              <Text numberOfLines={1} style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('EditProfile')}
              hitSlop={10}
              style={[styles.editButton, { backgroundColor: colors.surfaceVariant }]}
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </GlassCard>
      ) : (
        <View style={styles.guestWrap}>
          <EmptyState
            icon="account-circle-outline"
            title={t('profile.signInPromptTitle')}
            description={t('profile.signInPromptDescription')}
            action={<AppButton label={t('auth.login.signInButton')} onPress={goToAuth} style={styles.signInButton} />}
          />
        </View>
      )}

      <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {menuRows.map((row, index) => (
          <Pressable
            key={row.screen}
            onPress={() => navigation.navigate(row.screen as never)}
            style={[
              styles.menuRow,
              { borderBottomColor: colors.border },
              index === menuRows.length - 1 && !isAuthenticated && styles.menuRowNoBorder,
            ]}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name={row.icon} size={19} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{t(row.labelKey)}</Text>
            {row.screen === 'Notifications' && unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        ))}

        {isAuthenticated && (
          <Pressable onPress={handleLogoutPress} disabled={loggingOut} style={[styles.menuRow, styles.menuRowNoBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="logout" size={19} color={colors.error} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.error }]}>{t('profile.logOut')}</Text>
          </Pressable>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  profileCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  profileInfo: { flex: 1 },
  name: { fontFamily: fontFamily.headingSemiBold, fontSize: fontSize.lg },
  email: { fontFamily: fontFamily.body, fontSize: fontSize.sm, marginTop: 2 },
  editButton: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  guestWrap: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  signInButton: { minWidth: 180 },
  menuCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuRowNoBorder: { borderBottomWidth: 0 },
  menuIcon: {
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontFamily: fontFamily.bodyMedium, fontSize: fontSize.base },
  badge: {
    minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontFamily: fontFamily.bodySemiBold, fontSize: 10 },
});

export default ProfileScreen;
