import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { darkColors, lightColors, brand } from '@constants/colors';
import { fontFamily } from '@constants/typography';

const baseFonts = {
  ...MD3DarkTheme.fonts,
  displayLarge: { ...MD3DarkTheme.fonts.displayLarge, fontFamily: fontFamily.headingBold },
  displayMedium: { ...MD3DarkTheme.fonts.displayMedium, fontFamily: fontFamily.headingBold },
  displaySmall: { ...MD3DarkTheme.fonts.displaySmall, fontFamily: fontFamily.headingBold },
  headlineLarge: { ...MD3DarkTheme.fonts.headlineLarge, fontFamily: fontFamily.headingBold },
  headlineMedium: { ...MD3DarkTheme.fonts.headlineMedium, fontFamily: fontFamily.headingSemiBold },
  headlineSmall: { ...MD3DarkTheme.fonts.headlineSmall, fontFamily: fontFamily.headingSemiBold },
  titleLarge: { ...MD3DarkTheme.fonts.titleLarge, fontFamily: fontFamily.headingSemiBold },
  titleMedium: { ...MD3DarkTheme.fonts.titleMedium, fontFamily: fontFamily.headingMedium },
  titleSmall: { ...MD3DarkTheme.fonts.titleSmall, fontFamily: fontFamily.headingMedium },
  labelLarge: { ...MD3DarkTheme.fonts.labelLarge, fontFamily: fontFamily.bodySemiBold },
  labelMedium: { ...MD3DarkTheme.fonts.labelMedium, fontFamily: fontFamily.bodySemiBold },
  labelSmall: { ...MD3DarkTheme.fonts.labelSmall, fontFamily: fontFamily.bodySemiBold },
  bodyLarge: { ...MD3DarkTheme.fonts.bodyLarge, fontFamily: fontFamily.body },
  bodyMedium: { ...MD3DarkTheme.fonts.bodyMedium, fontFamily: fontFamily.body },
  bodySmall: { ...MD3DarkTheme.fonts.bodySmall, fontFamily: fontFamily.body },
};

export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  dark: true,
  roundness: 16,
  fonts: baseFonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    onPrimary: darkColors.onPrimary,
    primaryContainer: darkColors.primaryContainer,
    secondary: darkColors.secondary,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceVariant,
    onSurface: darkColors.textPrimary,
    onSurfaceVariant: darkColors.textSecondary,
    outline: darkColors.border,
    error: darkColors.error,
    elevation: {
      level0: 'transparent',
      level1: darkColors.backgroundElevated,
      level2: darkColors.surface,
      level3: darkColors.card,
      level4: darkColors.card,
      level5: darkColors.surfaceVariant,
    },
  },
};

export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  dark: false,
  roundness: 16,
  fonts: baseFonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    onPrimary: lightColors.onPrimary,
    primaryContainer: lightColors.primaryContainer,
    secondary: lightColors.secondary,
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: lightColors.surfaceVariant,
    onSurface: lightColors.textPrimary,
    onSurfaceVariant: lightColors.textSecondary,
    outline: lightColors.border,
    error: lightColors.error,
    elevation: {
      level0: 'transparent',
      level1: lightColors.backgroundElevated,
      level2: lightColors.surface,
      level3: lightColors.card,
      level4: lightColors.card,
      level5: lightColors.surfaceVariant,
    },
  },
};

export const brandColors = brand;
