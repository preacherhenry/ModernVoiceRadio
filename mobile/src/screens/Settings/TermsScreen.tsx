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

/**
 * The station's Terms & Conditions, as supplied by Modern Voice FM.
 *
 * The body is deliberately English-only: section headings are translated (legal.terms.*
 * in the locale files) but the operative wording is not, since a machine-translated
 * legal term could change what a listener is agreeing to.
 */
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
        <Text style={[styles.updated, { color: colors.textMuted }]}>
          {t('legal.lastUpdated', { date: '16 August 2026' })}
        </Text>

        <Paragraph>
          Welcome to Modern Voice FM. By creating an account or using the Modern Voice FM application and its
          related services, you agree to these Terms and Conditions.
        </Paragraph>

        <Section title={t('legal.terms.section1')}>
          <Paragraph>
            By registering for or using Modern Voice FM, you confirm that you have read, understood, and agreed to
            these Terms and Conditions.
          </Paragraph>
          <Paragraph>
            If you do not agree with these terms, you should not create an account or use services that require
            acceptance of these terms.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section2')}>
          <Paragraph>
            Modern Voice FM provides access to live radio broadcasts, news, entertainment, announcements,
            advertisements, and other related content.
          </Paragraph>
          <Paragraph>
            You agree to use the application only for lawful purposes and in a manner that does not interfere with
            the operation or security of the service.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section3')}>
          <Paragraph>Some features require you to create a registered account.</Paragraph>
          <Paragraph>You must be at least 19 years old to create an account.</Paragraph>
          <Paragraph>You are responsible for:</Paragraph>
          <Bullet>Providing accurate information during registration.</Bullet>
          <Bullet>Keeping your login credentials secure.</Bullet>
          <Bullet>Not sharing your account with other people.</Bullet>
          <Bullet>
            Informing Modern Voice FM if you believe your account has been accessed without your permission.
          </Bullet>
          <Paragraph>
            Modern Voice FM reserves the right to suspend or terminate accounts that are used improperly,
            fraudulently, or in violation of these terms.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section4')}>
          <Paragraph>Modern Voice FM provides a live radio stream through the application and website.</Paragraph>
          <Paragraph>
            The availability and quality of the stream may be affected by internet connectivity, device
            performance, server availability, maintenance, or circumstances outside the control of Modern Voice FM.
          </Paragraph>
          <Paragraph>
            Modern Voice FM does not guarantee uninterrupted or error-free streaming at all times.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section5')}>
          <Paragraph>
            News articles, announcements, images, audio, videos, graphics, and other content published through the
            Modern Voice FM app may be provided by Modern Voice FM staff, reporters, contributors, or third parties.
          </Paragraph>
          <Paragraph>Content is provided for general informational and entertainment purposes.</Paragraph>
          <Paragraph>Modern Voice FM may correct, modify, remove, or update content when necessary.</Paragraph>
        </Section>

        <Section title={t('legal.terms.section6')}>
          <Paragraph>
            If the application allows users to submit information, comments, feedback, or other content, you agree
            that the information you provide must not:
          </Paragraph>
          <Bullet>Contain unlawful or fraudulent material.</Bullet>
          <Bullet>Impersonate another person.</Bullet>
          <Bullet>Contain abusive, threatening, or discriminatory material.</Bullet>
          <Bullet>Infringe another person&apos;s intellectual property or privacy rights.</Bullet>
          <Bullet>Contain malicious software or content intended to damage the service.</Bullet>
          <Paragraph>Modern Voice FM may remove content that violates these requirements.</Paragraph>
        </Section>

        <Section title={t('legal.terms.section7')}>
          <Paragraph>
            Modern Voice FM may collect information necessary to provide and improve its services, including
            account information and information relating to your use of the application.
          </Paragraph>
          <Paragraph>
            Information collected through the service will be handled in accordance with the Modern Voice FM
            Privacy Policy.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section8')}>
          <Paragraph>
            For registered users, Modern Voice FM may record information about radio listening activity, including
            listening sessions, listening duration, number of sessions, active listening days, and related
            analytics.
          </Paragraph>
          <Paragraph>
            This information may be used to understand audience engagement, improve the service, and provide
            administrators with listener statistics.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section9')}>
          <Paragraph>
            The Modern Voice FM name, branding, logos, application design, original content, graphics, audio
            materials, and other intellectual property belonging to Modern Voice FM may not be copied, reproduced,
            modified, or distributed without permission.
          </Paragraph>
          <Paragraph>Third-party content remains the property of its respective owners.</Paragraph>
        </Section>

        <Section title={t('legal.terms.section10')}>
          <Paragraph>Users must not attempt to:</Paragraph>
          <Bullet>Gain unauthorized access to the application, website, servers, or databases.</Bullet>
          <Bullet>Circumvent security or authentication mechanisms.</Bullet>
          <Bullet>Interfere with the radio stream or services.</Bullet>
          <Bullet>Use automated methods to abuse the service.</Bullet>
          <Bullet>Attempt to manipulate listener statistics.</Bullet>
          <Bullet>Reverse engineer or exploit the service for unauthorized purposes.</Bullet>
          <Bullet>Use the service for illegal activities.</Bullet>
        </Section>

        <Section title={t('legal.terms.section11')}>
          <Paragraph>
            Modern Voice FM may add, remove, modify, suspend, or discontinue features of the application or website
            at any time.
          </Paragraph>
          <Paragraph>
            We may also perform maintenance or updates that temporarily affect service availability.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section12')}>
          <Paragraph>
            Modern Voice FM may suspend or terminate an account if the user violates these Terms and Conditions,
            engages in fraudulent activity, abuses the service, or creates a security risk.
          </Paragraph>
          <Paragraph>
            Users may also request deletion of their account where such functionality is provided.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section13')}>
          <Paragraph>
            Modern Voice FM may use third-party services for functions such as authentication, hosting, analytics,
            maps, notifications, streaming, advertising, or other technical services.
          </Paragraph>
          <Paragraph>The availability of these services may affect certain features of Modern Voice FM.</Paragraph>
        </Section>

        <Section title={t('legal.terms.section14')}>
          <Paragraph>Modern Voice FM provides its services on an &quot;as available&quot; basis.</Paragraph>
          <Paragraph>
            While reasonable efforts are made to keep the application, website, and radio stream operational,
            Modern Voice FM does not guarantee that the service will always be available, uninterrupted, secure, or
            free from errors.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section15')}>
          <Paragraph>
            To the extent permitted by applicable law, Modern Voice FM will not be responsible for losses or
            damages resulting from interruptions, technical failures, internet connectivity problems, unauthorized
            access, or circumstances beyond its reasonable control.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section16')}>
          <Paragraph>Modern Voice FM may update these Terms and Conditions from time to time.</Paragraph>
          <Paragraph>
            When significant changes are made, users may be notified through the application, website, or other
            appropriate communication channels.
          </Paragraph>
          <Paragraph>
            Continued use of the service after the updated terms become effective constitutes acceptance of the
            revised terms.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section17')}>
          <Paragraph>
            If you have questions regarding these Terms and Conditions, you may contact Modern Voice FM through the
            official contact channels provided in the application.
          </Paragraph>
        </Section>

        <Section title={t('legal.terms.section18')}>
          <Paragraph>By creating an account, you confirm that:</Paragraph>
          <Bullet>You have read and understood these Terms and Conditions.</Bullet>
          <Bullet>You agree to comply with them.</Bullet>
          <Bullet>
            You understand that your registered listening activity may be recorded for audience analytics.
          </Bullet>
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
