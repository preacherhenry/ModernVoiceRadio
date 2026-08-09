import React from 'react';
import { StyleSheet, View, type ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@theme/ThemeProvider';
import { radius } from '@constants/spacing';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padded?: boolean;
}

/**
 * The glassmorphism surface used for the mini player, modals over artwork, and stat
 * tiles on Home. Falls back to a semi-transparent tinted View on Android where BlurView
 * historically renders inconsistently across OEM skins.
 */
const GlassCard: React.FC<Props> = ({
  children, style, intensity = 40, padded = true,
}) => {
  const { colors, isDark } = useAppTheme();

  const content = (
    <View
      style={[
        styles.border,
        { borderColor: colors.glassBorder },
        padded && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.container, style]}
      >
        <View style={padded ? styles.padding : undefined}>{children}</View>
      </BlurView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.glassFill }, style]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  border: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  padding: {
    padding: 16,
  },
});

export default GlassCard;
