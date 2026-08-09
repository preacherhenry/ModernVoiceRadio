import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ny from './locales/ny.json';
import toi from './locales/toi.json';
import sn from './locales/sn.json';

export const SUPPORTED_LANGUAGES = ['en', 'ny', 'toi', 'sn'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const resources = {
  en: { translation: en },
  ny: { translation: ny },
  toi: { translation: toi },
  sn: { translation: sn },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
