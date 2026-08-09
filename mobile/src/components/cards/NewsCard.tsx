import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@theme/ThemeProvider';
import { radius, spacing, elevation } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import { formatRelativeTime } from '@utils/formatters';
import type { NewsArticle } from '@apptypes/models';

interface Props {
  article: NewsArticle;
  onPress: () => void;
  variant?: 'default' | 'featured';
}

const NewsCard: React.FC<Props> = ({ article, onPress, variant = 'default' }) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const isFeatured = variant === 'featured';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: colors.card },
        isFeatured ? styles.featured : styles.rowLayout,
        elevation.card,
      ]}
    >
      {article.cover_image_url ? (
        <Image source={{ uri: article.cover_image_url }} style={isFeatured ? styles.featuredCover : styles.cover} transition={200} />
      ) : (
        <View style={[isFeatured ? styles.featuredCover : styles.cover, styles.placeholder, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons name="newspaper-variant" size={24} color={colors.primary} />
        </View>
      )}

      <View style={styles.body}>
        {article.is_breaking && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={styles.badgeText}>{t('news.breakingBadge')}</Text>
          </View>
        )}
        <Text numberOfLines={isFeatured ? 3 : 2} style={[isFeatured ? styles.featuredTitle : styles.title, { color: colors.textPrimary }]}>
          {article.title}
        </Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>
          {formatRelativeTime(article.published_at)}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: radius.lg, overflow: 'hidden' },
  rowLayout: { flexDirection: 'row', alignItems: 'center' },
  featured: {},
  cover: { width: 96, height: 96 },
  featuredCover: { width: '100%', aspectRatio: 16 / 9 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, padding: spacing.sm, gap: 4 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: fontFamily.bodySemiBold, letterSpacing: 0.4 },
  title: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  featuredTitle: { fontFamily: fontFamily.headingSemiBold, fontSize: fontSize.lg },
  time: { fontFamily: fontFamily.body, fontSize: fontSize.xs },
});

export default NewsCard;
