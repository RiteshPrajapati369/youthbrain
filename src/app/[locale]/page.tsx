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
import { CategoryGrid } from '@/components/sections/CategoryGrid';
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
  const [breakingNews, featuredArticles, latestArticles, categories, socialLinks] =
    await Promise.all([
      getBreakingNews(6),
      getFeaturedArticles(5),
      getArticles({ limit: 10 }),
      getCategories(),
      getSocialLinks(),
    ]);

  // Fetch articles per category (all priority categories)
  const categoriesWithArticles = await Promise.all(
    categories.slice(0, 6).map(async (cat) => {
      const articles = await getArticles({ categorySlug: cat.slug, limit: 5 });
      return {
        category: cat,
        articles,
      };
    })
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar locale={locale} categories={categories} />
      <BreakingTicker articles={breakingNews} locale={locale} />
      
      <main className="flex-1">
        <HeroFeatured
          featuredArticles={featuredArticles}
          latestArticles={latestArticles}
          locale={locale}
        />

        {categoriesWithArticles.map(({ category, articles }) => (
          <CategoryGrid
            key={category.id}
            category={category}
            articles={articles}
            locale={locale}
          />
        ))}

        <PhotoGallery articles={latestArticles} locale={locale} />
        <NewsletterSection locale={locale} />
      </main>

      <Footer locale={locale} socialLinks={socialLinks} />
    </div>
  );
}
