import React, { useMemo, useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import AppTextInput from '@components/common/AppTextInput';
import AppButton from '@components/common/AppButton';
import Avatar from '@components/common/Avatar';

import { useAppTheme } from '@theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { useUpdateProfileMutation } from '@redux/api/usersApi';
import { updateUser } from '@redux/slices/authSlice';

import { spacing } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { ProfileStackParamList } from '@navigation/types';

type FormValues = { fullName: string; phone?: string; preferredLanguage: string };

const EditProfileScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();

  const [avatarPreviewUri, setAvatarPreviewUri] = useState<string | null>(user?.avatarUrl ?? null);
  const [pickedAsset, setPickedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const schema = useMemo(() => yup.object({
    fullName: yup.string().min(2, t('auth.errors.fullNameMin')).required(t('auth.errors.fullNameRequired')),
    phone: yup.string().optional(),
    preferredLanguage: yup.string().required(t('editProfile.errors.preferredLanguageRequired')),
  }), [t]);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      phone: user?.phone ?? '',
      preferredLanguage: user?.preferredLanguage ?? 'en',
    },
  });

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('editProfile.permissionNeededTitle'), t('editProfile.permissionNeededMessage'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPickedAsset(result.assets[0]);
      setAvatarPreviewUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (values: FormValues) => {
    const formData = new FormData();
    formData.append('fullName', values.fullName);
    if (values.phone) formData.append('phone', values.phone);
    formData.append('preferredLanguage', values.preferredLanguage);

    if (pickedAsset) {
      const extension = pickedAsset.uri.split('.').pop()?.split('?')[0] || 'jpg';
      formData.append('avatar', {
        uri: pickedAsset.uri,
        name: `avatar.${extension}`,
        type: pickedAsset.mimeType || `image/${extension}`,
      } as unknown as Blob);
    }

    try {
      const result = await updateProfile(formData).unwrap();
      dispatch(updateUser(result.data));
      navigation.goBack();
    } catch {
      // Surfaced via the `error` state from useUpdateProfileMutation below — nothing else to do here.
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('editProfile.title')}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.avatarWrap}>
        <Pressable onPress={pickAvatar}>
          <Avatar uri={avatarPreviewUri} name={user?.fullName ?? '?'} size={96} />
          <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
            <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
          </View>
        </Pressable>
        <Pressable onPress={pickAvatar}>
          <Text style={[styles.changePhoto, { color: colors.primary }]}>{t('editProfile.changePhoto')}</Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('editProfile.fullNameLabel')}
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
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('editProfile.phoneLabel')}
              keyboardType="phone-pad"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.phone?.message}
              left={<PaperTextInput.Icon icon="phone-outline" />}
            />
          )}
        />
        <Controller
          control={control}
          name="preferredLanguage"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label={t('editProfile.preferredLanguageLabel')}
              autoCapitalize="none"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.preferredLanguage?.message}
              left={<PaperTextInput.Icon icon="translate" />}
            />
          )}
        />

        {!!error && (
          <Text style={[styles.apiError, { color: colors.error }]}>
            {'data' in error ? (error.data as { message?: string })?.message : t('common.somethingWentWrong')}
          </Text>
        )}

        <AppButton label={t('editProfile.saveChanges')} onPress={handleSubmit(onSubmit)} loading={isLoading} style={styles.submit} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, marginBottom: spacing.md,
  },
  backButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xl },
  avatarEditBadge: {
    position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  changePhoto: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, marginTop: spacing.xxs },
  form: { paddingHorizontal: spacing.xl },
  apiError: { fontFamily: fontFamily.body, fontSize: fontSize.sm, marginBottom: spacing.sm, textAlign: 'center' },
  submit: { marginTop: spacing.xs },
});

export default EditProfileScreen;
