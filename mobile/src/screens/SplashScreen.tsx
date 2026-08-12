import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing, withDelay,
} from 'react-native-reanimated';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import GradientBackground from '@components/common/GradientBackground';
import { useAppSelector } from '@redux/hooks';
import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import { STATION_FREQUENCY } from '@constants/config';
import logoSource from '@assets/images/logo.png';
import type { RootStackParamList } from '@navigation/types';

const SPLASH_DURATION_MS = 1800;

const WaveBar: React.FC<{ index: number }> = ({ index }) => {
  const height = useSharedValue(10);

  useEffect(() => {
    height.value = withDelay(
      index * 90,
      withRepeat(
        withSequence(
          withTiming(38, { duration: 420, easing: Easing.inOut(Easing.quad) }),
          withTiming(12, { duration: 420, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );
  }, [height, index]);

  const style = useAnimatedStyle(() => ({ height: height.value }));
  return <Animated.View style={[styles.waveBar, style]} />;
};

const SplashScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hasOnboarded = useAppSelector((state) => state.settings.hasOnboarded);

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.4)) });
  }, [logoOpacity, logoScale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasOnboarded) {
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      } else {
        // Authenticated or guest, both land on Main. The interstitial ad is stacked
        // on top as a transparent modal (not a replacement) so the app is visible
        // behind it and the user can dismiss it — it pops itself immediately if no
        // ad is configured.
        navigation.reset({
          index: 1,
          routes: [{ name: 'Main' }, { name: 'Interstitial' }],
        });
      }
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
    // Intentionally runs once — hasOnboarded settles asynchronously but we don't want the
    // splash timer itself to restart if it changes mid-animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={styles.container}>
      <GradientBackground variant="background" />
      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <View style={styles.logoCard}>
            <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
          </View>
        </Animated.View>
        <Text style={styles.tagline}>{t('splash.tagline', { frequency: STATION_FREQUENCY })}</Text>

        <View style={styles.waveRow}>
          {Array.from({ length: 7 }).map((_, i) => <WaveBar key={i} index={i} />)}
        </View>
      </View>

      <Text style={styles.version}>v{version}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', gap: spacing.xs },
  logoWrap: { marginBottom: spacing.md },
  logoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logoImage: {
    width: 220,
    height: 93,
  },
  tagline: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.lg,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
  },
  waveBar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.85,
  },
  version: {
    position: 'absolute',
    bottom: spacing.xl,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
  },
});

export default SplashScreen;
