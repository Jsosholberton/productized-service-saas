import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './locales/es.json';
import en from './locales/en.json';

const detectedLanguage = LanguageDetector.detect();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'es',
    lng: detectedLanguage || 'es',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'localStorage', 'sessionStorage'],
      caches: ['localStorage', 'sessionStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
