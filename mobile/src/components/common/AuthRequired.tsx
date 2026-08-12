import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from './ScreenContainer';
import AppButton from './AppButton';
import LoadingIndicator from './LoadingIndicator';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppSelector } from '@redux/hooks';
import { spacing } from '@constants/spacing';
import { typeStyles } from '@constants/typography';

interface Props {
  /** Translation key for the screen's own title, so the gate still reads as that screen. */
  titleKey: string;
  /** Translation key describing what signing in unlocks here. */
  descriptionKey: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

/**
 * Full-screen sign-in wall for features that require an account. Screens render this
 * instead of their content when the user is a guest — see `useRequiresAuth` below for
 * the check, which also covers the brief window before the session has resolved.
 */
const AuthRequired: React.FC<Props> = ({ titleKey, descriptionKey, icon = 'lock-outline' }) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  // Walk to the root navigator rather than assuming a fixed nesting depth — these
  // screens live at different levels (a tab root vs. a pushed stack screen).
  const goToAuth = useCallback((screen: 'Login' | 'Register') => {
    let nav: any = navigation;
    while (nav?.getParent?.()) nav = nav.getParent();
    nav?.navigate('Auth', { screen });
  }, [navigation]);

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        {navigation.canGoBack?.() ? (
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
          </Pressable>
        ) : <View style={styles.backButton} />}
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t(titleKey)}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons name={icon} size={40} color={colors.primary} />
        </View>

        <Text style={[typeStyles.h3, { color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' }]}>
          {t('authGate.title')}
        </Text>
        <Text style={[typeStyles.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
          {t(descriptionKey)}
        </Text>

        <AppButton
          label={t('authGate.createAccount')}
          onPress={() => goToAuth('Register')}
          style={styles.primaryButton}
        />
        <AppButton
          label={t('authGate.signIn')}
          onPress={() => goToAuth('Login')}
          variant="outline"
          style={styles.secondaryButton}
        />
      </View>
    </ScreenContainer>
  );
};

/**
 * `true` while the screen should stay hidden behind the wall. Sessions resolve during
 * app bootstrap, but treat the unresolved states as "wait" so a returning user never
 * sees the sign-in wall flash before their restored session lands.
 */
export function useRequiresAuth(): { blocked: boolean; resolving: boolean } {
  const status = useAppSelector((state) => state.auth.status);
  return {
    blocked: status !== 'authenticated',
    resolving: status === 'idle' || status === 'authenticating',
  };
}

/** Renders the wall, or a spinner while the session is still resolving. */
export const AuthWall: React.FC<Props & { resolving: boolean }> = ({ resolving, ...props }) => {
  if (resolving) {
    return (
      <ScreenContainer edges={['top']}>
        <LoadingIndicator fullscreen />
      </ScreenContainer>
    );
  }
  return <AuthRequired {...props} />;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, marginBottom: spacing.sm,
  },
  backButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  body: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xxl,
  },
  iconWrap: {
    width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center',
  },
  primaryButton: { alignSelf: 'stretch', marginTop: spacing.xl },
  secondaryButton: { alignSelf: 'stretch', marginTop: spacing.sm },
});

export default AuthRequired;
