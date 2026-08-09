/** Shares the same brand language as the mobile app, sourced from the official MV 99.5 FM logo. */
export const brand = {
  blue: '#336293',
  blueDeep: '#1F487C',
  navy: '#13213D',
  red: '#B80818',
  gold: '#F6CB14',
};

export const darkPalette = {
  mode: 'dark' as const,
  background: { default: '#0A1220', paper: '#111E33' },
  primary: { main: brand.blue, contrastText: '#FFFFFF' },
  secondary: { main: brand.gold },
  error: { main: brand.red },
  warning: { main: brand.gold },
  success: { main: '#22C55E' },
  text: { primary: '#F2F5FA', secondary: '#AEB9CC' },
  divider: '#22314D',
};

export const lightPalette = {
  mode: 'light' as const,
  background: { default: '#F7FAFD', paper: '#FFFFFF' },
  primary: { main: brand.blue, contrastText: '#FFFFFF' },
  secondary: { main: '#A67C00' },
  error: { main: brand.red },
  warning: { main: '#A66A00' },
  success: { main: '#16A34A' },
  text: { primary: '#12203A', secondary: '#4C5A73' },
  divider: '#DCE4F0',
};
