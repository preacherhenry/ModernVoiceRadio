import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PodcastsStackParamList } from './types';
import PodcastsScreen from '@screens/Podcasts/PodcastsScreen';
import PodcastDetailScreen from '@screens/Podcasts/PodcastDetailScreen';
import PresenterDetailScreen from '@screens/Presenters/PresenterDetailScreen';

const Stack = createNativeStackNavigator<PodcastsStackParamList>();

const PodcastsStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PodcastsMain" component={PodcastsScreen} />
    <Stack.Screen name="PodcastDetail" component={PodcastDetailScreen} />
    <Stack.Screen name="PresenterDetail" component={PresenterDetailScreen} />
  </Stack.Navigator>
);

export default PodcastsStackNavigator;
