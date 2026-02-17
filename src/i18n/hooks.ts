import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Custom hook to access translation and language utilities
 * Provides convenience methods for common i18n operations
 */
export function useI18n() {
  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);
      localStorage.setItem('i18n-language', lng);
    },
    [i18n]
  );

  const getCurrentLanguage = useCallback(() => {
    return i18n.language;
  }, [i18n]);

  const isSpanish = useCallback(() => {
    return i18n.language.startsWith('es');
  }, [i18n]);

  const isEnglish = useCallback(() => {
    return i18n.language.startsWith('en');
  }, [i18n]);

  const getLanguageName = useCallback((lng: string) => {
    const languageNames: Record<string, string> = {
      es: t('common.spanish'),
      en: t('common.english'),
    };
    return languageNames[lng] || lng;
  }, [t]);

  return {
    t,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    isSpanish,
    isEnglish,
    getLanguageName,
  };
}

/**
 * Hook to get the language code
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  return i18n.language;
}

/**
 * Hook to check if a language is active
 */
export function useIsLanguage(lng: string) {
  const { i18n } = useTranslation();
  return i18n.language.startsWith(lng);
}
