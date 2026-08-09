import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { setEqualizerPreset } from '@redux/slices/settingsSlice';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { EQUALIZER_PRESETS, EQUALIZER_PRESET_LABEL_KEYS } from '@constants/config';
import type { ProfileStackParamList } from '@navigation/types';

const PRESET_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Flat: 'equalizer-outline',
  'Bass Boost': 'music-clef-bass',
  Vocal: 'account-voice',
  'Treble Boost': 'waveform',
};

const EqualizerScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const dispatch = useAppDispatch();
  const equalizerPreset = useAppSelector((state) => state.settings.equalizerPreset);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('live.equalizer')}</Text>
        <View style={styles.backButton} />
      </View>

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('equalizer.hint')}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {EQUALIZER_PRESETS.map((preset, index) => {
          const isSelected = preset === equalizerPreset;
          return (
            <Pressable
              key={preset}
              onPress={() => dispatch(setEqualizerPreset(preset))}
              style={[
                styles.row,
                index < EQUALIZER_PRESETS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                isSelected && { backgroundColor: colors.primaryContainer },
              ]}
            >
              <View style={[styles.rowIcon, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialCommunityIcons name={PRESET_ICONS[preset] ?? 'equalizer'} size={19} color={colors.primary} />
              </View>
              <Text style={[styles.label, { color: colors.textPrimary }]}>{t(EQUALIZER_PRESET_LABEL_KEYS[preset])}</Text>
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
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
  },
  rowIcon: {
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
  },
  label: { flex: 1, fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base },
});

export default EqualizerScreen;
