import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useGetActiveAdvertisementsQuery, useRegisterImpressionMutation, useRegisterClickMutation } from '@redux/api/advertisementsApi';
import { spacing } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import type { RootStackParamList } from '@navigation/types';

const COUNTDOWN_SECONDS = 5;

/**
 * Shown once per cold start, right after Splash, before Main — a natural break point in
 * the app's lifecycle. Never lasts longer than COUNTDOWN_SECONDS: tapping the ad within
 * that window goes to its details page, otherwise it auto-continues to Main. If no
 * interstitial ad is configured it continues through immediately with nothing rendered.
 */
const InterstitialAdScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading } = useGetActiveAdvertisementsQuery({ placement: 'interstitial' });
  const [registerImpression] = useRegisterImpressionMutation();
  const [registerClick] = useRegisterClickMutation();
  const hasNavigatedAway = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  const ad = useMemo(() => {
    const ads = data?.data ?? [];
    if (!ads.length) return null;
    return ads[Math.floor(Math.random() * ads.length)];
  }, [data]);

  const continueToMain = () => {
    if (hasNavigatedAway.current) return;
    hasNavigatedAway.current = true;
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  useEffect(() => {
    if (!isLoading && !ad) continueToMain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, ad]);

  useEffect(() => {
    if (ad) void registerImpression(ad.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id]);

  // The 5s countdown that caps how long this screen can stay up, regardless of user action.
  // The interval only ticks state down (a pure update); the actual navigation side-effect
  // lives in the separate effect below, once secondsLeft reaches 0 — dispatching a
  // navigation action from inside a setState updater trips React's cross-component
  // render warning, since navigation.reset() itself updates a different component's state.
  useEffect(() => {
    if (!ad) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [ad?.id]);

  useEffect(() => {
    if (ad && secondsLeft === 0) continueToMain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad, secondsLeft]);

  if (!ad) return null;

  const onPressAd = () => {
    if (hasNavigatedAway.current) return;
    hasNavigatedAway.current = true;
    void registerClick(ad.id);
    navigation.reset({ index: 0, routes: [{ name: 'AdvertisementDetails', params: { ad } }] });
  };

  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onPressAd}>
        <Image source={{ uri: ad.image_url }} style={styles.image} contentFit="contain" />
      </Pressable>
      <SafeAreaView style={StyleSheet.absoluteFillObject} pointerEvents="box-none" edges={['top']}>
        <View style={styles.topRow}>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{secondsLeft}</Text>
          </View>
          <Pressable onPress={continueToMain} hitSlop={12} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  image: { width: '100%', height: '100%' },
  topRow: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countdownBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: { color: '#FFFFFF', fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InterstitialAdScreen;
