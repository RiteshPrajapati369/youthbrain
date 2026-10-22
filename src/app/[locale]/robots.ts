import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://youthbrainnews.com.np';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/*/dashboard', '/*/auth', '/api/*'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
