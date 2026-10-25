import React from 'react';
import type { Article } from '@/types';

interface OrganizationJsonLdProps {
  siteUrl?: string;
  name?: string;
  logoUrl?: string;
}

export function OrganizationJsonLd({
  siteUrl = 'https://youthbrain.com.np',
  name = 'YouTh Brain News',
  logoUrl = 'https://youthbrain.com.np/logo.jpg',
}: OrganizationJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
      width: 512,
      height: 512,
    },
    sameAs: [
      'https://facebook.com/youthbrainnews',
      'https://twitter.com/youthbrainnews',
      'https://youtube.com/@youthbrainnews',
      'https://linkedin.com/company/youthbrainnews',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+977-9800000000',
      contactType: 'editorial desk',
      email: 'panditritesh005@gmail.com',
      availableLanguage: ['Nepali', 'English'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleJsonLdProps {
  article: Article;
  locale: string;
  siteUrl?: string;
}

export function NewsArticleJsonLd({
  article,
  locale,
  siteUrl = 'https://youthbrain.com.np',
}: ArticleJsonLdProps) {
  const isNe = locale === 'ne';
  const title = isNe ? article.title_ne : article.title_en;
  const description = isNe ? (article.summary_ne || article.title_ne) : (article.summary_en || article.title_en);
  const articleUrl = `${siteUrl}/${locale}/news/${article.slug}`;
  const imageUrl = article.cover_image_url?.startsWith('http')
    ? article.cover_image_url
    : `${siteUrl}${article.cover_image_url || '/logo.jpg'}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: title,
    description: description,
    image: [imageUrl],
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    inLanguage: isNe ? 'ne-NP' : 'en-US',
    author: {
      '@type': 'Person',
      name: 'Ritesh Prajapati',
      jobTitle: 'Editor-in-Chief',
      url: `${siteUrl}/${locale}/about`,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'YouTh Brain News',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.jpg`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
