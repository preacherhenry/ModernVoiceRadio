import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { brand } from '@constants/colors';
import { radius, spacing } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';

interface Props {
  label?: string;
  size?: 'sm' | 'md';
}

const LiveBadge: React.FC<Props> = ({ label, size = 'sm' }) => {
  const { t } = useTranslation();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(0.35, { duration: 700 }), withTiming(1, { duration: 700 })), -1, true);
  }, [opacity]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[styles.container, size === 'md' && styles.containerMd]}>
      <Animated.View style={[styles.dot, dotStyle]} />
      <Text style={[styles.label, size === 'md' && styles.labelMd]}>{label ?? t('common.live')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.red,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 5,
    alignSelf: 'flex-start',
  },
  containerMd: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  label: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
  },
  labelMd: {
    fontSize: fontSize.sm,
  },
});

export default LiveBadge;
