import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { radius, spacing, elevation } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import type { Program } from '@apptypes/models';

interface Props {
  program: Program;
  onPress: () => void;
  width?: number;
}

const ProgramCard: React.FC<Props> = ({ program, onPress, width = 200 }) => {
  const { colors } = useAppTheme();
  const presenterNames = program.presenters?.map((p) => p.full_name).join(', ');

  return (
    <Pressable onPress={onPress} style={[styles.container, { width, backgroundColor: colors.card }, elevation.card]}>
      {program.cover_image_url ? (
        <Image source={{ uri: program.cover_image_url }} style={styles.cover} transition={200} />
      ) : (
        <View style={[styles.cover, styles.placeholder, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons name="microphone-variant" size={28} color={colors.primary} />
        </View>
      )}
      <View style={styles.body}>
        {program.category && (
          <Text style={[styles.category, { color: colors.primary }]}>{program.category.toUpperCase()}</Text>
        )}
        <Text numberOfLines={1} style={[styles.title, { color: colors.textPrimary }]}>{program.title}</Text>
        {!!presenterNames && (
          <Text numberOfLines={1} style={[styles.subtitle, { color: colors.textSecondary }]}>{presenterNames}</Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: radius.lg, overflow: 'hidden' },
  cover: { width: '100%', aspectRatio: 1.6 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.sm },
  category: { fontFamily: fontFamily.bodySemiBold, fontSize: 10, letterSpacing: 0.6, marginBottom: 2 },
  title: { fontFamily: fontFamily.headingMedium, fontSize: fontSize.base },
  subtitle: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 2 },
});

export default ProgramCard;
