import { useCallback } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translationEn from './locales/en-US/translations.json';
import translationJa from './locales/ja-JP/translations.json';
import { SUPPORTED_LOCALES, LANGUAGE_CODE } from './types';
import { images } from '@/client/constants/images';

const supported_locales: SUPPORTED_LOCALES = [
  {
    locale: 'Japan',
    lang: 'japanese',
    ISO639_code: 'ja',
    resource: translationJa,
    flag: images.flags.japan,
  },
  {
    locale: 'USA',
    lang: 'english',
    ISO639_code: 'en',
    resource: translationEn,
    flag: images.flags.uk,
  },
];

const getTranslationResources = () => {
  let resources: any = {};

  supported_locales.forEach(value => {
    resources[value.ISO639_code] = { translation: value.resource };
  });

  return resources;
};

// const resources = {
//   ['en-US']: {
//     translation: translationEn,
//   },
//   en: {
//     translation: translationEn,
//   },
//   ['ja-JP']: {
//     translation: translationJa,
//   },
//   ja: {
//     translation: translationJa,
//   },
// };

export const LANGUAGE_KEY = '@rento_language';

const defaultLang = 'en';

const initI18n = async () => {
  const resources = getTranslationResources();

  try {
    // Try to get saved language preference
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    // Determine which language to use
    let selectedLanguage = savedLanguage;

    if (!selectedLanguage) {
      // If no saved language, use device locale or fallback
      const deviceLocales = getLocales();
      const deviceLocale = deviceLocales[0]?.languageTag || defaultLang;
      const languageCode = deviceLocale.split('-')[0];

      // Try exact locale match first
      if (deviceLocale in resources) {
        selectedLanguage = deviceLocale;
      }

      // Then try language code match
      else if (languageCode in resources) {
        selectedLanguage = languageCode;
      } else {
        selectedLanguage = defaultLang; // fallback
      }
    }

    await i18n.use(initReactI18next).init({
      resources,
      lng: selectedLanguage,
      fallbackLng: {
        en: [defaultLang, 'en'],
        // 'en-*': [defaultLang, 'en'],
        // 'ja-*': [japanese.code, 'ja', defaultLang],
        default: [defaultLang],
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
      lng: defaultLang,
      fallbackLng: defaultLang,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  }
};

const useTranslate = () => {
  const changeLanguage = useCallback(async (language: LANGUAGE_CODE) => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, []);

  return changeLanguage;
};

initI18n();

export { supported_locales, useTranslate };
export default i18n;
