import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { setAudioQuality } from '@redux/slices/settingsSlice';

import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { AUDIO_QUALITY_OPTIONS_KBPS } from '@constants/config';
import type { ProfileStackParamList } from '@navigation/types';

const DESCRIPTION_KEYS: Record<number, string> = {
  64: 'audioQuality.descriptions.dataSaver',
  128: 'audioQuality.descriptions.standard',
  256: 'audioQuality.descriptions.highFidelity',
};

const AudioQualitySettingsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const dispatch = useAppDispatch();
  const audioQualityKbps = useAppSelector((state) => state.settings.audioQualityKbps);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('settings.audioQuality')}</Text>
        <View style={styles.backButton} />
      </View>

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('audioQuality.hint')}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {AUDIO_QUALITY_OPTIONS_KBPS.map((kbps, index) => {
          const isSelected = kbps === audioQualityKbps;
          return (
            <Pressable
              key={kbps}
              onPress={() => dispatch(setAudioQuality(kbps))}
              style={[
                styles.row,
                index < AUDIO_QUALITY_OPTIONS_KBPS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                isSelected && { backgroundColor: colors.primaryContainer },
              ]}
            >
              <View style={styles.rowBody}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>{kbps} kbps</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>{t(DESCRIPTION_KEYS[kbps])}</Text>
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
  description: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 2 },
});

export default AudioQualitySettingsScreen;
