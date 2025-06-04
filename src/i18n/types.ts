import { ImageSourcePropType } from 'react-native';

type EN = 'en-US';
type JP = 'ja-JP';
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
  code: LANGUAGE_CODE;
  resource: any;
  short: string;
  flag: ImageSourcePropType;
};

export type SUPPORTED_LOCALES = SUPPORTED_LOCALE[];
