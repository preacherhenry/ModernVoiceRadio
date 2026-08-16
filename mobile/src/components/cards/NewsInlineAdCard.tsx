import React, { useEffect } from 'react';
import {
  StyleSheet, View, Text, Pressable, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@theme/ThemeProvider';
import { radius, spacing, elevation } from '@constants/spacing';
import { fontFamily, fontSize } from '@constants/typography';
import { optimizedImageUrl } from '@utils/imageUrl';
import type { Advertisement } from '@apptypes/models';
import { useRegisterImpressionMutation, useRegisterClickMutation } from '@redux/api/advertisementsApi';

interface Props {
  ad: Advertisement;
}

/** A "news_inline" ad rendered inline within the article feed — visually mirrors NewsCard's featured layout, badged as an ad. */
const NewsInlineAdCard: React.FC<Props> = ({ ad }) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [registerImpression] = useRegisterImpressionMutation();
  const [registerClick] = useRegisterClickMutation();

  useEffect(() => {
    void registerImpression(ad.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad.id]);

  const onPress = () => {
    void registerClick(ad.id);
    if (ad.target_url) void Linking.openURL(ad.target_url);
  };

  return (
    <Pressable onPress={onPress} style={[styles.container, { backgroundColor: colors.card }, elevation.card]}>
      <Image source={{ uri: optimizedImageUrl(ad.image_url) }} style={styles.cover} transition={200} />
      <View style={styles.body}>
        <View style={[styles.badge, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{t('advertisement.shortBadge')}</Text>
        </View>
        <Text numberOfLines={2} style={[styles.title, { color: colors.textPrimary }]}>{ad.title}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: radius.lg, overflow: 'hidden' },
  cover: { width: '100%', aspectRatio: 16 / 9 },
  body: { padding: spacing.sm, gap: 4 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  badgeText: { fontSize: 9, fontFamily: fontFamily.bodySemiBold, letterSpacing: 0.6 },
  title: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
});

export default NewsInlineAdCard;
