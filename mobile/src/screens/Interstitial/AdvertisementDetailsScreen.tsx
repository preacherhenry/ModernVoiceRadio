import React, { useMemo, useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import GlassCard from '@components/common/GlassCard';
import AppButton from '@components/common/AppButton';

import { useAppTheme } from '@theme/ThemeProvider';
import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { RootStackParamList } from '@navigation/types';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface ContactRow {
  icon: IconName;
  label: string;
  value: string;
  onPress: () => void;
}

/**
 * Reached by tapping an interstitial ad within its 5s window. Shows the sponsor's full
 * details — description and contact info — with a clear way back into the app, since
 * this screen (unlike the interstitial itself) has no time limit.
 */
const AdvertisementDetailsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AdvertisementDetails'>>();
  const { ad } = route.params;

  // Defaults to a 16:10 box (matches the interstitial's crop) until the real image loads,
  // then switches to the poster's own ratio so the full artwork shows uncropped.
  const [imageAspectRatio, setImageAspectRatio] = useState(16 / 10);

  const continueToApp = () => {
    // Main always sits below this screen (reached either by replacing the
    // interstitial popup or by pushing from the home banner), so popping back
    // preserves whatever tab/scroll state the user already had.
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const rows = useMemo<ContactRow[]>(() => {
    const list: ContactRow[] = [];
    if (ad.contact_phone) {
      list.push({
        icon: 'phone-outline', label: t('contact.call'), value: ad.contact_phone, onPress: () => Linking.openURL(`tel:${ad.contact_phone}`),
      });
    }
    if (ad.contact_whatsapp) {
      const digits = ad.contact_whatsapp.replace(/\D/g, '');
      list.push({
        icon: 'whatsapp', label: t('contact.whatsapp'), value: ad.contact_whatsapp, onPress: () => Linking.openURL(`https://wa.me/${digits}`),
      });
    }
    if (ad.contact_email) {
      list.push({
        icon: 'email-outline', label: t('contact.email'), value: ad.contact_email, onPress: () => Linking.openURL(`mailto:${ad.contact_email}`),
      });
    }
    if (ad.contact_address) {
      list.push({
        icon: 'map-marker-outline',
        label: t('contact.address'),
        value: ad.contact_address,
        onPress: () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ad.contact_address as string)}`),
      });
    }
    return list;
  }, [ad, t]);

  return (
    <ScreenContainer edges={['top', 'bottom']} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.headerWrap, { aspectRatio: imageAspectRatio, backgroundColor: colors.surfaceVariant }]}>
        <Image
          source={{ uri: ad.image_url }}
          style={styles.headerImage}
          contentFit="contain"
          transition={200}
          onLoad={(event) => {
            const { width, height } = event.source;
            if (width && height) setImageAspectRatio(width / height);
          }}
        />
        <Pressable onPress={continueToApp} hitSlop={12} style={styles.backButton}>
          <MaterialCommunityIcons name="close" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={[styles.badge, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{t('advertisement.badge')}</Text>
        </View>
        <Text style={[typeStyles.h1, { color: colors.textPrimary, marginTop: spacing.sm }]}>{ad.title}</Text>

        {!!ad.description && (
          <Text style={[typeStyles.bodyLarge, { color: colors.textSecondary, marginTop: spacing.md }]}>
            {ad.description}
          </Text>
        )}

        {rows.length > 0 && (
          <View style={styles.rowsWrap}>
            {rows.map((row) => (
              <Pressable key={row.label} onPress={row.onPress}>
                <GlassCard style={styles.rowCard}>
                  <View style={styles.row}>
                    <View style={[styles.rowIcon, { backgroundColor: colors.primaryContainer }]}>
                      <MaterialCommunityIcons name={row.icon} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                      <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{row.value}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        )}

        {!!ad.target_url && (
          <AppButton
            label={t('advertisement.visitWebsite')}
            onPress={() => Linking.openURL(ad.target_url as string)}
            style={styles.visitButton}
          />
        )}

        <AppButton label={t('advertisement.continueToApp')} onPress={continueToApp} variant="outline" style={styles.continueButton} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl },
  headerWrap: { width: '100%', position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute', top: spacing.md, left: spacing.lg, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  body: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  badgeText: { fontSize: 10, fontFamily: fontFamily.bodySemiBold, letterSpacing: 0.6 },
  rowsWrap: { marginTop: spacing.lg, gap: spacing.sm },
  rowCard: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1 },
  rowLabel: { fontFamily: fontFamily.body, fontSize: fontSize.xs },
  rowValue: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base, marginTop: 2 },
  visitButton: { marginTop: spacing.lg },
  continueButton: { marginTop: spacing.sm },
});

export default AdvertisementDetailsScreen;
