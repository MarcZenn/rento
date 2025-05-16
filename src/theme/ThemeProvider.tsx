import React, { useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UnistylesRuntime } from 'react-native-unistyles';
import { View } from 'react-native';
import { ThemeContext, ThemeContextType } from './ThemeContext';
import { THEME_NAME, THEME_NAMES } from './types';

const THEME_STORAGE_KEY = 'user-theme-mode';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const setTheme = async (newTheme: THEME_NAME) => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);

    if (newTheme) {
      // disable adaptive themes
      UnistylesRuntime.setAdaptiveThemes(false);

      // set theme
      UnistylesRuntime.setTheme(newTheme);
    }
  };

  const loadTheme = async () => {
    // get preferred theme
    const selectedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

    // determine which theme to use
    if (selectedTheme && Object.values(THEME_NAMES).includes(selectedTheme as THEME_NAME)) {
      // disable adaptive themes
      UnistylesRuntime.setAdaptiveThemes(false);

      // set theme again
      UnistylesRuntime.setTheme(selectedTheme as THEME_NAME);
    }

    // unistyles will default to system theme automatically if none saved.
  };

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ setTheme }}>
      <View style={{ flex: 1 }}>{children}</View>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
