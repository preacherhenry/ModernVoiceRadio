import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet, View, Pressable, Text, useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetActiveAdvertisementsQuery, useRegisterImpressionMutation, useRegisterClickMutation } from '@redux/api/advertisementsApi';
import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import type { RootStackParamList } from '@navigation/types';

const COUNTDOWN_SECONDS = 5;

/**
 * A dismissible popup ad shown once per cold start, stacked over Main as a
 * transparent modal so the app stays visible behind the scrim. It never traps the
 * user: an explicit close button is available immediately, and it auto-dismisses
 * after COUNTDOWN_SECONDS. Renders nothing (and pops straight away) if no ad is
 * configured for this placement.
 */
const InterstitialAdScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { data, isLoading } = useGetActiveAdvertisementsQuery({ placement: 'interstitial' });
  const [registerImpression] = useRegisterImpressionMutation();
  const [registerClick] = useRegisterClickMutation();
  const hasNavigatedAway = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [imageAspectRatio, setImageAspectRatio] = useState(4 / 5);

  const ad = useMemo(() => {
    const ads = data?.data ?? [];
    if (!ads.length) return null;
    return ads[Math.floor(Math.random() * ads.length)];
  }, [data]);

  const dismiss = () => {
    if (hasNavigatedAway.current) return;
    hasNavigatedAway.current = true;
    // Main already sits beneath this modal, so dismissing is just a pop.
    navigation.goBack();
  };

  useEffect(() => {
    if (!isLoading && !ad) dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, ad]);

  // This modal renders nothing until an ad arrives, but still sits over the app. A
  // slow ads request (the API cold-starts) would leave an invisible layer swallowing
  // taps, so give up waiting after a moment and hand the app back to the user.
  useEffect(() => {
    if (ad) return undefined;
    const bailout = setTimeout(dismiss, 3000);
    return () => clearTimeout(bailout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad]);

  useEffect(() => {
    if (ad) void registerImpression(ad.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id]);

  // The interval only ticks state down (a pure update); the dismissal side-effect
  // lives in the effect below, once secondsLeft reaches 0 — dispatching navigation
  // from inside a setState updater trips React's cross-component render warning.
  useEffect(() => {
    if (!ad) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [ad?.id]);

  useEffect(() => {
    if (ad && secondsLeft === 0) dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad, secondsLeft]);

  if (!ad) return null;

  const onPressAd = () => {
    if (hasNavigatedAway.current) return;
    hasNavigatedAway.current = true;
    void registerClick(ad.id);
    navigation.replace('AdvertisementDetails', { ad });
  };

  // Keep the card comfortably inside the viewport whatever the poster's shape is.
  const cardWidth = Math.min(windowWidth - spacing.lg * 2, 420);
  const maxImageHeight = windowHeight * 0.6;
  const imageHeight = Math.min(cardWidth / imageAspectRatio, maxImageHeight);

  return (
    <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)} style={styles.root}>
      {/* Tapping the scrim dismisses, matching standard popup behaviour. */}
      <Pressable style={[styles.scrim, { backgroundColor: colors.overlay }]} onPress={dismiss} />

      <Animated.View entering={ZoomIn.duration(260)} style={[styles.card, { width: cardWidth, backgroundColor: colors.surface }]}>
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{t('advertisement.badge')}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.countdownBadge, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.countdownText, { color: colors.textSecondary }]}>{secondsLeft}</Text>
            </View>
            <Pressable
              onPress={dismiss}
              hitSlop={14}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
              style={[styles.closeButton, { backgroundColor: colors.surfaceVariant }]}
            >
              <MaterialCommunityIcons name="close" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <Pressable onPress={onPressAd} style={styles.imageWrap}>
          <Image
            source={{ uri: ad.image_url }}
            style={{ width: '100%', height: imageHeight, borderRadius: radius.md }}
            contentFit="contain"
            transition={200}
            onLoad={(event) => {
              const { width, height } = event.source;
              if (width && height) setImageAspectRatio(width / height);
            }}
          />
        </Pressable>

        <Text numberOfLines={2} style={[styles.title, { color: colors.textPrimary }]}>{ad.title}</Text>

        <Pressable onPress={onPressAd} style={[styles.ctaButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.ctaText}>{t('advertisement.learnMore')}</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
        </Pressable>

        <Pressable onPress={dismiss} hitSlop={8} style={styles.dismissLink}>
          <Text style={[styles.dismissText, { color: colors.textMuted }]}>{t('advertisement.dismiss')}</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrim: { ...StyleSheet.absoluteFillObject },
  card: {
    borderRadius: radius.xl,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  badgeText: { fontSize: 10, fontFamily: fontFamily.bodySemiBold, letterSpacing: 0.6 },
  countdownBadge: {
    minWidth: 26, height: 26, paddingHorizontal: 7, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  countdownText: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs },
  closeButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  imageWrap: { borderRadius: radius.md, overflow: 'hidden' },
  title: {
    fontFamily: fontFamily.headingBold, fontSize: fontSize.lg, marginTop: spacing.sm,
  },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    height: 46, borderRadius: radius.pill, marginTop: spacing.md,
  },
  ctaText: { color: '#FFFFFF', fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base },
  dismissLink: { alignSelf: 'center', paddingVertical: spacing.sm },
  dismissText: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm },
});

export default InterstitialAdScreen;
