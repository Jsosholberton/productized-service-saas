'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { useState } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from the pathname if it exists
    const pathWithoutLocale = pathname.replace(/^\/(en|es)/, '');
    // Add the new locale to the pathname
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-slate-800 transition-colors"
        aria-label="Change language"
      >
        <Languages className="w-5 h-5" />
        <span className="text-sm font-medium uppercase">{locale}</span>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-32 rounded-lg bg-slate-800 border border-slate-700 shadow-lg z-50">
            <button
              onClick={() => switchLocale('es')}
              className={`w-full text-left px-4 py-2 hover:bg-slate-700 first:rounded-t-lg ${
                locale === 'es' ? 'bg-slate-700 text-blue-400' : 'text-white'
              }`}
            >
              Español
            </button>
            <button
              onClick={() => switchLocale('en')}
              className={`w-full text-left px-4 py-2 hover:bg-slate-700 last:rounded-b-lg ${
                locale === 'en' ? 'bg-slate-700 text-blue-400' : 'text-white'
              }`}
            >
              English
            </button>
          </div>
        </>
      )}
    </div>
  );
}
