import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useAppTheme } from '@theme/ThemeProvider';
import { fontFamily } from '@constants/typography';

interface Props {
  uri?: string | null;
  name: string;
  size?: number;
}

const Avatar: React.FC<Props> = ({ uri, name, size = 48 }) => {
  const { colors } = useAppTheme();
  const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        transition={200}
        cachePolicy="disk"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primaryContainer },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38, color: colors.primary }]}>{initials || '?'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fontFamily.headingSemiBold },
});

export default Avatar;
