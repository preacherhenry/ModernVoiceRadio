import React from 'react';
import { StyleSheet, View, type ViewStyle, RefreshControl } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { useAppTheme } from '@theme/ThemeProvider';
import GradientBackground from './GradientBackground';
import { spacing } from '@constants/spacing';

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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
});

export default ScreenContainer;
