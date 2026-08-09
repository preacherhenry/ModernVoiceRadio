import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { radius, spacing, elevation } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import type { Podcast } from '@apptypes/models';

interface Props {
  podcast: Podcast;
  onPress: () => void;
  width?: number;
}

const PodcastCard: React.FC<Props> = ({ podcast, onPress, width = 150 }) => {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={{ width }}>
      {podcast.cover_image_url ? (
        <Image source={{ uri: podcast.cover_image_url }} style={[styles.cover, elevation.card]} transition={200} />
      ) : (
        <View style={[styles.cover, styles.placeholder, { backgroundColor: colors.primaryContainer }, elevation.card]}>
          <MaterialCommunityIcons name="podcast" size={30} color={colors.primary} />
        </View>
      )}
      <Text numberOfLines={2} style={[styles.title, { color: colors.textPrimary }]}>{podcast.title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cover: { width: '100%', aspectRatio: 1, borderRadius: radius.md },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm, marginTop: spacing.xs },
});

export default PodcastCard;
