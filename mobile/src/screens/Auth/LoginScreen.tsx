import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextInput as PaperTextInput } from 'react-native-paper';
import ScreenContainer from '@components/common/ScreenContainer';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';
import { useAppTheme } from '@theme/ThemeProvider';
import { useAppDispatch } from '@redux/hooks';
import { useLoginMutation } from '@redux/api/authApi';
import { setSession, persistTokens } from '@redux/slices/authSlice';
import { spacing } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { APP_NAME } from '@constants/config';
import type { AuthStackParamList } from '@navigation/types';

type FormValues = { email: string; password: string };

const LoginScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const schema = useMemo(() => yup.object({
    email: yup.string().email(t('auth.errors.invalidEmail')).required(t('auth.errors.emailRequired')),
    password: yup.string().min(8, t('auth.errors.passwordMin')).required(t('auth.errors.passwordRequired')),
  }), [t]);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const rootNav = navigation.getParent();

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await login(values).unwrap();
      dispatch(setSession(result.data));
      await persistTokens(result.data.accessToken, result.data.refreshToken);
      rootNav?.reset({ index: 0, routes: [{ name: 'Main' as never }] });
    } catch {
      // Surfaced via the `error` state from useLoginMutation below — nothing else to do here.
    }
  };

  const continueAsGuest = () => rootNav?.reset({ index: 0, routes: [{ name: 'Main' as never }] });

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons name="radio-tower" size={32} color={colors.primary} />
        </View>
        <Text style={[typeStyles.h1, { color: colors.textPrimary, marginTop: spacing.md }]}>{t('auth.login.title')}</Text>
        <Text style={[typeStyles.body, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
          {t('auth.login.subtitle', { appName: APP_NAME })}
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('auth.login.emailLabel')}
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
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('auth.login.passwordLabel')}
              isPassword
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.password?.message}
              left={<PaperTextInput.Icon icon="lock-outline" />}
            />
          )}
        />

        <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
          <Text style={{ color: colors.primary, fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm }}>
            {t('auth.login.forgotPassword')}
          </Text>
        </Pressable>

        {!!error && (
          <Text style={[styles.apiError, { color: colors.error }]}>
            {'data' in error ? (error.data as { message?: string })?.message : t('common.somethingWentWrong')}
          </Text>
        )}

        <AppButton label={t('auth.login.signInButton')} onPress={handleSubmit(onSubmit)} loading={isLoading} style={styles.submit} />

        <Pressable onPress={continueAsGuest} style={styles.guestLink}>
          <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm }}>
            {t('auth.login.continueAsGuest')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.body }}>{t('auth.login.noAccount')}</Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={{ color: colors.primary, fontFamily: fontFamily.bodySemiBold }}>{t('auth.login.signUp')}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  logoCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  form: { paddingHorizontal: spacing.xl },
  forgotLink: { alignSelf: 'flex-end', marginBottom: spacing.md },
  apiError: { fontFamily: fontFamily.body, fontSize: fontSize.sm, marginBottom: spacing.sm, textAlign: 'center' },
  submit: { marginTop: spacing.xs },
  guestLink: { alignItems: 'center', marginTop: spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: spacing.xl },
});

export default LoginScreen;
