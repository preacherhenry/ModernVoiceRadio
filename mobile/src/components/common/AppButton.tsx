import React from 'react';
import {
  Pressable, StyleSheet, Text, ActivityIndicator, type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '@theme/ThemeProvider';
import { gradients } from '@constants/colors';
import { radius, spacing } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AppButton: React.FC<Props> = ({
  label, onPress, variant = 'primary', loading = false, disabled = false, style, icon,
}) => {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;

  const handlePressIn = () => { scale.value = withTiming(0.97, { duration: 100 }); };
  const handlePressOut = () => { scale.value = withTiming(1, { duration: 150 }); };

  const content = (
    <>
      {icon}
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: variant === 'primary' ? '#FFFFFF' : colors.primary },
          ]}
        >
          {label}
        </Text>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[animatedStyle, style, isDisabled && styles.disabled]}
      >
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.outlineButton,
        variant === 'outline' && { borderColor: colors.primary, borderWidth: 1.5 },
        style,
        isDisabled && styles.disabled,
      ]}
    >
      {content}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 15,
    borderRadius: radius.pill,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 15,
    borderRadius: radius.pill,
  },
  label: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.base,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AppButton;
