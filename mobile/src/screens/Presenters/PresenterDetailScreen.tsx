import React from 'react';
import {
  StyleSheet, View, Text, Pressable, FlatList, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer, { BOTTOM_INSET } from '@components/common/ScreenContainer';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';
import SectionHeader from '@components/common/SectionHeader';
import ProgramCard from '@components/cards/ProgramCard';
import PodcastCard from '@components/cards/PodcastCard';

import { useAppTheme } from '@theme/ThemeProvider';
import { useGetPresenterQuery } from '@redux/api/presentersApi';

import { spacing } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import type { HomeStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type DetailRoute = RouteProp<HomeStackParamList, 'PresenterDetail'>;

const SOCIAL_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  instagram: 'instagram',
  twitter: 'twitter',
  facebook: 'facebook',
  tiktok: 'music-note',
};

const PresenterDetailScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { idOrSlug } = route.params;

  const {
    data, isLoading, isError, refetch,
  } = useGetPresenterQuery(idOrSlug);
  const presenter = data?.data;

  if (isLoading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingIndicator fullscreen />
      </ScreenContainer>
    );
  }

  if (isError || !presenter) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.backRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <ErrorState onRetry={refetch} description={t('presenters.detail.loadError')} />
      </ScreenContainer>
    );
  }

  const socials = Object.entries(presenter.socials || {}).filter(([, url]) => !!url);

  return (
    <ScreenContainer edges={['top']} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerWrap}>
        {presenter.photo_url ? (
          <Image source={{ uri: presenter.photo_url }} style={styles.headerImage} transition={200} />
        ) : (
          <View style={[styles.headerImage, styles.headerPlaceholder, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="account" size={72} color={colors.primary} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.scrim}
        />
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.name}>{presenter.full_name}</Text>
          {!!presenter.role_title && <Text style={styles.role}>{presenter.role_title}</Text>}
        </View>
      </View>

      {socials.length > 0 && (
        <View style={styles.socialRow}>
          {socials.map(([platform, url]) => (
            <Pressable
              key={platform}
              onPress={() => Linking.openURL(url as string)}
              style={[styles.socialButton, { backgroundColor: colors.surfaceVariant }]}
            >
              <MaterialCommunityIcons
                name={SOCIAL_ICONS[platform] ?? 'web'}
                size={20}
                color={colors.primary}
              />
            </Pressable>
          ))}
        </View>
      )}

      {(presenter.email || presenter.phone) && (
        <View style={styles.contactRow}>
          {presenter.email && (
            <Pressable onPress={() => Linking.openURL(`mailto:${presenter.email}`)} style={styles.contactItem}>
              <MaterialCommunityIcons name="email-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.contactText, { color: colors.textSecondary }]}>{presenter.email}</Text>
            </Pressable>
          )}
          {presenter.phone && (
            <Pressable onPress={() => Linking.openURL(`tel:${presenter.phone}`)} style={styles.contactItem}>
              <MaterialCommunityIcons name="phone-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.contactText, { color: colors.textSecondary }]}>{presenter.phone}</Text>
            </Pressable>
          )}
        </View>
      )}

      {!!presenter.bio && (
        <View style={styles.bioWrap}>
          <Text style={[typeStyles.body, { color: colors.textSecondary }]}>{presenter.bio}</Text>
        </View>
      )}

      {!!presenter.programs?.length && (
        <>
          <SectionHeader title={t('presenters.detail.programsHosted')} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={presenter.programs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalListPad}
            ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            renderItem={({ item }) => (
              <ProgramCard program={item} onPress={() => navigation.navigate('ProgramDetail', { idOrSlug: item.slug })} />
            )}
          />
        </>
      )}

      {!!presenter.podcasts?.length && (
        <>
          <SectionHeader title={t('tabs.podcasts')} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={presenter.podcasts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalListPad}
            ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            renderItem={({ item }) => (
              <PodcastCard
                podcast={item}
                onPress={() => (navigation as any).navigate('PodcastDetail', { idOrSlug: item.slug })}
              />
            )}
          />
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: BOTTOM_INSET },
  backRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  headerWrap: { width: '100%', aspectRatio: 1.1, position: 'relative', marginBottom: spacing.lg },
  headerImage: { width: '100%', height: '100%' },
  headerPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  backButton: {
    position: 'absolute', top: spacing.md, left: spacing.lg, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  headerText: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
  name: { color: '#FFFFFF', fontFamily: fontFamily.headingBold, fontSize: fontSize.xxl },
  role: { color: 'rgba(255,255,255,0.85)', fontFamily: fontFamily.bodyMedium, fontSize: fontSize.base, marginTop: 2 },

  socialRow: {
    flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  socialButton: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },

  contactRow: { paddingHorizontal: spacing.lg, gap: spacing.xs, marginBottom: spacing.md },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  contactText: { fontFamily: fontFamily.body, fontSize: fontSize.sm },

  bioWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },

  horizontalListPad: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});

export default PresenterDetailScreen;
