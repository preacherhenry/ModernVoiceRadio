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
import ScheduleStackNavigator from './ScheduleStackNavigator';
import PodcastsStackNavigator from './PodcastsStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import MiniPlayer from '@components/player/MiniPlayer';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  HomeTab: 'home-variant',
  LiveTab: 'radio-tower',
  ScheduleTab: 'calendar-clock',
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
    ScheduleTab: t('tabs.schedule'),
    PodcastsTab: t('tabs.podcasts'),
    ProfileTab: t('tabs.profile'),
  };

  return (
    <View style={styles.flex}>
      <Tab.Navigator
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
        <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
        <Tab.Screen name="LiveTab" component={LiveStackNavigator} />
        <Tab.Screen name="ScheduleTab" component={ScheduleStackNavigator} />
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
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: 8,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
  miniPlayerSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 90 : 70,
  },
});

export default MainTabNavigator;
