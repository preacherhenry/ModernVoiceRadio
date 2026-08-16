import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Switch } from 'react-native-paper';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import SectionHeader from '@components/common/SectionHeader';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import {
  setThemePreference, toggleNotificationCategory, type ThemePreference,
} from '@redux/slices/settingsSlice';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { APP_NAME, EQUALIZER_PRESET_LABEL_KEYS } from '@constants/config';
import type { ProfileStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const THEME_OPTIONS: { labelKey: string; value: ThemePreference; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { labelKey: 'settings.themeOptions.dark', value: 'dark', icon: 'weather-night' },
  { labelKey: 'settings.themeOptions.light', value: 'light', icon: 'white-balance-sunny' },
  { labelKey: 'settings.themeOptions.system', value: 'system', icon: 'theme-light-dark' },
];

const NOTIFICATION_TOGGLES: { key: 'breakingNews' | 'liveShows' | 'newPodcasts' | 'announcements'; labelKey: string; descriptionKey: string }[] = [
  { key: 'breakingNews', labelKey: 'settings.notificationToggles.breakingNews.label', descriptionKey: 'settings.notificationToggles.breakingNews.description' },
  { key: 'liveShows', labelKey: 'settings.notificationToggles.liveShows.label', descriptionKey: 'settings.notificationToggles.liveShows.description' },
  { key: 'newPodcasts', labelKey: 'settings.notificationToggles.newPodcasts.label', descriptionKey: 'settings.notificationToggles.newPodcasts.description' },
  { key: 'announcements', labelKey: 'settings.notificationToggles.announcements.label', descriptionKey: 'settings.notificationToggles.announcements.description' },
];

const SettingsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[typeStyles.h1, { color: colors.textPrimary }]}>{t('profile.menu.settings')}</Text>
      </View>

      {/* Appearance */}
      <SectionHeader title={t('settings.appearance')} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.segmentRow}>
          {THEME_OPTIONS.map((option) => {
            const isActive = settings.themePreference === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => dispatch(setThemePreference(option.value))}
                style={[
                  styles.segment,
                  { backgroundColor: isActive ? colors.primary : colors.surfaceVariant },
                ]}
              >
                <MaterialCommunityIcons name={option.icon} size={18} color={isActive ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.segmentLabel, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>{t(option.labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Language */}
      <SectionHeader title={t('settings.language')} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable onPress={() => navigation.navigate('LanguageSettings')} style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="translate" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{t('settings.appLanguage')}</Text>
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{settings.language.toUpperCase()}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Audio */}
      <SectionHeader title={t('settings.audio')} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable
          onPress={() => navigation.navigate('AudioQualitySettings')}
          style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
        >
          <View style={[styles.rowIcon, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="broadcast" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{t('settings.audioQuality')}</Text>
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{settings.audioQualityKbps} kbps</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Equalizer')} style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="equalizer" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{t('live.equalizer')}</Text>
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{t(EQUALIZER_PRESET_LABEL_KEYS[settings.equalizerPreset])}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Notifications */}
      <SectionHeader title={t('settings.notifications')} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {NOTIFICATION_TOGGLES.map((toggle, index) => (
          <View
            key={toggle.key}
            style={[
              styles.row,
              index < NOTIFICATION_TOGGLES.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
            ]}
          >
            <View style={styles.toggleBody}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{t(toggle.labelKey)}</Text>
              <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>{t(toggle.descriptionKey)}</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled[toggle.key]}
              onValueChange={() => { dispatch(toggleNotificationCategory(toggle.key)); }}
              color={colors.primary}
            />
          </View>
        ))}
      </View>

      {/* About */}
      <SectionHeader title={t('settings.about')} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable
          onPress={() => navigation.navigate('PrivacyPolicy')}
          style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
        >
          <View style={[styles.rowIcon, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="shield-check-outline" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{t('profile.menu.privacyPolicy')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('About')} style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="information-outline" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{t('settings.aboutStation', { appName: APP_NAME })}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Terms sit at the foot of the screen, the conventional place for them. */}
      <Text
        onPress={() => navigation.navigate('Terms')}
        style={[styles.termsFooterLink, { color: colors.textSecondary }]}
      >
        {t('profile.menu.termsOfService')}
      </Text>

      <Text style={[styles.version, { color: colors.textMuted }]}>{t('settings.versionLabel', { version })}</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  termsFooterLink: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    textDecorationLine: 'underline',
  },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  segmentRow: { flexDirection: 'row', gap: spacing.xs, padding: spacing.sm },
  segment: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: radius.md,
  },
  segmentLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
  },
  rowIcon: {
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontFamily: fontFamily.bodyMedium, fontSize: fontSize.base },
  rowValue: { fontFamily: fontFamily.body, fontSize: fontSize.sm },
  toggleBody: { flex: 1 },
  toggleDescription: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 2 },
  version: { textAlign: 'center', fontFamily: fontFamily.body, fontSize: fontSize.xs, marginBottom: spacing.xl },
});

export default SettingsScreen;
