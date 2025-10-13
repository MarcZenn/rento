import { ImageSourcePropType } from 'react-native';

type EN = 'en';
type JP = 'ja';
export type LANGUAGE_CODE = EN | JP;

type US = 'USA';
type JA = 'Japan';
type LOCALE = US | JA;

type ENGLISH = 'english';
type JAPANESE = 'japanese';
type LANGUAGE = ENGLISH | JAPANESE;

type SUPPORTED_LOCALE = {
  locale: LOCALE;
  lang: LANGUAGE;
  ISO639_code: LANGUAGE_CODE;
  resource: any;
  flag: ImageSourcePropType;
};

export type SUPPORTED_LOCALES = SUPPORTED_LOCALE[];
