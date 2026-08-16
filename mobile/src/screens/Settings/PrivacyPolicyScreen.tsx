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

/** A labelled group inside a section, e.g. "Account Information" under what we collect. */
const SubHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useAppTheme();
  return <Text style={[styles.subHeading, { color: colors.textPrimary }]}>{children}</Text>;
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
 * The station's Privacy Policy, as supplied by Modern Voice FM.
 *
 * As with the Terms, section headings are translated (legal.privacy.* in the locale
 * files) while the operative wording stays in English — a machine-translated privacy
 * commitment could misstate what the station actually does with a listener's data.
 */
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
        <Text style={[styles.updated, { color: colors.textMuted }]}>
          {t('legal.lastUpdated', { date: '16 August 2026' })}
        </Text>

        <Paragraph>
          Modern Voice FM respects your privacy and is committed to protecting the personal information you provide
          when using the Modern Voice FM application, website, and related services.
        </Paragraph>
        <Paragraph>
          This Privacy Policy explains what information we collect, how we use it, how we protect it, and your
          choices regarding your information.
        </Paragraph>

        <Section title={t('legal.privacy.section1')}>
          <Paragraph>
            When you use Modern Voice FM, we may collect the following information depending on the features you
            use.
          </Paragraph>

          <SubHeading>Account Information</SubHeading>
          <Paragraph>When you create an account, we may collect:</Paragraph>
          <Bullet>Full name</Bullet>
          <Bullet>Username</Bullet>
          <Bullet>Email address</Bullet>
          <Bullet>Phone number, where required</Bullet>
          <Bullet>Password or securely stored authentication information</Bullet>
          <Bullet>Account creation date</Bullet>
          <Bullet>Terms and Conditions acceptance information</Bullet>
          <Paragraph>
            We only collect information necessary to provide and manage your account.
          </Paragraph>

          <SubHeading>Listening Information</SubHeading>
          <Paragraph>
            When a registered user listens to the Modern Voice FM radio stream, we may collect information such as:
          </Paragraph>
          <Bullet>Date and time listening started</Bullet>
          <Bullet>Date and time listening ended</Bullet>
          <Bullet>Listening duration</Bullet>
          <Bullet>Number of listening sessions</Bullet>
          <Bullet>Number of days the user listened</Bullet>
          <Bullet>Most recent listening activity</Bullet>
          <Bullet>Total listening time</Bullet>
          <Paragraph>
            This information is used to understand audience engagement and improve the Modern Voice FM service.
          </Paragraph>

          <SubHeading>Device and Technical Information</SubHeading>
          <Paragraph>
            We may automatically collect limited technical information necessary for the operation and security of
            the application, such as:
          </Paragraph>
          <Bullet>Device type</Bullet>
          <Bullet>Operating system</Bullet>
          <Bullet>Application version</Bullet>
          <Bullet>IP address</Bullet>
          <Bullet>Browser information when using the website</Bullet>
          <Bullet>Basic technical and error information</Bullet>
        </Section>

        <Section title={t('legal.privacy.section2')}>
          <Paragraph>Modern Voice FM may use collected information to:</Paragraph>
          <Bullet>Create and manage user accounts.</Bullet>
          <Bullet>Authenticate users.</Bullet>
          <Bullet>Provide access to the radio stream and other features.</Bullet>
          <Bullet>Maintain and improve the application and website.</Bullet>
          <Bullet>Measure listener engagement.</Bullet>
          <Bullet>Calculate listening duration.</Bullet>
          <Bullet>Identify unique and returning registered listeners.</Bullet>
          <Bullet>Provide listener statistics to authorized administrators.</Bullet>
          <Bullet>Send important service notifications.</Bullet>
          <Bullet>Respond to user requests and support enquiries.</Bullet>
          <Bullet>Detect, prevent, and investigate abuse, fraud, or security problems.</Bullet>
          <Bullet>Troubleshoot technical problems.</Bullet>
          <Bullet>Comply with applicable legal requirements.</Bullet>
        </Section>

        <Section title={t('legal.privacy.section3')}>
          <Paragraph>
            Modern Voice FM may use registered-user listening information to generate audience statistics.
          </Paragraph>
          <Paragraph>These statistics may include:</Paragraph>
          <Bullet>Number of unique registered listeners.</Bullet>
          <Bullet>Returning listeners.</Bullet>
          <Bullet>Most active listeners.</Bullet>
          <Bullet>Total listening time.</Bullet>
          <Bullet>Average listening duration.</Bullet>
          <Bullet>Number of listening sessions.</Bullet>
          <Bullet>Individual listening history.</Bullet>
          <Paragraph>
            Authorized Modern Voice FM administrators may be able to view individual listener information where
            necessary for audience analytics and management of the service.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section4')}>
          <Paragraph>
            If Modern Voice FM provides personalized notifications or other personalized features, your registered
            name may be used to address you.
          </Paragraph>
          <Paragraph>
            For example, a notification may contain your first name followed by information about a live broadcast.
          </Paragraph>
          <Paragraph>
            Your name will not be publicly displayed to other users simply because you have registered or listened
            to the station.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section5')}>
          <Paragraph>
            Modern Voice FM provides a live radio stream through its application and website.
          </Paragraph>
          <Paragraph>
            Listening to the stream may generate technical information required to maintain the streaming service.
          </Paragraph>
          <Paragraph>
            Registered users may have their listening sessions associated with their account so that listening
            analytics can be calculated.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section6')}>
          <Paragraph>If you allow notifications, Modern Voice FM may send notifications relating to:</Paragraph>
          <Bullet>Live broadcasts.</Bullet>
          <Bullet>Main news.</Bullet>
          <Bullet>Important announcements.</Bullet>
          <Bullet>Station updates.</Bullet>
          <Bullet>Other relevant service information.</Bullet>
          <Paragraph>
            You can disable notifications through your device or application settings where supported.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section7')}>
          <Paragraph>Modern Voice FM does not sell your personal information to third parties.</Paragraph>
          <Paragraph>We may share or provide access to information when necessary to:</Paragraph>
          <Bullet>Operate the Modern Voice FM service.</Bullet>
          <Bullet>Protect the security of the service.</Bullet>
          <Bullet>Prevent fraud or abuse.</Bullet>
          <Bullet>Comply with applicable laws or lawful requests from authorities.</Bullet>
        </Section>

        <Section title={t('legal.privacy.section8')}>
          <Paragraph>
            Modern Voice FM may use third-party technology and service providers for functions such as:
          </Paragraph>
          <Bullet>Account authentication.</Bullet>
          <Bullet>Cloud hosting.</Bullet>
          <Bullet>Database services.</Bullet>
          <Bullet>Radio streaming.</Bullet>
          <Bullet>Push notifications.</Bullet>
          <Bullet>Analytics.</Bullet>
          <Bullet>Error monitoring.</Bullet>
          <Bullet>Security.</Bullet>
          <Paragraph>
            These providers may process certain information according to their own privacy policies and applicable
            agreements.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section9')}>
          <Paragraph>
            Modern Voice FM takes reasonable technical and organizational measures to protect personal information
            against:
          </Paragraph>
          <Bullet>Unauthorized access.</Bullet>
          <Bullet>Unauthorized disclosure.</Bullet>
          <Bullet>Loss.</Bullet>
          <Bullet>Misuse.</Bullet>
          <Bullet>Alteration.</Bullet>
          <Bullet>Destruction.</Bullet>
          <Paragraph>
            Users are responsible for keeping their account credentials confidential and should notify Modern Voice
            FM if they suspect unauthorized access to their account.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section10')}>
          <Paragraph>
            Modern Voice FM may retain personal information for as long as reasonably necessary to:
          </Paragraph>
          <Bullet>Maintain your account.</Bullet>
          <Bullet>Provide requested services.</Bullet>
          <Bullet>Maintain listening statistics.</Bullet>
          <Bullet>Meet operational requirements.</Bullet>
          <Bullet>Resolve disputes.</Bullet>
          <Bullet>Prevent fraud and abuse.</Bullet>
          <Bullet>Comply with applicable legal obligations.</Bullet>
          <Paragraph>
            When information is no longer required, it may be deleted, anonymized, or securely disposed of where
            appropriate.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section11')}>
          <Paragraph>
            Where account deletion is available, users may request deletion of their Modern Voice FM account.
          </Paragraph>
          <Paragraph>
            Deleting an account may result in the removal of account-related information associated with the user,
            subject to information that Modern Voice FM is required or permitted to retain for legitimate purposes.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section12')}>
          <Paragraph>
            Depending on applicable law, you may have rights concerning your personal information, including the
            right to:
          </Paragraph>
          <Bullet>Request access to personal information held about you.</Bullet>
          <Bullet>Request correction of inaccurate information.</Bullet>
          <Bullet>Request deletion of personal information where applicable.</Bullet>
          <Bullet>Object to certain processing of your information.</Bullet>
          <Bullet>Request information about how your personal information is being used.</Bullet>
          <Paragraph>
            Requests relating to your personal information may be made through the official Modern Voice FM contact
            channels.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section13')}>
          <Paragraph>
            Modern Voice FM is not intended to knowingly collect unnecessary personal information from children.
          </Paragraph>
          <Paragraph>
            If you believe that a child has provided personal information to Modern Voice FM without appropriate
            authorization, please contact us so that the information can be reviewed and, where appropriate,
            removed.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section14')}>
          <Paragraph>
            The Modern Voice FM application may contain links to external websites or services.
          </Paragraph>
          <Paragraph>
            Modern Voice FM is not responsible for the privacy practices, content, or security of external
            websites.
          </Paragraph>
          <Paragraph>
            Users should review the privacy policies of external services before providing personal information.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section15')}>
          <Paragraph>
            Modern Voice FM may update this Privacy Policy from time to time to reflect changes to the application,
            services, technology, or applicable requirements.
          </Paragraph>
          <Paragraph>
            When significant changes are made, users may be notified through the application or another appropriate
            method.
          </Paragraph>
          <Paragraph>
            The &quot;Last Updated&quot; date at the top of this policy will indicate when the policy was most
            recently revised.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section16')}>
          <Paragraph>
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal
            information, please contact Modern Voice FM through the official contact information provided within
            the application.
          </Paragraph>
        </Section>

        <Section title={t('legal.privacy.section17')}>
          <Paragraph>
            By creating and using a Modern Voice FM account, you acknowledge that you have read and understood this
            Privacy Policy and understand how your personal information may be collected and used as described
            above.
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
  subHeading: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, marginTop: spacing.xs },
  sectionBody: { gap: spacing.xs },
  paragraph: { fontFamily: fontFamily.body, fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.6 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletDot: { fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.6 },
  bulletText: { flex: 1 },
});

export default PrivacyPolicyScreen;
