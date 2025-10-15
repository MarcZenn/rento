import React, { createContext } from 'react';
import { THEME_NAME } from './types';

export interface ThemeContextType {
  setTheme: (theme: THEME_NAME) => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
