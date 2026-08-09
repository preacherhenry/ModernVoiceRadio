import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ScheduleStackParamList } from './types';
import ScheduleScreen from '@screens/Schedule/ScheduleScreen';
import ProgramDetailScreen from '@screens/Programs/ProgramDetailScreen';
import PresenterDetailScreen from '@screens/Presenters/PresenterDetailScreen';

const Stack = createNativeStackNavigator<ScheduleStackParamList>();

const ScheduleStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ScheduleMain" component={ScheduleScreen} />
    <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
    <Stack.Screen name="PresenterDetail" component={PresenterDetailScreen} />
  </Stack.Navigator>
);

export default ScheduleStackNavigator;
