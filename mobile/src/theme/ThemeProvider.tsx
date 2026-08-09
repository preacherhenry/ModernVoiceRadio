import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, type Theme as NavTheme } from '@react-navigation/native';
import { useAppSelector } from '@redux/hooks';
import { paperDarkTheme, paperLightTheme } from './paperTheme';
import { darkColors, lightColors, type ThemeColors } from '@constants/colors';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  navTheme: NavTheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  isDark: true,
  navTheme: NavDarkTheme,
});

/** Access resolved brand colors + dark/light flag + the matching React Navigation theme. */
export const useAppTheme = () => useContext(ThemeContext);

/**
 * Resolves the effective theme from the user's stored preference ('dark' | 'light' | 'system')
 * and provides it to react-native-paper, React Navigation, and our own useAppTheme() hook
 * (used by custom components for gradients/glassmorphism that Paper doesn't cover).
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const preference = useAppSelector((state) => state.settings.themePreference);
  const systemScheme = useColorScheme();

  const isDark = preference === 'system' ? systemScheme !== 'light' : preference === 'dark';
  const paperTheme = isDark ? paperDarkTheme : paperLightTheme;
  const colors = isDark ? darkColors : lightColors;

  const navTheme: NavTheme = useMemo(() => ({
    ...(isDark ? NavDarkTheme : NavLightTheme),
    colors: {
      ...(isDark ? NavDarkTheme.colors : NavLightTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.accent,
    },
  }), [isDark, colors]);

  const contextValue = useMemo(() => ({ colors, isDark, navTheme }), [colors, isDark, navTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};
