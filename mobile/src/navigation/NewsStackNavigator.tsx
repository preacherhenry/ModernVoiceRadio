import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NewsStackParamList } from './types';
import NewsScreen from '@screens/News/NewsScreen';
import NewsDetailScreen from '@screens/News/NewsDetailScreen';

const Stack = createNativeStackNavigator<NewsStackParamList>();

/**
 * News as a top-level tab. The same screens stay registered in the Home stack as well,
 * so a headline tapped on Home opens in place and backs out to Home — rather than
 * throwing the user into another tab mid-read.
 */
const NewsStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NewsMain" component={NewsScreen} />
    <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
  </Stack.Navigator>
);

export default NewsStackNavigator;
