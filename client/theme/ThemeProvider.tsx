import React, { useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UnistylesRuntime } from 'react-native-unistyles';
import { View } from 'react-native';
import { ThemeContext, ThemeContextType } from './ThemeContext';
import { THEME_NAME, THEME_NAMES } from './types';

const THEME_STORAGE_KEY = 'user-theme-mode';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const setTheme = useCallback(async (newTheme: THEME_NAME) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);

      if (newTheme) {
        // disable adaptive themes
        UnistylesRuntime.setAdaptiveThemes(false);
        // set theme
        UnistylesRuntime.setTheme(newTheme);
      }
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  const loadTheme = useCallback(async () => {
    try {
      const selectedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (selectedTheme && Object.values(THEME_NAMES).includes(selectedTheme as THEME_NAME)) {
        UnistylesRuntime.setAdaptiveThemes(false);
        UnistylesRuntime.setTheme(selectedTheme as THEME_NAME);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  const contextValue = useMemo(() => ({ setTheme }), [setTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <View style={{ flex: 1 }}>{children}</View>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
