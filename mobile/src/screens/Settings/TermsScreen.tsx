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

const TermsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('profile.menu.termsOfService')}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.updated, { color: colors.textMuted }]}>{t('legal.lastUpdated', { date: 'July 2026' })}</Text>

        <Paragraph>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the {APP_NAME} mobile
          application (the &quot;App&quot;). By downloading, accessing, or using the App, you agree to be bound by
          these Terms. If you do not agree, please do not use the App.
        </Paragraph>

        <Section title={t('legal.terms.section1')}>
          <Paragraph>
            You must be at least 13 years old to create an account. You are responsible for maintaining the
            confidentiality of your login credentials and for all activity that occurs under your account. Notify us
            immediately of any unauthorized use of your account.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section2')}>
          <Paragraph>You agree not to:</Paragraph>
          <Bullet>Use the App for any unlawful purpose or in violation of any applicable regulations.</Bullet>
          <Bullet>Attempt to gain unauthorized access to our systems, streams, or other users&apos; accounts.</Bullet>
          <Bullet>Redistribute, rebroadcast, download in bulk, or resell our live streams or podcast content
            without prior written permission.
          </Bullet>
          <Bullet>Submit abusive, defamatory, or otherwise objectionable content via Live Chat, song requests, or
            the contact form.
          </Bullet>
          <Bullet>Reverse engineer, decompile, or otherwise attempt to extract the source code of the App.</Bullet>
        </Section>

        <Section title={t('legal.terms.section3')}>
          <Paragraph>
            All content made available through the App — including live broadcasts, podcast episodes, articles,
            images, logos, and the {APP_NAME} name and branding — is owned by {APP_NAME} or its licensors and is
            protected by copyright and other intellectual property laws. You are granted a limited, non-exclusive,
            non-transferable license to access and use this content for personal, non-commercial listening only,
            including offline playback of episodes you explicitly download within the App.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section4')}>
          <Paragraph>
            Any messages, song requests, or other content you submit through Live Chat, Song Requests, or the
            Contact form may be moderated, edited, featured on-air, or removed at our discretion. You retain
            ownership of content you submit but grant us a worldwide, royalty-free license to use, display, and
            broadcast it in connection with operating the station.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section5')}>
          <Paragraph>
            Be respectful. Harassment, hate speech, spam, and impersonation are not tolerated and may result in a
            temporary or permanent ban from Live Chat and other community features, without notice.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section6')}>
          <Paragraph>
            We strive to keep the App and our live stream available at all times, but we do not guarantee
            uninterrupted access. We may modify, suspend, or discontinue any part of the App — including specific
            features, programs, or podcasts — at any time without liability to you.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section7')}>
          <Paragraph>
            The App relies on third-party infrastructure, including Cloudinary for media hosting, Firebase Cloud
            Messaging for push notifications, and Google Maps for location display. Your use of features backed by
            these services is also subject to the respective third party&apos;s terms.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section8')}>
          <Paragraph>
            The App is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either
            express or implied. To the fullest extent permitted by law, {APP_NAME} shall not be liable for any
            indirect, incidental, special, or consequential damages arising from your use of, or inability to use,
            the App.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section9')}>
          <Paragraph>
            We may suspend or terminate your access to the App at any time if we believe you have violated these
            Terms. You may stop using the App and delete your account at any time by contacting us.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section10')}>
          <Paragraph>
            We may update these Terms from time to time. Continued use of the App after changes take effect
            constitutes your acceptance of the revised Terms.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section11')}>
          <Paragraph>
            Questions about these Terms can be sent to
            {' '}
            <Text style={{ color: colors.primary, fontFamily: fontFamily.bodySemiBold }}>legal@modernvoiceradio.com</Text>
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

export default TermsScreen;
