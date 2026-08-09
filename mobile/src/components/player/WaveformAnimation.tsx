import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '@theme/ThemeProvider';

interface BarProps { delay: number; color: string; active: boolean }

const Bar: React.FC<BarProps> = ({ delay, color, active }) => {
  const height = useSharedValue(6);

  useEffect(() => {
    if (active) {
      height.value = withDelayLoop(delay, height);
    } else {
      height.value = withTiming(4, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, delay]);

  const style = useAnimatedStyle(() => ({ height: height.value }));
  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
};

function withDelayLoop(delay: number, shared: Animated.SharedValue<number>) {
  return withRepeat(
    withSequence(
      withTiming(22, { duration: 380 + delay, easing: Easing.inOut(Easing.quad) }),
      withTiming(8, { duration: 320 + delay, easing: Easing.inOut(Easing.quad) }),
      withTiming(18, { duration: 300 + delay, easing: Easing.inOut(Easing.quad) }),
    ),
    -1,
    true,
  );
}

interface Props {
  active?: boolean;
  barCount?: number;
}

/** Live "on-air" waveform used on the Live Radio screen and mini player when audio is playing. */
const WaveformAnimation: React.FC<Props> = ({ active = true, barCount = 5 }) => {
  const { colors } = useAppTheme();
  const barColors = [colors.primary, colors.accent, colors.secondary, colors.accent, colors.primary];

  return (
    <View style={styles.row}>
      {Array.from({ length: barCount }).map((_, i) => (
        <Bar key={i} delay={i * 70} color={barColors[i % barColors.length]} active={active} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 24 },
  bar: { width: 4, borderRadius: 2 },
});

export default WaveformAnimation;
