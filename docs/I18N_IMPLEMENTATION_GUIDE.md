# 🌍 i18n Implementation Guide

## Overview

This application now supports **Spanish (es) and English (en)** with automatic browser language detection. The implementation uses **i18next** and **react-i18next** for robust internationalization.

## Key Features

✅ **Automatic Language Detection** - Detects browser language on first load  
✅ **Language Persistence** - Saves user's language choice to localStorage  
✅ **Easy Switching** - LanguageSwitcher component for manual language selection  
✅ **Complete Translations** - 50+ translation keys across all major sections  
✅ **Dark Mode Support** - CSS handles both light and dark themes  
✅ **Accessibility** - ARIA labels and semantic HTML  
✅ **Responsive Design** - Works on all screen sizes  

## Installation

### 1. Install Dependencies

```bash
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
```

### 2. Project Structure

```
src/
├── i18n/
│   ├── config.ts                 # i18n configuration
│   ├── hooks.ts                  # Custom i18n hooks
│   └── locales/
│       ├── es.json               # Spanish translations
│       └── en.json               # English translations
├── components/
│   └── LanguageSwitcher.tsx       # Language switcher component
├── styles/
│   └── LanguageSwitcher.css       # Language switcher styles
├── main.tsx                       # Entry point with i18n init
└── App.tsx                        # Main app component
```

## Usage Guide

### Basic Translation

#### In React Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <p>{t('messages.welcome')}</p>
    </div>
  );
}
```

#### Using Custom Hook

```tsx
import { useI18n } from '../i18n/hooks';

function MyComponent() {
  const { t, changeLanguage, isSpanish, isEnglish } = useI18n();
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      {isSpanish() && <p>Estás en español</p>}
      {isEnglish() && <p>You are in English</p>}
      <button onClick={() => changeLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

### Language Switcher Component

#### Button Group Variant (Default)

```tsx
import { LanguageSwitcher } from './LanguageSwitcher';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <LanguageSwitcher variant="buttons" />
    </header>
  );
}
```

#### Dropdown Variant

```tsx
<LanguageSwitcher variant="dropdown" className="ml-auto" />
```

### Translation with Interpolation

#### Translation File (es.json)

```json
{
  "messages": {
    "greeting": "¡Hola {{name}}!",
    "itemCount": "Tienes {{count}} elemento",
    "itemCount_plural": "Tienes {{count}} elementos"
  }
}
```

#### Component Usage

```tsx
const { t } = useTranslation();

// Simple interpolation
<p>{t('messages.greeting', { name: 'Juan' })}</p>
// Output: ¡Hola Juan!

// Pluralization
<p>{t('messages.itemCount', { count: 5 })}</p>
// Output: Tienes 5 elementos
```

### Dynamic Language Switching

```tsx
import { useI18n } from '../i18n/hooks';

function LanguageMenu() {
  const { changeLanguage, getCurrentLanguage } = useI18n();
  
  return (
    <select value={getCurrentLanguage()} onChange={(e) => changeLanguage(e.target.value)}>
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>
  );
}
```

## Custom Hooks Reference

### `useI18n()`

Comprehensive hook with all i18n utilities.

```tsx
const {
  t,                        // Translation function
  i18n,                     // i18next instance
  changeLanguage,           // Change current language
  getCurrentLanguage,       // Get current language code
  isSpanish,               // Check if Spanish is active
  isEnglish,               // Check if English is active
  getLanguageName,         // Get display name of language
} = useI18n();
```

### `useLanguage()`

Simple hook to get current language code.

```tsx
const language = useLanguage(); // 'es' or 'en'
```

### `useIsLanguage(lng: string)`

Check if a specific language is active.

```tsx
const isEs = useIsLanguage('es');
const isEn = useIsLanguage('en');
```

## Translation Structure

Both `es.json` and `en.json` follow this structure:

```json
{
  "common": {
    "appName": "Productized Service",
    "language": "Idioma",
    "save": "Guardar",
    ...
  },
  "navigation": { ... },
  "auth": { ... },
  "projects": { ... },
  "quotes": { ... },
  "invoices": { ... },
  "clients": { ... },
  "settings": { ... },
  "tax": { ... },
  "messages": { ... },
  "footer": { ... }
}
```

## Adding New Translations

### Step 1: Add to Translation Files

**src/i18n/locales/es.json:**
```json
{
  "newSection": {
    "newKey": "Nuevo valor en español"
  }
}
```

**src/i18n/locales/en.json:**
```json
{
  "newSection": {
    "newKey": "New value in English"
  }
}
```

### Step 2: Use in Component

```tsx
const { t } = useTranslation();

return <p>{t('newSection.newKey')}</p>;
```

## Language Detection Logic

The application detects language in this order:

1. **Saved Preference** - Checks localStorage for previous selection
2. **Browser Language** - Detects from `navigator.language`
3. **Session Storage** - Checks sessionStorage
4. **Fallback** - Defaults to Spanish ('es')

When user switches language manually, it's saved to localStorage.

## Configuration Details

### src/i18n/config.ts

```typescript
i18n
  .use(LanguageDetector)           // Browser language detection
  .use(initReactI18next)           // React integration
  .init({
    resources: { es, en },         // Available translations
    fallbackLng: 'es',             // Fallback language
    interpolation: {
      escapeValue: false,          // HTML escaping
    },
    detection: {
      order: ['navigator', ...],   // Detection order
      caches: ['localStorage'],    // Persistence
    },
    react: {
      useSuspense: false,          // Avoid loading states
    },
  });
```

## Best Practices

### ✅ Do's

- ✅ Use namespace approach: `t('section.key')`
- ✅ Group related translations together
- ✅ Use interpolation for dynamic content
- ✅ Provide context in translation keys
- ✅ Test translations in both languages
- ✅ Keep translations synchronized
- ✅ Use `useI18n()` hook for consistency

### ❌ Don'ts

- ❌ Don't hardcode strings in components
- ❌ Don't forget to add translations in both languages
- ❌ Don't use dynamic translation keys
- ❌ Don't nest translations too deeply
- ❌ Don't forget ARIA labels for accessibility
- ❌ Don't use excessive interpolation

## Testing

### Manual Testing

1. **Browser Detection**
   - Open app in browser with Spanish preference
   - Verify Spanish content loads automatically
   - Change to English
   - Refresh page - should keep English preference

2. **Language Switching**
   - Click language switcher buttons
   - Verify instant translation
   - Check localStorage contains preference

3. **All Pages**
   - Test both languages on:
     - Login/Auth pages
     - Dashboard
     - Quotes/Invoices
     - Settings
     - Admin pages

### Unit Testing

```tsx
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import MyComponent from './MyComponent';

test('renders Spanish translation', () => {
  i18n.changeLanguage('es');
  render(
    <I18nextProvider i18n={i18n}>
      <MyComponent />
    </I18nextProvider>
  );
  expect(screen.getByText('Panel de Control')).toBeInTheDocument();
});

test('renders English translation', () => {
  i18n.changeLanguage('en');
  render(
    <I18nextProvider i18n={i18n}>
      <MyComponent />
    </I18nextProvider>
  );
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});
```

## Troubleshooting

### Translations Not Updating

**Problem**: Component shows key instead of translation (`t('key')`)

**Solution**:
1. Verify key exists in translation file
2. Check namespace is correct
3. Ensure `useSuspense: false` in config

### Language Not Persisting

**Problem**: Language resets on page refresh

**Solution**:
1. Check localStorage is not disabled
2. Verify `caches: ['localStorage']` in config
3. Check browser privacy settings

### Performance Issues

**Problem**: App feels slow after language switch

**Solution**:
1. Keep translation files under 100KB each
2. Use code splitting for heavy components
3. Consider lazy loading translations

## Future Enhancements

- [ ] Add more languages (French, Portuguese, etc.)
- [ ] Implement RTL support for Arabic
- [ ] Add date/number formatting per language
- [ ] Create translation management UI
- [ ] Add language-specific SEO meta tags
- [ ] Implement server-side rendering with i18n
- [ ] Add translation statistics dashboard

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Docs](https://react.i18next.com/)
- [i18next Browser Language Detector](https://github.com/i18next/i18next-browser-languagedetector)
- [Best Practices for i18n](https://www.i18next.com/how-to-tutorials/how-to-translate-a-react-app)

## FAQ

### Q: Can I add more languages?

A: Yes! Add new locale file `src/i18n/locales/fr.json` and update config.ts

### Q: How do I handle currency/date formatting?

A: Use Intl API or react-intl for locale-specific formatting

### Q: What if translation is missing?

A: i18next will show the key. Add translation to fix.

### Q: How do I track translations?

A: Use i18next-missing-keys plugin for development

---

**Last Updated**: February 17, 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready
