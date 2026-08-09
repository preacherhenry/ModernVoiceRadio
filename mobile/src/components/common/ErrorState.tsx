import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@theme/ThemeProvider';
import { spacing } from '@constants/spacing';
import { typeStyles } from '@constants/typography';
import AppButton from './AppButton';

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<Props> = ({ title, description, onRetry }) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="wifi-off" size={40} color={colors.error} />
      <Text style={[typeStyles.h4, { color: colors.textPrimary, marginTop: spacing.md }]}>{title ?? t('common.errorState.title')}</Text>
      <Text style={[typeStyles.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxs }]}>
        {description ?? t('common.errorState.description')}
      </Text>
      {onRetry && (
        <AppButton label={t('common.errorState.tryAgain')} onPress={onRetry} variant="outline" style={{ marginTop: spacing.lg, minWidth: 160 }} />
      )}
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
});

export default ErrorState;
