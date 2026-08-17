import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { MainTabParamList } from './types';
import { useAppTheme } from '@theme/ThemeProvider';
import HomeStackNavigator from './HomeStackNavigator';
import LiveStackNavigator from './LiveStackNavigator';
import NewsStackNavigator from './NewsStackNavigator';
import PodcastsStackNavigator from './PodcastsStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import MiniPlayer from '@components/player/MiniPlayer';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  HomeTab: 'home-variant',
  LiveTab: 'radio-tower',
  NewsTab: 'newspaper-variant-outline',
  PodcastsTab: 'podcast',
  ProfileTab: 'account-circle',
};

/**
 * Bottom tabs + a persistent MiniPlayer overlay. The MiniPlayer is rendered here (not
 * per-screen) so it survives tab switches and only unmounts when playback truly stops.
 */
const MainTabNavigator: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const LABELS: Record<keyof MainTabParamList, string> = {
    HomeTab: t('tabs.home'),
    LiveTab: t('tabs.live'),
    NewsTab: t('tabs.news'),
    PodcastsTab: t('tabs.podcasts'),
    ProfileTab: t('tabs.profile'),
  };

  return (
    <View style={styles.flex}>
      <Tab.Navigator
        // News is declared first (far-left position), which would otherwise make it the
        // landing tab — the app must always open on Home regardless of tab order.
        initialRouteName="HomeTab"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => (
            Platform.OS === 'ios' ? (
              <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBarBackground }]} />
            )
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name={ICONS[route.name as keyof MainTabParamList]} color={color} size={size} />
          ),
          tabBarLabel: LABELS[route.name as keyof MainTabParamList],
        })}
      >
        {/* Order is deliberate: Home sits dead centre (3rd of 5), the easiest slot to
            reach with a thumb. */}
        <Tab.Screen name="NewsTab" component={NewsStackNavigator} />
        <Tab.Screen name="LiveTab" component={LiveStackNavigator} />
        <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
        <Tab.Screen name="PodcastsTab" component={PodcastsStackNavigator} />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackNavigator}
          listeners={({ navigation }) => ({
            // Cross-tab shortcuts (e.g. the Home bell icon jumping into
            // ProfileTab > Notifications) leave that screen on top of this
            // tab's stack, which React Navigation preserves across tab
            // switches. Pressing the Profile tab button directly should
            // always land on ProfileMain, not wherever a shortcut left off.
            tabPress: (e) => {
              e.preventDefault();
              navigation.dispatch(
                CommonActions.navigate({ name: 'ProfileTab', params: { screen: 'ProfileMain' } }),
              );
            },
          })}
        />
      </Tab.Navigator>
      <View pointerEvents="box-none" style={styles.miniPlayerSlot}>
        <MiniPlayer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  miniPlayerSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Sits just above the tab bar (whose height changed above) with a small gap.
    bottom: Platform.OS === 'ios' ? 94 : 76,
  },
});

export default MainTabNavigator;
