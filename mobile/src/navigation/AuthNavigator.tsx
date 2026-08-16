import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import LoginScreen from '@screens/Auth/LoginScreen';
import RegisterScreen from '@screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@screens/Auth/ResetPasswordScreen';
import TermsScreen from '@screens/Settings/TermsScreen';
import PrivacyPolicyScreen from '@screens/Settings/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    {/* Public: readable without an account, which is the point of showing them here. */}
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
