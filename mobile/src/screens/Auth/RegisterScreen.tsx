import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { TextInput as PaperTextInput } from 'react-native-paper';
import ScreenContainer from '@components/common/ScreenContainer';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';
import { useAppTheme } from '@theme/ThemeProvider';
import { useRegisterMutation } from '@redux/api/authApi';
import { spacing } from '@constants/spacing';
import { fontFamily, typeStyles } from '@constants/typography';
import type { AuthStackParamList } from '@navigation/types';

type FormValues = {
  fullName: string; email: string; phone?: string; password: string;
};

const RegisterScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [register, { isLoading, isSuccess, error }] = useRegisterMutation();

  const schema = useMemo(() => yup.object({
    fullName: yup.string().min(2, t('auth.errors.fullNameMin')).required(t('auth.errors.fullNameRequired')),
    email: yup.string().email(t('auth.errors.invalidEmail')).required(t('auth.errors.emailRequired')),
    phone: yup.string().optional(),
    password: yup.string().min(8, t('auth.errors.passwordMin')).matches(/\d/, t('auth.errors.passwordNumber')).required(t('auth.errors.passwordRequired')),
  }), [t]);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '', email: '', phone: '', password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await register(values).unwrap();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {
      // Surfaced via the `error` state from useRegisterMutation below — nothing else to do here.
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[typeStyles.h1, { color: colors.textPrimary }]}>{t('auth.register.title')}</Text>
        <Text style={[typeStyles.body, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
          {t('auth.register.subtitle')}
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('auth.register.fullNameLabel')}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.fullName?.message}
              left={<PaperTextInput.Icon icon="account-outline" />}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('auth.register.emailLabel')}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.email?.message}
              left={<PaperTextInput.Icon icon="email-outline" />}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('auth.register.phoneLabel')}
              keyboardType="phone-pad"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              left={<PaperTextInput.Icon icon="phone-outline" />}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('auth.register.passwordLabel')}
              isPassword
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.password?.message}
              left={<PaperTextInput.Icon icon="lock-outline" />}
            />
          )}
        />

        {!!error && (
          <Text style={[styles.apiError, { color: colors.error }]}>
            {'data' in error ? (error.data as { message?: string })?.message : t('common.somethingWentWrong')}
          </Text>
        )}
        {isSuccess && (
          <Text style={[styles.apiError, { color: colors.success }]}>
            {t('auth.register.successMessage')}
          </Text>
        )}

        <AppButton label={t('auth.register.createAccountButton')} onPress={handleSubmit(onSubmit)} loading={isLoading} style={styles.submit} />
      </View>

      <View style={styles.footer}>
        <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.body }}>{t('auth.register.haveAccount')}</Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: colors.primary, fontFamily: fontFamily.bodySemiBold }}>{t('auth.register.signIn')}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  form: { paddingHorizontal: spacing.xl },
  apiError: { fontFamily: fontFamily.body, fontSize: 13, marginBottom: spacing.sm, textAlign: 'center' },
  submit: { marginTop: spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: spacing.xl },
});

export default RegisterScreen;
