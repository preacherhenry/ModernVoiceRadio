import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';
import { spacing } from '@constants/spacing';
import { typeStyles, fontFamily, fontSize } from '@constants/typography';

interface Props {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

const SectionHeader: React.FC<Props> = ({ title, actionLabel, onActionPress }) => {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[typeStyles.h3, { color: colors.textPrimary }]}>{title}</Text>
      {actionLabel && (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Text style={[styles.action, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  action: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
  },
});

export default SectionHeader;
