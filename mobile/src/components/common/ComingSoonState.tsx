import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@theme/ThemeProvider';
import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';

interface Props {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Defaults to a generic "this feature" line — pass a feature-specific one where it helps. */
  description?: string;
  /** Renders the compact inline form, for slotting into a section of an otherwise working screen. */
  compact?: boolean;
}

/**
 * Shown in place of features that are built but not yet operational, so users get an
 * honest "not ready yet" instead of an empty screen or a control that silently does
 * nothing.
 */
const ComingSoonState: React.FC<Props> = ({ icon = 'clock-outline', description, compact = false }) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  if (compact) {
    return (
      <View style={[styles.compactWrap, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.secondary} />
        <Text style={[styles.compactText, { color: colors.textSecondary }]}>
          {description ?? t('comingSoon.description')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
        <MaterialCommunityIcons name={icon} size={40} color={colors.primary} />
      </View>

      <View style={[styles.pill, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.pillText, { color: colors.secondary }]}>{t('comingSoon.badge')}</Text>
      </View>

      <Text style={[typeStyles.h3, { color: colors.textPrimary, marginTop: spacing.sm, textAlign: 'center' }]}>
        {t('comingSoon.title')}
      </Text>
      <Text style={[typeStyles.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
        {description ?? t('comingSoon.description')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  pillText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  compactWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  compactText: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
});

export default ComingSoonState;
