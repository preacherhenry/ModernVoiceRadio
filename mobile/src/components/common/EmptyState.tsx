import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { spacing } from '@constants/spacing';
import { typeStyles } from '@constants/typography';

interface Props {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<Props> = ({
  icon = 'inbox-outline', title, description, action,
}) => {
  const { colors } = useAppTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceVariant }]}>
        <MaterialCommunityIcons name={icon} size={36} color={colors.textMuted} />
      </View>
      <Text style={[typeStyles.h4, { color: colors.textPrimary, marginTop: spacing.md }]}>{title}</Text>
      {description && (
        <Text style={[typeStyles.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxs }]}>
          {description}
        </Text>
      )}
      {action && <View style={{ marginTop: spacing.lg }}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EmptyState;
