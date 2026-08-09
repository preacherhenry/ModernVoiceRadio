import React, { useMemo } from 'react';
import {
  StyleSheet, View, Text, Pressable, Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import GlassCard from '@components/common/GlassCard';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetContactInformationQuery } from '@redux/api/settingsApi';

import { gradients } from '@constants/colors';
import { spacing } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { APP_NAME } from '@constants/config';
import type { ProfileStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

interface SocialLink {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  url: string;
}

const AboutScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const { data: contactData } = useGetContactInformationQuery();
  const contact = contactData?.data;

  const socials = useMemo<SocialLink[]>(() => {
    if (!contact) return [];
    const list: SocialLink[] = [];
    if (contact.facebook_url) list.push({ icon: 'facebook', url: contact.facebook_url });
    if (contact.instagram_url) list.push({ icon: 'instagram', url: contact.instagram_url });
    if (contact.tiktok_url) list.push({ icon: 'music-note', url: contact.tiktok_url });
    if (contact.youtube_url) list.push({ icon: 'youtube', url: contact.youtube_url });
    if (contact.twitter_url) list.push({ icon: 'twitter', url: contact.twitter_url });
    if (contact.website_url) list.push({ icon: 'web', url: contact.website_url });
    return list;
  }, [contact]);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('profile.menu.about')}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.logoWrap}>
        <View style={[styles.logoCircle, { backgroundColor: gradients.primary[0] }]}>
          <MaterialCommunityIcons name="radio-tower" size={40} color="#FFFFFF" />
        </View>
        <Text style={[typeStyles.h1, { color: colors.textPrimary, marginTop: spacing.sm }]}>{APP_NAME}</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>{t('about.tagline')}</Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('about.whoWeAreTitle')}</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          {t('about.whoWeAreBody', { appName: APP_NAME })}
        </Text>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('about.missionTitle')}</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          {t('about.missionBody')}
        </Text>
      </GlassCard>

      {socials.length > 0 && (
        <View style={styles.socialsWrap}>
          <Text style={[styles.socialsTitle, { color: colors.textSecondary }]}>{t('about.connectWithUs')}</Text>
          <View style={styles.socialsRow}>
            {socials.map((social) => (
              <Pressable
                key={social.icon}
                onPress={() => Linking.openURL(social.url)}
                style={[styles.socialButton, { backgroundColor: colors.surfaceVariant }]}
              >
                <MaterialCommunityIcons name={social.icon} size={22} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <Text style={[styles.version, { color: colors.textMuted }]}>{t('settings.versionLabel', { version })}</Text>
      <Text style={[styles.copyright, { color: colors.textMuted }]}>
        {t('about.copyright', { year: new Date().getFullYear(), appName: APP_NAME })}
      </Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, marginBottom: spacing.md,
  },
  backButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: spacing.lg },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center',
  },
  tagline: { fontFamily: fontFamily.body, fontSize: fontSize.sm, marginTop: 2 },
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontFamily: fontFamily.headingSemiBold, fontSize: fontSize.md, marginBottom: spacing.xs },
  paragraph: { fontFamily: fontFamily.body, fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.6 },
  socialsWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.lg },
  socialsTitle: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm, marginBottom: spacing.sm },
  socialsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  socialButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  version: { textAlign: 'center', fontFamily: fontFamily.body, fontSize: fontSize.xs },
  copyright: {
    textAlign: 'center', fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 4, marginBottom: spacing.xl,
  },
});

export default AboutScreen;
