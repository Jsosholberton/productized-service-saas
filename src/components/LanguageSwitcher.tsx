import React from 'react';
import { useI18n } from '../i18n/hooks';

interface LanguageSwitcherProps {
  /** Optional CSS class name */
  className?: string;
  /** Show as dropdown or button group */
  variant?: 'dropdown' | 'buttons';
}

/**
 * LanguageSwitcher Component
 * Allows users to switch between available languages
 * Automatically detects browser language on first load
 * Persists preference in localStorage
 */
export function LanguageSwitcher({
  className = '',
  variant = 'buttons',
}: LanguageSwitcherProps) {
  const { changeLanguage, getCurrentLanguage, isSpanish, isEnglish, t } =
    useI18n();
  const currentLanguage = getCurrentLanguage();

  if (variant === 'dropdown') {
    return (
      <div className={`language-switcher language-switcher--dropdown ${className}`}>
        <select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          title={t('common.language')}
          className="language-switcher__select"
        >
          <option value="es">{t('common.spanish')}</option>
          <option value="en">{t('common.english')}</option>
        </select>
      </div>
    );
  }

  return (
    <div className={`language-switcher language-switcher--buttons ${className}`}>
      <button
        onClick={() => changeLanguage('es')}
        className={`language-switcher__button ${isSpanish() ? 'language-switcher__button--active' : ''}`}
        title={t('common.spanish')}
        aria-label="Switch to Spanish"
        aria-pressed={isSpanish()}
      >
        🇪🇸 ES
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`language-switcher__button ${isEnglish() ? 'language-switcher__button--active' : ''}`}
        title={t('common.english')}
        aria-label="Switch to English"
        aria-pressed={isEnglish()}
      >
        🇺🇸 EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;
