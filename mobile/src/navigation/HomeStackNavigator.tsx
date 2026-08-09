import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';
import HomeScreen from '@screens/Home/HomeScreen';
import ProgramDetailScreen from '@screens/Programs/ProgramDetailScreen';
import PresenterDetailScreen from '@screens/Presenters/PresenterDetailScreen';
import NewsScreen from '@screens/News/NewsScreen';
import NewsDetailScreen from '@screens/News/NewsDetailScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
    <Stack.Screen name="PresenterDetail" component={PresenterDetailScreen} />
    <Stack.Screen name="NewsMain" component={NewsScreen} />
    <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
  </Stack.Navigator>
);

export default HomeStackNavigator;
