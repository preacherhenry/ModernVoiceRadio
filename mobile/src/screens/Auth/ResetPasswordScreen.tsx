import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@components/common/ScreenContainer';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';
import { useAppTheme } from '@theme/ThemeProvider';
import { useResetPasswordMutation } from '@redux/api/authApi';
import { spacing } from '@constants/spacing';
import { fontFamily, typeStyles } from '@constants/typography';
import type { AuthStackParamList } from '@navigation/types';

type FormValues = { otp: string; newPassword: string };

const ResetPasswordScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();
  const [resetPassword, { isLoading, isSuccess, error }] = useResetPasswordMutation();

  const schema = useMemo(() => yup.object({
    otp: yup.string().length(6, t('auth.errors.otpLength')).required(t('auth.errors.otpRequired')),
    newPassword: yup.string().min(8, t('auth.errors.passwordMin')).matches(/\d/, t('auth.errors.passwordNumber')).required(t('auth.errors.newPasswordRequired')),
  }), [t]);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { otp: '', newPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await resetPassword({ email: route.params.email, ...values }).unwrap();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {
      // Surfaced via the `error` state from useResetPasswordMutation below — nothing else to do here.
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[typeStyles.h1, { color: colors.textPrimary }]}>{t('auth.resetPassword.title')}</Text>
        <Text style={[typeStyles.body, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
          {t('auth.resetPassword.subtitle', { email: route.params.email })}
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('auth.resetPassword.codeLabel')}
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.otp?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('auth.resetPassword.newPasswordLabel')}
              isPassword
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.newPassword?.message}
            />
          )}
        />

        {!!error && (
          <Text style={{ color: colors.error, fontFamily: fontFamily.body, textAlign: 'center', marginBottom: spacing.sm }}>
            {'data' in error ? (error.data as { message?: string })?.message : t('common.somethingWentWrong')}
          </Text>
        )}
        {isSuccess && (
          <Text style={{ color: colors.success, fontFamily: fontFamily.bodyMedium, textAlign: 'center', marginBottom: spacing.sm }}>
            {t('auth.resetPassword.successMessage')}
          </Text>
        )}

        <AppButton label={t('auth.resetPassword.submitButton')} onPress={handleSubmit(onSubmit)} loading={isLoading} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  form: { paddingHorizontal: spacing.xl, gap: spacing.md },
});

export default ResetPasswordScreen;
