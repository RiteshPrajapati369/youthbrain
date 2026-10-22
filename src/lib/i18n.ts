import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['ne', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ne';

export const LANGUAGE_COOKIE_NAME = 'yth_lang';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
