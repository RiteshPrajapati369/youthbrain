import React from 'react';
import {
  getArticles,
  getBreakingNews,
  getFeaturedArticles,
  getCategories,
  getSocialLinks,
} from '@/lib/services';
import { Navbar } from '@/components/sections/Navbar';
import { BreakingTicker } from '@/components/sections/BreakingTicker';
import { HeroFeatured } from '@/components/sections/HeroFeatured';
import { PaginatedNewsGrid } from '@/components/sections/PaginatedNewsGrid';
import { PhotoGallery } from '@/components/sections/PhotoGallery';
import { NewsletterSection } from '@/components/sections/NewsletterSection';
import { Footer } from '@/components/sections/Footer';

interface HomePageProps {
  params: {
    locale: string;
  };
}

export const revalidate = 60; // Incremental Static Regeneration every 60s

export default async function HomePage({ params: { locale } }: HomePageProps) {
  const [breakingNews, featuredArticles, allArticles, categories, socialLinks] =
    await Promise.all([
      getBreakingNews(6),
      getFeaturedArticles(5),
      getArticles(),
      getCategories(),
      getSocialLinks(),
    ]);

  // Identify articles displayed in HeroFeatured section to avoid duplicate display
  const heroMain = featuredArticles[0] || allArticles[0];
  const heroSide =
    featuredArticles.slice(1, 4).length > 0
      ? featuredArticles.slice(1, 4)
      : allArticles.slice(1, 4);

  const heroArticleIds = new Set<string>();
  if (heroMain) heroArticleIds.add(heroMain.id);
  heroSide.forEach((a) => heroArticleIds.add(a.id));

  // Articles slightly older than hero featured / top stories
  const olderArticles = allArticles.filter((a) => !heroArticleIds.has(a.id));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar locale={locale} categories={categories} />
      <BreakingTicker articles={breakingNews} locale={locale} />

      <main className="flex-1">
        {/* Keep the Featured/Latest news section at the top unchanged */}
        <HeroFeatured
          featuredArticles={featuredArticles}
          latestArticles={allArticles.slice(0, 5)}
          locale={locale}
        />

        {/* Replaced category-wise sections with paginated older news grid */}
        <PaginatedNewsGrid
          articles={olderArticles}
          locale={locale}
        />

        <PhotoGallery articles={allArticles.slice(0, 8)} locale={locale} />
        <NewsletterSection locale={locale} />
      </main>

      <Footer locale={locale} socialLinks={socialLinks} />
    </div>
  );
}
