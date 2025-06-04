export type THEME_NAME = 'light' | 'dark';

export interface FONTS {
  interBlack: string;
  interBold: string;
  interExtraLight: string;
  interLight: string;
  interRegular: string;
  interMedium: string;
  interThin: string;
  notoJpBlack: string;
  notoJpBold: string;
  notoJpExtraBold: string;
  notoJpExtraLight: string;
  notoJpLight: string;
  notoJpMedium: string;
  notoJpRegular: string;
  notoJpThin: string;
}

export const THEME_NAMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export interface THEME_COLORS {
  brand: string;
  secondaryBrand: string;
  appBackground: string;
  card: string;
  elevatedSurface: string;
  border: string;
  headingText: string;
  bodyText: string;
  mutedText: string;
  accentSky: string;
  accentCoral: string;
  accentLavender: string;
  accentSakura: string;
  accentSumi: string;
  accentShoji: string;
  accentMatcha: string;
  error: string;
}

interface THEME {
  name: THEME_NAME;
  colors: THEME_COLORS;
  fonts: FONTS;
  fontSizes: {
    xs: number;
    small: number;
    medium: number;
    large: number;
    xl: number;
    xxl: number;
    xxxl: number;
    xxxxl: number;
  };
  gap: (v: number) => {};
}

export interface THEMES {
  lightTheme: THEME;
  darkTheme: THEME;
}
