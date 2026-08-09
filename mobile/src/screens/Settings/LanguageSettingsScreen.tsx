import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { setLanguage } from '@redux/slices/settingsSlice';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { ProfileStackParamList } from '@navigation/types';

/** Language names are proper nouns/endonyms — shown as-is regardless of the active UI language. */
const LANGUAGES: { code: string; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ny', label: 'Nyanja', nativeLabel: 'Chinyanja' },
  { code: 'toi', label: 'Chitonga', nativeLabel: 'Chitonga' },
  { code: 'sn', label: 'Shona', nativeLabel: 'ChiShona' },
];

const LanguageSettingsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.settings.language);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('settings.language')}</Text>
        <View style={styles.backButton} />
      </View>

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('languageSettings.hint')}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {LANGUAGES.map((item, index) => {
          const isSelected = item.code === language;
          return (
            <Pressable
              key={item.code}
              onPress={() => dispatch(setLanguage(item.code))}
              style={[
                styles.row,
                index < LANGUAGES.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                isSelected && { backgroundColor: colors.primaryContainer },
              ]}
            >
              <View style={styles.rowBody}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.nativeLabel, { color: colors.textSecondary }]}>{item.nativeLabel}</Text>
              </View>
              {isSelected && <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />}
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, marginBottom: spacing.sm,
  },
  backButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  hint: {
    fontFamily: fontFamily.body, fontSize: fontSize.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
  },
  rowBody: { flex: 1 },
  label: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base },
  nativeLabel: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 2 },
});

export default LanguageSettingsScreen;
