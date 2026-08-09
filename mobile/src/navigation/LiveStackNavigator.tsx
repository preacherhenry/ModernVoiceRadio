import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { LiveStackParamList } from './types';
import LiveRadioScreen from '@screens/Live/LiveRadioScreen';

const Stack = createNativeStackNavigator<LiveStackParamList>();

const LiveStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LiveRadio" component={LiveRadioScreen} />
  </Stack.Navigator>
);

export default LiveStackNavigator;
