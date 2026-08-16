import 'react-native-gesture-handler';
import '@i18n/index';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, type NavigationState } from '@react-navigation/native';
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
import PlaybackAuthGuard from '@components/common/PlaybackAuthGuard';
import {
  restoreSession, sessionRestored, signedOut, clearPersistedTokens,
} from '@redux/slices/authSlice';
import { authApi } from '@redux/api/authApi';
import { ThemeProvider, useAppTheme } from '@theme/ThemeProvider';
import RootNavigator from '@navigation/RootNavigator';
import { setupAudioPlayer, blockPlayback, allowPlayback } from '@services/audioPlayerService';
import { initPushNotifications } from '@services/pushNotificationService';
import { onAdvertisementsChanged } from '@services/chatSocketService';
import { advertisementsApi } from '@redux/api/advertisementsApi';

SplashScreenModule.preventAutoHideAsync().catch(() => {});

const AppShell: React.FC = () => {
  const { navTheme, colors } = useAppTheme();

  /**
   * Silences the radio whenever the user is sitting on an authentication screen, and
   * re-enables playback once they leave. This covers arriving there by any route —
   * logging out, being redirected after a session expires, or simply tapping "Sign in"
   * from the profile screen while the stream is playing.
   *
   * Playback is only *allowed* again on leaving, never started: the user restarts the
   * radio themselves from the player.
   */
  const onNavigationStateChange = useCallback((state: NavigationState | undefined) => {
    if (!state) return;
    const activeRoute = state.routes[state.index]?.name;
    if (activeRoute === 'Auth') void blockPlayback();
    else allowPlayback();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.mode === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme} onStateChange={onNavigationStateChange}>
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

  // Advert changes made in the admin dashboard land immediately, wherever the user is:
  // dropping the Advertisement tag makes RTK Query refetch every mounted ad query (home
  // banner carousel, news inline, interstitial), which re-runs the server's placement and
  // date filtering rather than guessing at it here.
  useEffect(() => {
    const unsubscribe = onAdvertisementsChanged(() => {
      store.dispatch(advertisementsApi.util.invalidateTags([{ type: 'Advertisement', id: 'LIST' }]));
    });
    return unsubscribe;
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
            <PlaybackAuthGuard />
            <ThemeProvider>
              <AppShell />
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
