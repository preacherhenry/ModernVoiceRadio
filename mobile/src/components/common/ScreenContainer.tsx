import React from 'react';
import { StyleSheet, View, type ViewStyle, RefreshControl, Platform } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { useAppTheme } from '@theme/ThemeProvider';
import GradientBackground from './GradientBackground';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withGradient?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

/** Standard screen scaffold: safe-area + optional pull-to-refresh scroll + brand backdrop. */
const ScreenContainer: React.FC<Props> = ({
  children, scroll = true, edges = ['top'], style, contentContainerStyle, withGradient = true, onRefresh, refreshing = false,
}) => {
  const { colors } = useAppTheme();

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? (
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
      ) : undefined}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentContainerStyle]}>{children}</View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }, style]}>
      {withGradient && <GradientBackground />}
      <SafeAreaView style={styles.flex} edges={edges}>
        {body}
      </SafeAreaView>
    </View>
  );
};

/**
 * Enough room to clear the floating tab bar *and* the mini player that sits above it,
 * so the last item in any list stays reachable while something is playing. Reserved
 * unconditionally — a little extra whitespace when idle beats clipped content.
 */
export const BOTTOM_INSET = Platform.OS === 'ios' ? 168 : 148;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: BOTTOM_INSET },
});

export default ScreenContainer;
