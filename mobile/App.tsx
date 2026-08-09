import 'react-native-gesture-handler';
import '@i18n/index';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as SplashScreenModule from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

import { store, persistor } from '@redux/store';
import I18nSync from '@i18n/I18nSync';
import {
  restoreSession, sessionRestored, signedOut, clearPersistedTokens,
} from '@redux/slices/authSlice';
import { authApi } from '@redux/api/authApi';
import { ThemeProvider, useAppTheme } from '@theme/ThemeProvider';
import RootNavigator from '@navigation/RootNavigator';
import { setupAudioPlayer } from '@services/audioPlayerService';
import { initPushNotifications } from '@services/pushNotificationService';

SplashScreenModule.preventAutoHideAsync().catch(() => {});

const AppShell: React.FC = () => {
  const { navTheme, colors } = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.mode === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
  });
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    (async () => {
      const restored = await store.dispatch(restoreSession()).unwrap();
      if (restored.accessToken && restored.refreshToken) {
        try {
          const me = await store.dispatch(authApi.endpoints.getMe.initiate()).unwrap();
          store.dispatch(sessionRestored(me.data));
        } catch {
          // Stored tokens are stale/invalid — fall back to a clean guest session.
          store.dispatch(signedOut());
          await clearPersistedTokens();
        }
      }
      await setupAudioPlayer().catch(() => {});
      await initPushNotifications().catch(() => {});
      setBootstrapped(true);
    })();
  }, []);

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded && bootstrapped) {
      await SplashScreenModule.hideAsync();
    }
  }, [fontsLoaded, bootstrapped]);

  useEffect(() => {
    void onLayoutReady();
  }, [onLayoutReady]);

  if (!fontsLoaded || !bootstrapped) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <I18nSync />
            <ThemeProvider>
              <AppShell />
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
