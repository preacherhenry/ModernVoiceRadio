import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, Pressable, Linking, FlatList, useWindowDimensions,
  type NativeSyntheticEvent, type NativeScrollEvent,
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
import { useGetActiveAdvertisementsQuery } from '@redux/api/advertisementsApi';
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
  const { ad: adFromRoute } = route.params;
  const { width: windowWidth } = useWindowDimensions();

  // The route param is a snapshot taken when the advert was tapped. Re-read the live
  // copy from the ads cache so an admin's edit (new pictures, changed details) shows up
  // while this screen is open. Falls back to the snapshot if the advert has since been
  // deactivated or deleted, so the screen degrades to stale content rather than blank.
  const { data: liveAds } = useGetActiveAdvertisementsQuery({ placement: adFromRoute.placement });
  const ad = useMemo(
    () => liveAds?.data?.find((candidate) => candidate.id === adFromRoute.id) ?? adFromRoute,
    [liveAds, adFromRoute],
  );

  // Main poster first, then any supporting pictures — one gallery, so a poster-only
  // advert is simply a gallery of one with no paging controls.
  const galleryImages = useMemo(
    () => [ad.image_url, ...(ad.media ?? []).map((m) => m.media_url)],
    [ad],
  );
  const hasMultiple = galleryImages.length > 1;

  const [activeIndex, setActiveIndex] = useState(0);
  // Defaults to a 16:10 box until the real image loads, then switches to the poster's
  // own ratio so the full artwork shows uncropped.
  const [imageAspectRatio, setImageAspectRatio] = useState(16 / 10);

  const onGalleryScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    setActiveIndex(Math.max(0, Math.min(index, galleryImages.length - 1)));
  }, [windowWidth, galleryImages.length]);

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
        <FlatList
          data={galleryImages}
          keyExtractor={(uri, index) => `${uri}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onGalleryScroll}
          // A single-image advert shouldn't feel swipeable at all.
          scrollEnabled={hasMultiple}
          renderItem={({ item, index }) => (
            <Image
              source={{ uri: item }}
              style={{ width: windowWidth, height: '100%' }}
              contentFit="contain"
              transition={200}
              onLoad={(event) => {
                // Only the main poster drives the frame's shape, so the box doesn't
                // jump around as the user swipes through differently-shaped pictures.
                if (index !== 0) return;
                const { width, height } = event.source;
                if (width && height) setImageAspectRatio(width / height);
              }}
            />
          )}
        />

        <Pressable onPress={continueToApp} hitSlop={12} style={styles.backButton}>
          <MaterialCommunityIcons name="close" size={22} color="#FFFFFF" />
        </Pressable>

        {/* Paging controls appear only when there are supporting pictures to page through. */}
        {hasMultiple && (
          <>
            <View style={styles.counterPill}>
              <Text style={styles.counterText}>{activeIndex + 1}/{galleryImages.length}</Text>
            </View>
            <View style={styles.dotsRow} pointerEvents="none">
              {galleryImages.map((uri, index) => (
                <View
                  key={`dot-${uri}-${index}`}
                  style={[
                    styles.dot,
                    index === activeIndex ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          </>
        )}
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
  headerWrap: { width: '100%', position: 'relative', overflow: 'hidden' },
  counterPill: {
    position: 'absolute', top: spacing.md, right: spacing.lg,
    paddingHorizontal: spacing.xs, paddingVertical: 4, borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  counterText: { color: '#FFFFFF', fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs },
  dotsRow: {
    position: 'absolute', bottom: spacing.sm, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotActive: { backgroundColor: '#FFFFFF' },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.45)' },
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
