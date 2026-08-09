import React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@theme/ThemeProvider';
import { gradients } from '@constants/colors';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'background' | 'primary' | 'live';
}

/** Full-bleed backdrop gradient used behind screens — dusk tones in dark mode, soft pastel in light mode. */
const GradientBackground: React.FC<Props> = ({ children, style, variant = 'background' }) => {
  const { isDark } = useAppTheme();

  const colorSets: Record<string, readonly string[]> = {
    background: isDark ? gradients.duskBackground : gradients.dawnBackground,
    primary: gradients.primary,
    live: gradients.live,
  };

  return (
    <LinearGradient
      colors={colorSets[variant] as unknown as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFillObject, style]}
    >
      {children}
    </LinearGradient>
  );
};

export default GradientBackground;
