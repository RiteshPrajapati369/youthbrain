import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import { locales, Locale } from '@/lib/i18n';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isNe = locale === 'ne';
  const siteName = isNe ? 'युथ ब्रेन न्युज' : 'YouTh Brain News';
  const tagline = isNe
    ? 'सत्य, तथ्य र निष्पक्ष समाचारको विश्वसनीय स्रोत'
    : 'Your Trusted Source for Truth, Facts and Impartial News';
  const siteUrl = 'https://youthbrainnews.com.np';

  return {
    title: {
      default: `${siteName} - ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: isNe
      ? 'नेपालको प्रमुख डिजिटल समाचार पोर्टल - राजनीति, प्रविधि, युवा नवप्रवर्तन, खेलकुद र समसामयिक विश्लेषण।'
      : 'Premier independent digital news portal of Nepal covering politics, technology, youth innovation, education and sports.',
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ne: '/ne',
        en: '/en',
      },
    },
    icons: {
      icon: '/logo.jpg',
      shortcut: '/logo.jpg',
      apple: '/logo.jpg',
    },
    openGraph: {
      title: siteName,
      description: tagline,
      url: `${siteUrl}/${locale}`,
      siteName: siteName,
      images: [
        {
          url: '/logo.jpg',
          width: 800,
          height: 800,
          alt: siteName,
        },
      ],
      locale: isNe ? 'ne_NP' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: tagline,
      images: ['/logo.jpg'],
      creator: '@youthbrainnews',
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <OrganizationJsonLd />
      </head>
      <body className="antialiased min-h-screen flex flex-col selection:bg-accent selection:text-white">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
