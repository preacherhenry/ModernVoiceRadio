import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import ComingSoonState from '@components/common/ComingSoonState';

import { useAppTheme } from '@theme/ThemeProvider';
import { spacing } from '@constants/spacing';
import { typeStyles } from '@constants/typography';

/**
 * The podcast library isn't live yet — every seeded episode still points at a
 * placeholder audio file, so browsing/searching would only lead to playback that
 * fails. Until real episodes are published this shows an honest "coming soon"
 * instead. The full browse/search/grid UI lives in git history and can be restored
 * verbatim once the catalogue is real.
 */
const PodcastsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('tabs.podcasts')}</Text>
      </View>

      <ComingSoonState icon="podcast" description={t('comingSoon.podcasts')} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
});

export default PodcastsScreen;
