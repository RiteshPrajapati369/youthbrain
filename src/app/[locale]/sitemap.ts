import { MetadataRoute } from 'next';
import { getArticles, getCategories } from '@/lib/services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://youthbrain.com.np';
  const locales = ['ne', 'en'];

  const [articles, categories] = await Promise.all([
    getArticles({ limit: 100 }),
    getCategories(),
  ]);

  const staticRoutes = ['', '/news', '/about', '/contact'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static Pages
  for (const route of staticRoutes) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'hourly' : 'daily',
        priority: route === '' ? 1.0 : 0.8,
      });
    }
  }

  // Categories
  for (const cat of categories) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
  }

  // Articles
  for (const art of articles) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}/news/${art.slug}`,
        lastModified: art.updated_at ? new Date(art.updated_at) : new Date(art.created_at),
        changeFrequency: 'weekly',
        priority: art.is_featured ? 0.9 : 0.6,
      });
    }
  }

  return sitemapEntries;
}
