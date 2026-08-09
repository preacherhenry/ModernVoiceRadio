import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '@theme/ThemeProvider';

interface Props {
  size?: number;
  fullscreen?: boolean;
}

const Dot: React.FC<{ delay: number; color: string; size: number }> = ({ delay, color, size }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-size * 0.7, { duration: 320, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 320, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, size, translateY]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Animated.View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color, marginHorizontal: size * 0.3 },
        style,
      ]}
    />
  );
};

/** Lightweight three-dot bounce used in place of a spinner for a more "broadcast" feel. */
const LoadingIndicator: React.FC<Props> = ({ size = 10, fullscreen = false }) => {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, fullscreen && styles.fullscreen]}>
      <Dot delay={0} color={colors.primary} size={size} />
      <Dot delay={120} color={colors.accent} size={size} />
      <Dot delay={240} color={colors.secondary} size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  fullscreen: { flex: 1 },
});

export default LoadingIndicator;
