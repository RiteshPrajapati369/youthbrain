'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { LANGUAGE_COOKIE_NAME } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: 'ne' | 'en') => {
    if (newLocale === currentLocale) return;

    // Set yth_lang as a SESSION COOKIE (no maxAge/expires) so closing tab/browser resets to Nepali
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${newLocale}; path=/; SameSite=Lax`;

    // Replace locale in current path
    const segments = pathname.split('/');
    if (segments.length > 1 && (segments[1] === 'ne' || segments[1] === 'en')) {
      segments[1] = newLocale;
    } else {
      segments.unshift('', newLocale);
    }
    const newPath = segments.join('/') || `/${newLocale}`;
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center space-x-1 bg-surface border border-border rounded-full p-1 shadow-sm">
      <Globe className="w-3.5 h-3.5 text-text-3 ml-1.5 mr-0.5 hidden sm:block" />
      <button
        type="button"
        onClick={() => handleLanguageChange('ne')}
        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
          currentLocale === 'ne'
            ? 'bg-accent text-white shadow-sm font-semibold'
            : 'text-text-2 hover:text-text-1'
        }`}
      >
        नेपाली
      </button>
      <button
        type="button"
        onClick={() => handleLanguageChange('en')}
        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
          currentLocale === 'en'
            ? 'bg-accent text-white shadow-sm font-semibold'
            : 'text-text-2 hover:text-text-1'
        }`}
      >
        EN
      </button>
    </div>
  );
}
