import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';
import { radius, spacing, elevation } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import Avatar from '@components/common/Avatar';
import type { Presenter } from '@apptypes/models';

interface Props {
  presenter: Presenter;
  onPress: () => void;
  width?: number;
}

const PresenterCard: React.FC<Props> = ({ presenter, onPress, width = 156 }) => {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { width, backgroundColor: colors.card }, elevation.card]}
    >
      <Avatar uri={presenter.photo_url} name={presenter.full_name} size={72} />
      <Text numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>{presenter.full_name}</Text>
      {!!presenter.role_title && (
        <Text numberOfLines={1} style={[styles.role, { color: colors.textSecondary }]}>{presenter.role_title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: 6,
  },
  name: { fontFamily: fontFamily.headingMedium, fontSize: fontSize.base, textAlign: 'center' },
  role: { fontFamily: fontFamily.body, fontSize: fontSize.xs, textAlign: 'center' },
});

export default PresenterCard;
