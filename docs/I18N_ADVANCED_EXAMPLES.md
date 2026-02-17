# 🚀 Advanced i18n Usage Examples

This guide covers advanced patterns and use cases for the i18n implementation.

## Table of Contents

1. [Interpolation & Variables](#interpolation--variables)
2. [Pluralization](#pluralization)
3. [Conditional Rendering](#conditional-rendering)
4. [Nested Translations](#nested-translations)
5. [Dynamic Translations](#dynamic-translations)
6. [Translation with Components](#translation-with-components)
7. [Language-Specific Formatting](#language-specific-formatting)
8. [Translation Keys as References](#translation-keys-as-references)
9. [Lazy Loading Translations](#lazy-loading-translations)
10. [Testing Translations](#testing-translations)

---

## Interpolation & Variables

### Simple Interpolation

**Translation File (es.json):**
```json
{
  "greetings": {
    "welcome": "Bienvenido, {{name}}",
    "goodbye": "Adiós {{name}}, vuelve pronto"
  }
}
```

**Component:**
```tsx
import { useTranslation } from 'react-i18next';

function Greeting({ userName }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('greetings.welcome', { name: userName })}</h1>
      <p>{t('greetings.goodbye', { name: userName })}</p>
    </div>
  );
}
```

### Multiple Interpolations

**Translation File:**
```json
{
  "invoice": {
    "total": "Total: {{currency}} {{amount}}",
    "dateRange": "Desde {{startDate}} hasta {{endDate}}"
  }
}
```

**Component:**
```tsx
function Invoice({ total, startDate, endDate }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>{t('invoice.total', { currency: 'COP', amount: total })}</p>
      <p>{t('invoice.dateRange', { startDate, endDate })}</p>
    </div>
  );
}
```

---

## Pluralization

### Singular vs Plural

**Translation File (es.json):**
```json
{
  "items": {
    "count": "Tienes {{count}} elemento",
    "count_plural": "Tienes {{count}} elementos",
    "projects": "Un proyecto",
    "projects_plural": "{{count}} proyectos"
  }
}
```

**Component:**
```tsx
function ItemCounter({ count }) {
  const { t } = useTranslation();
  
  return (
    <div>
      {/* i18next automatically handles pluralization */}
      <p>{t('items.count', { count })}</p>
      {/* count: 1 -> "Tienes 1 elemento" */}
      {/* count: 5 -> "Tienes 5 elementos" */}
      
      <p>{t('items.projects', { count })}</p>
      {/* count: 1 -> "Un proyecto" */}
      {/* count: 10 -> "10 proyectos" */}
    </div>
  );
}
```

---

## Conditional Rendering

### Render Different Content by Language

```tsx
import { useI18n } from './i18n/hooks';

function LanguageSpecificContent() {
  const { isSpanish, isEnglish, t } = useI18n();
  
  if (isSpanish()) {
    return (
      <div>
        <p>Este contenido solo para español</p>
      </div>
    );
  }
  
  if (isEnglish()) {
    return (
      <div>
        <p>This content is English only</p>
      </div>
    );
  }
  
  return null;
}
```

### Conditional Translation Keys

```tsx
function PaymentStatus({ status }) {
  const { t } = useTranslation();
  
  const statusKey = {
    paid: 'invoice.paid',
    pending: 'invoice.pending',
    overdue: 'invoice.overdue',
  }[status] || 'invoice.pending';
  
  return <span className="status">{t(statusKey)}</span>;
}
```

---

## Nested Translations

### Access Nested Keys

**Translation File:**
```json
{
  "tax": {
    "regimes": {
      "personal": "Persona Natural",
      "juridical": "Persona Jurídica"
    },
    "rates": {
      "vat": "19%",
      "withholding": "3%"
    }
  }
}
```

**Component:**
```tsx
function TaxInfo() {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>{t('tax.regimes.personal')}</p>
      <p>{t('tax.rates.vat')}</p>
    </div>
  );
}
```

---

## Dynamic Translations

### Build Translation Keys Dynamically

```tsx
function StatusBadge({ status }) {
  const { t } = useTranslation();
  
  // Build key dynamically: 'status.active', 'status.completed', etc.
  const translationKey = `status.${status}`;
  
  return (
    <span className={`badge badge--${status}`}>
      {t(translationKey)}
    </span>
  );
}
```

### Language-Specific Formatting

```tsx
function FormatPrice({ price, locale }) {
  const { t } = useTranslation();
  const { i18n } = useI18n();
  
  const formatter = new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: 'COP',
  });
  
  return (
    <div>
      <p>{t('common.price')}: {formatter.format(price)}</p>
      {/* Spanish: ¢: $10,000.00 */}
      {/* English: Price: $10,000.00 */}
    </div>
  );
}
```

---

## Translation with Components

### Embed Components in Translations

**Translation File:**
```json
{
  "messages": {
    "privacy": "By continuing, you agree to our {{link}}terms of service{{/link}}"
  }
}
```

**Component:**
```tsx
function PrivacyNotice() {
  const { t } = useTranslation();
  
  return (
    <p>
      {t('messages.privacy', {
        link: (chunks) => (
          <a href="/terms" className="link">
            {chunks}
          </a>
        ),
      })}
    </p>
  );
}
```

### Translation with React Components

```tsx
function WelcomeMessage({ userName }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>
        {t('welcome')} <strong>{userName}</strong>
      </p>
    </div>
  );
}
```

---

## Language-Specific Formatting

### Date Formatting

```tsx
function EventDate({ date }) {
  const { i18n } = useI18n();
  
  const formatter = new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return <span>{formatter.format(new Date(date))}</span>;
  // Spanish: "17 de febrero de 2026"
  // English: "February 17, 2026"
}
```

### Number Formatting

```tsx
function FormatNumber({ number }) {
  const { i18n } = useI18n();
  
  const formatter = new Intl.NumberFormat(i18n.language);
  return <span>{formatter.format(number)}</span>;
  // Spanish: "10.000" or "10,000" (depends on locale)
  // English: "10,000"
}
```

### Currency Formatting

```tsx
function Price({ amount, currency = 'COP' }) {
  const { i18n } = useI18n();
  
  const formatter = new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: currency,
  });
  
  return <span>{formatter.format(amount)}</span>;
}
```

---

## Translation Keys as References

### Reusable Translation Keys

**Translation File:**
```json
{
  "common": {
    "appName": "Productized Service",
    "delete": "Eliminar",
    "confirm": "Confirmar",
    "cancel": "Cancelar"
  },
  "dialogs": {
    "deleteTitle": "{{item}} - {{action}}",
    "deleteMessage": "¿Estás seguro de que deseas {{action}} esto?"
  }
}
```

**Component:**
```tsx
function DeleteDialog({ itemName, onConfirm, onCancel }) {
  const { t } = useTranslation();
  
  return (
    <dialog>
      <h2>{t('dialogs.deleteTitle', {
        item: itemName,
        action: t('common.delete')
      })}</h2>
      <p>{t('dialogs.deleteMessage', {
        action: t('common.delete').toLowerCase()
      })}</p>
      <button onClick={onConfirm}>{t('common.confirm')}</button>
      <button onClick={onCancel}>{t('common.cancel')}</button>
    </dialog>
  );
}
```

---

## Lazy Loading Translations

### Load Translations on Demand

**Component with Lazy Loading:**
```tsx
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';

const AdminPanel = lazy(() => 
  import('./pages/AdminPanel').then(module => ({ default: module.AdminPanel }))
);

function App() {
  const { t } = useTranslation();
  
  return (
    <div>
      <Suspense fallback={<p>{t('common.loading')}</p>}>
        <AdminPanel />
      </Suspense>
    </div>
  );
}
```

---

## Testing Translations

### Unit Test Example

```tsx
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import MyComponent from './MyComponent';

describe('MyComponent Translations', () => {
  it('renders Spanish translation', async () => {
    await i18n.changeLanguage('es');
    render(
      <I18nextProvider i18n={i18n}>
        <MyComponent />
      </I18nextProvider>
    );
    expect(screen.getByText('Panel de Control')).toBeInTheDocument();
  });

  it('renders English translation', async () => {
    await i18n.changeLanguage('en');
    render(
      <I18nextProvider i18n={i18n}>
        <MyComponent />
      </I18nextProvider>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('switches language on button click', async () => {
    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <MyComponent />
      </I18nextProvider>
    );
    
    const switchButton = screen.getByText('EN');
    switchButton.click();
    
    await i18n.changeLanguage('en');
    
    rerender(
      <I18nextProvider i18n={i18n}>
        <MyComponent />
      </I18nextProvider>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

### Integration Test

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import App from '../App';

describe('App i18n Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('detects browser language on first load', async () => {
    Object.defineProperty(navigator, 'language', {
      value: 'es-ES',
      writable: true,
    });
    
    render(
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Panel de Control')).toBeInTheDocument();
    });
  });

  it('persists language preference', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    );
    
    const englishButton = screen.getByLabelText('Switch to English');
    fireEvent.click(englishButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('i18n-language')).toBe('en');
    });
  });
});
```

---

## Best Practices

### ✅ Good Practices

```tsx
// Good: Namespaced translations
const { t } = useTranslation();
return <h1>{t('projects.title')}</h1>;

// Good: Use interpolation
return <p>{t('greetings.welcome', { name: 'Juan' })}</p>;

// Good: Use custom hooks
const { t, isSpanish } = useI18n();

// Good: Lazy load components
const AdminPanel = lazy(() => import('./AdminPanel'));
```

### ❌ Anti-Patterns

```tsx
// Bad: Hardcoded strings
return <h1>Dashboard</h1>;

// Bad: Dynamic translation keys
const key = `some.${dynamicValue}.key`; // Can't find key

// Bad: Forgetting to add translations
return <p>{t('nonexistent.key')}</p>; // Shows key name

// Bad: Mixing languages
const spanish = 'Hola';
return <p>{spanish}</p>; // No translation system
```

---

## Performance Tips

### ⚡ Optimization Strategies

1. **Memoize Translations**
   ```tsx
   const translatedString = useMemo(
     () => t('section.key', { name }),
     [t, name]
   );
   ```

2. **Lazy Load Namespaces**
   ```tsx
   i18n.loadNamespace('admin').then(() => {
     // Use admin translations
   });
   ```

3. **Avoid Unnecessary Re-renders**
   ```tsx
   const MemoizedComponent = React.memo(MyComponent);
   ```

---

## Debugging

### Enable Debug Mode

```tsx
// In src/i18n/config.ts
i18n.init({
  debug: true, // Enable console logs
  saveMissing: true, // Log missing translations
  // ...
});
```

### Check Current State

```tsx
function DebugInfo() {
  const { i18n } = useI18n();
  
  return (
    <div style={{ background: '#eee', padding: '10px' }}>
      <p>Current Language: {i18n.language}</p>
      <p>Loaded Resources: {JSON.stringify(i18n.options.resources)}</p>
    </div>
  );
}
```

---

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next API Reference](https://react.i18next.com/)
- [Intl API Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

---

**Last Updated:** February 17, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
