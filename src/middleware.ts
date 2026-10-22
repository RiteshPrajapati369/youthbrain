import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, LANGUAGE_COOKIE_NAME } from './lib/i18n';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/owner-auth';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false,
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, api routes, and icons
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml')
  ) {
    return NextResponse.next();
  }

  // Determine active locale: check yth_lang session cookie (defaults to 'ne')
  const langCookie = request.cookies.get(LANGUAGE_COOKIE_NAME)?.value;
  const currentLocale = langCookie === 'en' ? 'en' : 'ne';

  // Handle root route / -> redirect to determined locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  // Extract locale from pathname (e.g. /ne/dashboard, /en/news)
  const segments = pathname.split('/').filter(Boolean);
  const pathLocale = segments[0];
  const isLocalePrefixed = locales.includes(pathLocale as any);

  if (!isLocalePrefixed) {
    return NextResponse.redirect(new URL(`/${currentLocale}${pathname}`, request.url));
  }

  const effectiveLocale = pathLocale;
  const subPath = '/' + segments.slice(1).join('/');

  // 1. Edge Fast-Path Protection for CMS Dashboard (0.1ms HMAC check)
  if (subPath.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionCookie);

    if (!session || !session.mfaVerified) {
      const loginUrl = new URL(`/${effectiveLocale}/auth/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Prevent already logged-in admin from visiting login page
  if (subPath.startsWith('/auth/login')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionCookie);
    if (session && session.mfaVerified) {
      return NextResponse.redirect(new URL(`/${effectiveLocale}/dashboard`, request.url));
    }
  }

  // Pass through next-intl handler
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.jpg|icon.jpg).*)'],
};
