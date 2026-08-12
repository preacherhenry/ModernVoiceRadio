import React, { useMemo } from 'react';
import {
  StyleSheet, View, Text, Pressable, Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import ComingSoonState from '@components/common/ComingSoonState';
import GlassCard from '@components/common/GlassCard';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetContactInformationQuery } from '@redux/api/settingsApi';

import { spacing } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface ContactRow {
  icon: IconName;
  label: string;
  value: string;
  onPress?: () => void;
}

interface SocialLink {
  icon: IconName;
  url: string;
}

const ContactScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const {
    data, isLoading, isError, refetch,
  } = useGetContactInformationQuery();
  const contact = data?.data;

  const rows = useMemo<ContactRow[]>(() => {
    if (!contact) return [];
    const list: ContactRow[] = [];
    if (contact.phone) {
      list.push({
        icon: 'phone-outline', label: t('contact.call'), value: contact.phone, onPress: () => Linking.openURL(`tel:${contact.phone}`),
      });
    }
    if (contact.whatsapp) {
      const digits = contact.whatsapp.replace(/\D/g, '');
      list.push({
        icon: 'whatsapp', label: t('contact.whatsapp'), value: contact.whatsapp, onPress: () => Linking.openURL(`https://wa.me/${digits}`),
      });
    }
    if (contact.email) {
      list.push({
        icon: 'email-outline', label: t('contact.email'), value: contact.email, onPress: () => Linking.openURL(`mailto:${contact.email}`),
      });
    }
    if (contact.address) {
      list.push({
        icon: 'map-marker-outline',
        label: t('contact.address'),
        value: contact.address,
        onPress: () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address as string)}`),
      });
    }
    return list;
  }, [contact, t]);

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

  if (isLoading) {
    return (
      <ScreenContainer edges={['top']}>
        <LoadingIndicator fullscreen />
      </ScreenContainer>
    );
  }

  if (isError || !contact) {
    return (
      <ScreenContainer edges={['top']}>
        <ErrorState onRetry={refetch} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('contact.title')}</Text>
        <Text style={[typeStyles.body, { color: colors.textSecondary }]}>{contact.station_name}</Text>
      </View>

      <View style={styles.rowsWrap}>
        {rows.map((row) => (
          <Pressable key={row.label} onPress={row.onPress} disabled={!row.onPress}>
            <GlassCard style={styles.rowCard}>
              <View style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialCommunityIcons name={row.icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                  <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{row.value}</Text>
                </View>
                {!!row.onPress && <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />}
              </View>
            </GlassCard>
          </Pressable>
        ))}
      </View>

      {socials.length > 0 && (
        <View style={styles.socialsWrap}>
          <Text style={[styles.socialsTitle, { color: colors.textSecondary }]}>{t('contact.followUs')}</Text>
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

      {/* The map needs a Google Maps API key, which isn't provisioned yet — rendering
          MapView without one yields a blank grey box, so show the pending notice
          instead until a key is configured. */}
      <View style={styles.mapNoticeWrap}>
        <ComingSoonState compact icon="map-outline" description={t('comingSoon.map')} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  rowsWrap: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  rowCard: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1 },
  rowLabel: { fontFamily: fontFamily.body, fontSize: fontSize.xs },
  rowValue: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base, marginTop: 2 },
  socialsWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  socialsTitle: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm, marginBottom: spacing.sm },
  socialsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  socialButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  mapNoticeWrap: { marginTop: spacing.lg },
});

export default ContactScreen;
