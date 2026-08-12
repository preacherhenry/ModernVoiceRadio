/**
 * Modern Voice FM (MV 99.5 FM) brand palette — sourced directly from the official
 * station logo (mobile/uploads/Logo.png). Primary: steel blue (the "MV" lettering).
 * Accent: crimson red (the "99.5FM" wordmark). Secondary: gold (the lightning bolt).
 * Navy: the microphone mark, used to tint the dark-mode background.
 */

export const brand = {
  blue: '#336293',
  blueDeep: '#1F487C',
  navy: '#13213D',
  red: '#B80818',
  gold: '#F6CB14',
} as const;

export const gradients = {
  primary: ['#336293', '#1F487C'] as const,
  primarySubtle: ['#33629333', '#1F487C33'] as const,
  live: ['#B80818', '#F6CB14'] as const,
  ocean: ['#336293', '#13213D'] as const,
  duskBackground: ['#0A1220', '#101B30', '#152342'] as const,
  dawnBackground: ['#F7FAFD', '#EFF4FA', '#E9F1FA'] as const,
  glass: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)'] as const,
};

export interface ThemeColors {
  mode: 'dark' | 'light';
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  border: string;
  glassFill: string;
  glassBorder: string;
  /** Near-opaque frosted fill for surfaces that must stay legible over any content
   *  (the mini player, popup ad card) — used directly on Android, where BlurView is
   *  unreliable, and layered over the blur on iOS to cut its transparency. */
  glassFillStrong: string;
  glassTintStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryContainer: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  live: string;
  onPrimary: string;
  tabBarBackground: string;
  overlay: string;
}

export const darkColors: ThemeColors = {
  mode: 'dark',
  background: '#0A1220',
  backgroundElevated: '#0F1B30',
  surface: '#111E33',
  surfaceVariant: '#16233C',
  card: '#131F37',
  border: '#22314D',
  glassFill: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassFillStrong: 'rgba(19,31,55,0.94)',
  glassTintStrong: 'rgba(19,31,55,0.55)',
  textPrimary: '#F2F5FA',
  textSecondary: '#AEB9CC',
  textMuted: '#7C8AA3',
  primary: brand.blue,
  primaryContainer: '#1B3A5C',
  secondary: brand.gold,
  accent: brand.red,
  success: '#22C55E',
  warning: brand.gold,
  error: brand.red,
  live: brand.red,
  onPrimary: '#FFFFFF',
  tabBarBackground: 'rgba(15,27,48,0.92)',
  overlay: 'rgba(5,10,20,0.65)',
};

export const lightColors: ThemeColors = {
  mode: 'light',
  background: '#F7FAFD',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#EAF0F8',
  card: '#FFFFFF',
  border: '#DCE4F0',
  glassFill: 'rgba(51,98,147,0.06)',
  glassBorder: 'rgba(51,98,147,0.12)',
  glassFillStrong: 'rgba(255,255,255,0.96)',
  glassTintStrong: 'rgba(255,255,255,0.6)',
  textPrimary: '#12203A',
  textSecondary: '#4C5A73',
  textMuted: '#8592A8',
  primary: brand.blue,
  primaryContainer: '#DCE9F7',
  secondary: '#A67C00',
  accent: brand.red,
  success: '#16A34A',
  warning: '#A66A00',
  error: brand.red,
  live: brand.red,
  onPrimary: '#FFFFFF',
  tabBarBackground: 'rgba(255,255,255,0.92)',
  overlay: 'rgba(15,30,50,0.45)',
};
