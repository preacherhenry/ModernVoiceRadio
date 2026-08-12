import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import ScreenContainer from '@components/common/ScreenContainer';
import { AuthWall, useRequiresAuth } from '@components/common/AuthRequired';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppSelector } from '@redux/hooks';
import { useSubmitSongRequestMutation } from '@redux/api/songRequestsApi';

import { spacing } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';

type FormValues = {
  requesterName: string; songTitle: string; artistName: string; message?: string;
};

const SongRequestScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const { blocked, resolving } = useRequiresAuth();
  const [submitSongRequest, { isLoading, error }] = useSubmitSongRequestMutation();
  const [submitted, setSubmitted] = useState(false);

  const schema = useMemo(() => yup.object({
    requesterName: yup.string().min(2, t('auth.errors.fullNameMin')).required(t('songRequest.errors.nameRequired')),
    songTitle: yup.string().min(2, t('auth.errors.fullNameMin')).required(t('songRequest.errors.titleRequired')),
    artistName: yup.string().min(2, t('auth.errors.fullNameMin')).required(t('songRequest.errors.artistRequired')),
    message: yup.string().optional(),
  }), [t]);

  const defaultValues: FormValues = {
    requesterName: user?.fullName ?? '', songTitle: '', artistName: '', message: '',
  };

  const {
    control, handleSubmit, formState: { errors }, reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    await submitSongRequest({
      requesterName: values.requesterName,
      songTitle: values.songTitle,
      artistName: values.artistName,
      message: values.message?.trim() ? values.message.trim() : undefined,
    }).unwrap();
    setSubmitted(true);
  };

  const submitAnother = () => {
    reset(defaultValues);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.successWrap}>
          <View style={[styles.successIcon, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="check-circle-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[typeStyles.h2, { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.md }]}>
            {t('songRequest.sentTitle')}
          </Text>
          <Text style={[typeStyles.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxs }]}>
            {t('songRequest.sentDescription')}
          </Text>
          <AppButton label={t('songRequest.submitAnother')} onPress={submitAnother} style={styles.submitAnotherButton} />
        </View>
      </ScreenContainer>
    );
  }

  // Guests get the sign-in wall instead of this feature. Placed after every hook
  // so hook order stays stable across the authenticated/guest branches.
  if (blocked) {
    return (
      <AuthWall
        resolving={resolving}
        titleKey="songRequest.title"
        descriptionKey="authGate.songRequest"
        icon="music-note-plus"
      />
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons name="music-note-plus" size={28} color={colors.primary} />
        </View>
        <Text style={[typeStyles.h1, { color: colors.textPrimary, marginTop: spacing.md }]}>{t('songRequest.title')}</Text>
        <Text style={[typeStyles.body, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
          {t('songRequest.subtitle')}
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="requesterName"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('songRequest.nameLabel')}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.requesterName?.message}
              left={<PaperTextInput.Icon icon="account-outline" />}
            />
          )}
        />
        <Controller
          control={control}
          name="songTitle"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('songRequest.songTitleLabel')}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.songTitle?.message}
              left={<PaperTextInput.Icon icon="music-note-outline" />}
            />
          )}
        />
        <Controller
          control={control}
          name="artistName"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('songRequest.artistLabel')}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.artistName?.message}
              left={<PaperTextInput.Icon icon="account-music-outline" />}
            />
          )}
        />
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('songRequest.messageLabel')}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              multiline
              numberOfLines={4}
              style={styles.messageInput}
              left={<PaperTextInput.Icon icon="message-text-outline" />}
            />
          )}
        />

        {!!error && (
          <Text style={[styles.apiError, { color: colors.error }]}>
            {'data' in error ? (error.data as { message?: string })?.message : t('common.somethingWentWrong')}
          </Text>
        )}

        <AppButton label={t('songRequest.sendButton')} onPress={handleSubmit(onSubmit)} loading={isLoading} style={styles.submit} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  form: { paddingHorizontal: spacing.xl },
  messageInput: { minHeight: 100 },
  apiError: { fontFamily: fontFamily.body, fontSize: fontSize.sm, marginBottom: spacing.sm, textAlign: 'center' },
  submit: { marginTop: spacing.xs },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  submitAnotherButton: { marginTop: spacing.xl, minWidth: 220 },
});

export default SongRequestScreen;
