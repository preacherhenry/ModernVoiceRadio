import React, { useRef, useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, Dimensions, type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, interpolate, Extrapolation, useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import GradientBackground from '@components/common/GradientBackground';
import AppButton from '@components/common/AppButton';
import { useAppDispatch } from '@redux/hooks';
import { setHasOnboarded } from '@redux/slices/settingsSlice';
import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import type { RootStackParamList } from '@navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  titleKey: string;
  descriptionKey: string;
}

const SLIDES: Slide[] = [
  { icon: 'radio-tower', titleKey: 'onboarding.slide1.title', descriptionKey: 'onboarding.slide1.description' },
  { icon: 'podcast', titleKey: 'onboarding.slide2.title', descriptionKey: 'onboarding.slide2.description' },
  { icon: 'bell-ring-outline', titleKey: 'onboarding.slide3.title', descriptionKey: 'onboarding.slide3.description' },
];

const OnboardingScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const finishOnboarding = () => {
    dispatch(setHasOnboarded(true));
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const goNext = () => {
    const next = activeIndex + 1;
    if (next >= SLIDES.length) {
      finishOnboarding();
      return;
    }
    // Advance the index here rather than waiting for onMomentumScrollEnd: that event is
    // not reliably emitted for a programmatic scroll, so activeIndex went stale and the
    // next tap simply scrolled to the slide already on screen — the button appeared dead.
    setActiveIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  return (
    <View style={styles.container}>
      <GradientBackground variant="background" />

      <Pressable style={styles.skip} onPress={finishOnboarding} hitSlop={12}>
        <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
      </Pressable>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.titleKey}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        // Every slide is exactly one screen wide, so giving the list its layout up front
        // makes scrollToIndex land precisely instead of having to measure first.
        getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
        renderItem={({ item, index }) => (
          <SlideCard item={item} index={index} scrollX={scrollX} />
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <Dot key={slide.titleKey} index={i} scrollX={scrollX} />
          ))}
        </View>
        <AppButton
          label={activeIndex === SLIDES.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
          onPress={goNext}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

const SlideCard: React.FC<{ item: Slide; index: number; scrollX: Animated.SharedValue<number> }> = ({ item, index, scrollX }) => {
  const { t } = useTranslation();
  const style = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const scale = interpolate(scrollX.value, inputRange, [0.75, 1, 0.75], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <Animated.View style={[styles.iconCircle, style]}>
        <MaterialCommunityIcons name={item.icon} size={72} color="#FFFFFF" />
      </Animated.View>
      <Text style={styles.title}>{t(item.titleKey)}</Text>
      <Text style={styles.description}>{t(item.descriptionKey)}</Text>
    </View>
  );
};

const Dot: React.FC<{ index: number; scrollX: Animated.SharedValue<number> }> = ({ index, scrollX }) => {
  const style = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP);
    return { width, opacity };
  });
  return <Animated.View style={[styles.dot, style]} />;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { position: 'absolute', top: 56, right: spacing.lg, zIndex: 10 },
  skipText: { color: 'rgba(255,255,255,0.8)', fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  nextButton: {},
});

export default OnboardingScreen;
