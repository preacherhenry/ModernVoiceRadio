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
  /**
   * Heavily frosted, near-opaque variant for surfaces that float over arbitrary
   * content and must stay readable — the mini player and the popup ad card. The
   * default (see-through) variant is for decorative tiles sitting on a known background.
   */
  strong?: boolean;
}

/**
 * The glassmorphism surface used for the mini player, modals over artwork, and stat
 * tiles on Home. Falls back to a semi-transparent tinted View on Android where BlurView
 * historically renders inconsistently across OEM skins.
 */
const GlassCard: React.FC<Props> = ({
  children, style, intensity = 40, padded = true, strong = false,
}) => {
  const { colors, isDark } = useAppTheme();

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={strong ? 90 : intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.container, style]}
      >
        {/* On iOS the blur alone still reads as translucent; a tint layered on top
            keeps the frosted look while cutting how much shows through. */}
        <View
          style={[
            strong && { backgroundColor: colors.glassTintStrong },
            strong && styles.border,
            strong && { borderColor: colors.glassBorder },
            padded && styles.padding,
          ]}
        >
          {children}
        </View>
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: strong ? colors.glassFillStrong : colors.glassFill },
        style,
      ]}
    >
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
