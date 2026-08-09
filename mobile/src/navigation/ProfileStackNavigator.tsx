import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from './types';
import ProfileScreen from '@screens/Profile/ProfileScreen';
import EditProfileScreen from '@screens/Profile/EditProfileScreen';
import FavoritesScreen from '@screens/Profile/FavoritesScreen';
import ListeningHistoryScreen from '@screens/Profile/ListeningHistoryScreen';
import DownloadsScreen from '@screens/Profile/DownloadsScreen';
import SettingsScreen from '@screens/Settings/SettingsScreen';
import LanguageSettingsScreen from '@screens/Settings/LanguageSettingsScreen';
import AudioQualitySettingsScreen from '@screens/Settings/AudioQualitySettingsScreen';
import EqualizerScreen from '@screens/Settings/EqualizerScreen';
import PrivacyPolicyScreen from '@screens/Settings/PrivacyPolicyScreen';
import TermsScreen from '@screens/Settings/TermsScreen';
import AboutScreen from '@screens/Settings/AboutScreen';
import NotificationsScreen from '@screens/Notifications/NotificationsScreen';
import PresentersScreen from '@screens/Presenters/PresentersScreen';
import PresenterDetailScreen from '@screens/Presenters/PresenterDetailScreen';
import GalleryScreen from '@screens/Gallery/GalleryScreen';
import SongRequestScreen from '@screens/SongRequest/SongRequestScreen';
import ContactScreen from '@screens/Contact/ContactScreen';
import LiveChatScreen from '@screens/Chat/LiveChatScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/**
 * The Profile tab doubles as the app's "More" hub (mirrors the Home/Live/Schedule/
 * Podcasts/Profile 5-tab layout used by BBC Sounds & TuneIn) — Presenters, Gallery,
 * Song Requests, Contact and Live Chat are all reached from here rather than crowding
 * the bottom tab bar with a 6th/7th icon.
 */
const ProfileStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} />
    <Stack.Screen name="ListeningHistory" component={ListeningHistoryScreen} />
    <Stack.Screen name="Downloads" component={DownloadsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
    <Stack.Screen name="AudioQualitySettings" component={AudioQualitySettingsScreen} />
    <Stack.Screen name="Equalizer" component={EqualizerScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Presenters" component={PresentersScreen} />
    <Stack.Screen name="PresenterDetail" component={PresenterDetailScreen} />
    <Stack.Screen name="Gallery" component={GalleryScreen} />
    <Stack.Screen name="SongRequest" component={SongRequestScreen} />
    <Stack.Screen name="Contact" component={ContactScreen} />
    <Stack.Screen name="LiveChat" component={LiveChatScreen} />
  </Stack.Navigator>
);

export default ProfileStackNavigator;
