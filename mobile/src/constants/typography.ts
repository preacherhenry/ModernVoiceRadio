/**
 * Type scale. Headings use Poppins (geometric, confident — good for a broadcast brand),
 * body copy uses Inter (highly legible at small sizes). Both loaded via expo-font in App.tsx.
 */
export const fontFamily = {
  headingBold: 'Poppins_700Bold',
  headingSemiBold: 'Poppins_600SemiBold',
  headingMedium: 'Poppins_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 36,
} as const;

export const lineHeight = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.7,
} as const;

export const typeStyles = {
  display: { fontFamily: fontFamily.headingBold, fontSize: fontSize.display, lineHeight: fontSize.display * lineHeight.tight },
  h1: { fontFamily: fontFamily.headingBold, fontSize: fontSize.xxl, lineHeight: fontSize.xxl * lineHeight.tight },
  h2: { fontFamily: fontFamily.headingSemiBold, fontSize: fontSize.xl, lineHeight: fontSize.xl * lineHeight.snug },
  h3: { fontFamily: fontFamily.headingSemiBold, fontSize: fontSize.lg, lineHeight: fontSize.lg * lineHeight.snug },
  h4: { fontFamily: fontFamily.headingMedium, fontSize: fontSize.md, lineHeight: fontSize.md * lineHeight.snug },
  bodyLarge: { fontFamily: fontFamily.body, fontSize: fontSize.md, lineHeight: fontSize.md * lineHeight.normal },
  body: { fontFamily: fontFamily.body, fontSize: fontSize.base, lineHeight: fontSize.base * lineHeight.normal },
  bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.base, lineHeight: fontSize.base * lineHeight.normal },
  caption: { fontFamily: fontFamily.body, fontSize: fontSize.sm, lineHeight: fontSize.sm * lineHeight.normal },
  label: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs, lineHeight: fontSize.xs * lineHeight.normal, letterSpacing: 0.4 },
} as const;
