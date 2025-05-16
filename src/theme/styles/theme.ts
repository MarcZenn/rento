import { THEMES, THEME_NAMES, THEME_COLORS } from '../types';
import { DARK_COLORS, LIGHT_COLORS } from './colors';
import { fontSizes, fonts } from './fonts';

const buildTheme = (colors: THEME_COLORS) => {
  const {
    brand,
    secondaryBrand,
    appBackground,
    card,
    elevatedSurface,
    border,
    headingText,
    bodyText,
    mutedText,
    accentSky,
    accentCoral,
    accentLavender,
    accentSakura,
    accentSumi,
    accentShoji,
    accentMatcha,
  } = colors;

  return {
    brand,
    secondaryBrand,
    appBackground,
    card,
    elevatedSurface,
    border,
    headingText,
    bodyText,
    mutedText,
    accentSky,
    accentCoral,
    accentLavender,
    accentSakura,
    accentSumi,
    accentShoji,
    accentMatcha,
  };
};

const themes: THEMES = {
  lightTheme: {
    name: THEME_NAMES.LIGHT,
    colors: buildTheme(LIGHT_COLORS),
    fonts,
    fontSizes,
    gap: (v: number) => v * 8, // functions, external imports, etc.
  },
  darkTheme: {
    name: THEME_NAMES.DARK,
    colors: buildTheme(DARK_COLORS),
    fonts,
    fontSizes,
    gap: (v: number) => v * 8, // functions, external imports, etc.
  },
};

export const appThemes = {
  light: themes.lightTheme,
  dark: themes.darkTheme,
};
