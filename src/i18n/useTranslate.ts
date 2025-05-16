import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { LANGUAGE_KEY } from '@/src/i18n';
import { SUPPORTED_LANGUAGES } from './types';

export const useTranslate = () => {
  const changeLanguage = useCallback(async (language: SUPPORTED_LANGUAGES) => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, []);

  return changeLanguage;
};
