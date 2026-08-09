import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import SplashScreen from '@screens/SplashScreen';
import OnboardingScreen from '@screens/Onboarding/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import NowPlayingScreen from '@screens/Player/NowPlayingScreen';
import SearchScreen from '@screens/Search/SearchScreen';
import InterstitialAdScreen from '@screens/Interstitial/InterstitialAdScreen';
import AdvertisementDetailsScreen from '@screens/Interstitial/AdvertisementDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Splash/Onboarding/Auth gate the app; Main hosts the 5-tab shell. NowPlaying and Search
 * are presented as full-screen modals reachable from anywhere (mini player, search icon).
 */
const RootNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Auth" component={AuthNavigator} />
    <Stack.Screen name="Interstitial" component={InterstitialAdScreen} />
    <Stack.Screen name="AdvertisementDetails" component={AdvertisementDetailsScreen} />
    <Stack.Screen name="Main" component={MainTabNavigator} />
    <Stack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
      <Stack.Screen name="NowPlaying" component={NowPlayingScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Group>
  </Stack.Navigator>
);

export default RootNavigator;
