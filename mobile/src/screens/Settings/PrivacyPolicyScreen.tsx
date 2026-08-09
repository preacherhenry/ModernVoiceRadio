import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';

import { useAppTheme } from '@theme/ThemeProvider';
import { spacing } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { APP_NAME } from '@constants/config';
import type { ProfileStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const { colors } = useAppTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
};

const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useAppTheme();
  return <Text style={[styles.paragraph, { color: colors.textSecondary }]}>{children}</Text>;
};

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useAppTheme();
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bulletDot, { color: colors.primary }]}>{'•'}</Text>
      <Text style={[styles.paragraph, styles.bulletText, { color: colors.textSecondary }]}>{children}</Text>
    </View>
  );
};

const PrivacyPolicyScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('profile.menu.privacyPolicy')}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.updated, { color: colors.textMuted }]}>{t('legal.lastUpdated', { date: 'July 2026' })}</Text>

        <Paragraph>
          {APP_NAME} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the {APP_NAME} mobile application
          (the &quot;App&quot;). This Privacy Policy explains what information we collect, how we use it, and the
          choices you have. By creating an account or otherwise using the App, you agree to the collection and use
          of information in accordance with this policy.
        </Paragraph>

        <Section title={t('legal.privacy.section1')}>
          <Paragraph>We collect the following categories of information:</Paragraph>
          <Bullet>
            <Text style={{ fontFamily: fontFamily.bodySemiBold }}>Account information</Text> — full name, email
            address, phone number, and profile photo you provide when registering or editing your profile.
          </Bullet>
          <Bullet>
            <Text style={{ fontFamily: fontFamily.bodySemiBold }}>Usage data</Text> — listening history, favorites,
            downloaded episodes, song requests, and in-app interactions, used to personalize your experience and
            improve our programming.
          </Bullet>
          <Bullet>
            <Text style={{ fontFamily: fontFamily.bodySemiBold }}>Device & analytics data</Text> — device type,
            operating system, app version, crash logs, and general usage analytics.
          </Bullet>
          <Bullet>
            <Text style={{ fontFamily: fontFamily.bodySemiBold }}>Push notification tokens</Text> — a device token
            registered with Firebase Cloud Messaging so we can deliver breaking news, live show alerts, and other
            notifications you opt into.
          </Bullet>
          <Bullet>
            <Text style={{ fontFamily: fontFamily.bodySemiBold }}>Location data</Text> — approximate location, only
            if you grant permission, used to show our studio location via Google Maps on the Contact screen.
          </Bullet>
        </Section>

        <Section title={t('legal.privacy.section2')}>
          <Bullet>To create and maintain your account and personalize content recommendations.</Bullet>
          <Bullet>To deliver live radio streams, podcast episodes, and offline downloads.</Bullet>
          <Bullet>To send push notifications for breaking news, live shows, new podcasts, and announcements — you
            can manage these categories anytime in Settings.
          </Bullet>
          <Bullet>To analyze app performance, diagnose issues, and improve features.</Bullet>
          <Bullet>To respond to song requests, contact form submissions, and customer support inquiries.</Bullet>
        </Section>

        <Section title={t('legal.privacy.section3')}>
          <Paragraph>
            Images and other media assets (avatars, gallery photos, podcast cover art) are hosted on Cloudinary, a
            third-party media management service. We also use the following third-party services, each governed by
            its own privacy policy:
          </Paragraph>
          <Bullet>
            <Text style={{ fontFamily: fontFamily.bodySemiBold }}>Firebase Cloud Messaging</Text> — push notification
            delivery.
          </Bullet>
          <Bullet>
            <Text style={{ fontFamily: fontFamily.bodySemiBold }}>Google Maps</Text> — displaying our studio location
            on the Contact screen.
          </Bullet>
          <Bullet>
            <Text style={{ fontFamily: fontFamily.bodySemiBold }}>Cloudinary</Text> — secure hosting and delivery of
            images, audio artwork, and gallery media.
          </Bullet>
        </Section>

        <Section title={t('legal.privacy.section4')}>
          <Paragraph>
            We do not sell your personal information. We may share data with service providers who help us operate
            the App (such as those listed above), or when required to comply with legal obligations, protect our
            rights, or investigate fraud or security issues.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section5')}>
          <Paragraph>
            We retain your account information for as long as your account remains active, and listening/download
            history for as long as reasonably useful to improve your experience. We use industry-standard measures,
            including encrypted network transport and secure token storage on-device, to protect your information.
            No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section6')}>
          <Bullet>Access, update, or correct your profile information anytime from the Edit Profile screen.</Bullet>
          <Bullet>Delete downloaded content from your device at any time from the Downloads screen.</Bullet>
          <Bullet>Manage notification preferences by category in Settings.</Bullet>
          <Bullet>Request account deletion or a copy of your data by contacting us using the details below.</Bullet>
        </Section>

        <Section title={t('legal.privacy.section7')}>
          <Paragraph>
            The App is not directed at children under 13, and we do not knowingly collect personal information from
            children under 13. If you believe a child has provided us with personal information, please contact us
            so we can remove it.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section8')}>
          <Paragraph>
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting
            the new policy in the App and updating the &quot;Last updated&quot; date above.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section9')}>
          <Paragraph>
            If you have questions about this Privacy Policy or how we handle your information, please contact us at
            {' '}
            <Text style={{ color: colors.primary, fontFamily: fontFamily.bodySemiBold }}>privacy@modernvoiceradio.com</Text>
            .
          </Paragraph>
        </Section>
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  updated: {
    fontFamily: fontFamily.body, fontSize: fontSize.xs, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontFamily: fontFamily.headingSemiBold, fontSize: fontSize.md, marginBottom: spacing.xs },
  sectionBody: { gap: spacing.xs },
  paragraph: { fontFamily: fontFamily.body, fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.6 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletDot: { fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.6 },
  bulletText: { flex: 1 },
});

export default PrivacyPolicyScreen;
