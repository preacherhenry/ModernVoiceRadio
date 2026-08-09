import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '@components/common/ScreenContainer';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';
import { useAppTheme } from '@theme/ThemeProvider';
import { useForgotPasswordMutation } from '@redux/api/authApi';
import { spacing } from '@constants/spacing';
import { fontFamily, typeStyles } from '@constants/typography';
import type { AuthStackParamList } from '@navigation/types';

type FormValues = { email: string };

const ForgotPasswordScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);

  const schema = useMemo(() => yup.object({
    email: yup.string().email(t('auth.errors.invalidEmail')).required(t('auth.errors.emailRequired')),
  }), [t]);

  const { control, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPassword(values).unwrap();
      setSent(true);
    } catch {
      // Best-effort — errors here aren't surfaced to avoid leaking whether an email is registered.
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons name="lock-reset" size={30} color={colors.primary} />
        </View>
        <Text style={[typeStyles.h1, { color: colors.textPrimary, marginTop: spacing.md }]}>{t('auth.forgotPassword.title')}</Text>
        <Text style={[typeStyles.body, { color: colors.textSecondary, marginTop: spacing.xxs, textAlign: 'center' }]}>
          {t('auth.forgotPassword.subtitle')}
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('auth.forgotPassword.emailLabel')}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.email?.message}
            />
          )}
        />

        {sent ? (
          <>
            <Text style={[styles.successText, { color: colors.success }]}>
              {t('auth.forgotPassword.sentMessage')}
            </Text>
            <AppButton
              label={t('auth.forgotPassword.enterCodeButton')}
              onPress={() => navigation.navigate('ResetPassword', { email: getValues('email') })}
            />
          </>
        ) : (
          <AppButton label={t('auth.forgotPassword.sendCodeButton')} onPress={handleSubmit(onSubmit)} loading={isLoading} />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  form: { paddingHorizontal: spacing.xl, gap: spacing.md },
  successText: { fontFamily: fontFamily.bodyMedium, fontSize: 14, textAlign: 'center' },
});

export default ForgotPasswordScreen;
