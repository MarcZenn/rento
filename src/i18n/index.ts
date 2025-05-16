import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translationEn from './locales/en-US/translations.json';
import translationJa from './locales/ja-JP/translations.json';
import { supportedLanguages } from './supportedLanguages';
import { useTranslate } from './useTranslate';

const { english, japanese } = supportedLanguages;

const resources = {
  [english]: {
    translation: translationEn,
  },
  en: {
    translation: translationEn,
  },
  [japanese]: {
    translation: translationJa,
  },
  ja: {
    translation: translationJa,
  },
};

export const LANGUAGE_KEY = '@rento_language';

const initI18n = async () => {
  try {
    // Try to get saved language preference
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    // Determine which language to use
    let selectedLanguage = savedLanguage;

    console.log(english, 'wtf');

    if (!selectedLanguage) {
      // If no saved language, use device locale or fallback
      const deviceLocales = getLocales();
      const deviceLocale = deviceLocales[0]?.languageTag || english;
      const languageCode = deviceLocale.split('-')[0];

      // Try exact locale match first
      if (deviceLocale in resources) {
        selectedLanguage = deviceLocale;
      }

      // Then try language code match
      else if (languageCode in resources) {
        selectedLanguage = languageCode;
      } else {
        selectedLanguage = english; // fallback
      }
    }

    await i18n.use(initReactI18next).init({
      resources,
      lng: selectedLanguage,
      fallbackLng: {
        'en-*': [english, 'en'],
        'ja-*': [japanese, 'ja', english],
        default: [english],
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

    // Save the selected language
    if (!savedLanguage) {
      await AsyncStorage.setItem(LANGUAGE_KEY, selectedLanguage);
    }
  } catch (error) {
    console.error('Error initializing i18n:', error);

    // Initialize with defaults if there's an error
    await i18n.use(initReactI18next).init({
      resources,
      lng: english,
      fallbackLng: english,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  }
};

initI18n();

export { supportedLanguages, useTranslate };
export default i18n;
