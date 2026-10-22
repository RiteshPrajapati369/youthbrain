import React from 'react';
import Link from 'next/link';
import { ArticleCard } from '@/components/news/ArticleCard';
import type { Article } from '@/types';

interface HeroFeaturedProps {
  featuredArticles: Article[];
  latestArticles: Article[];
  locale: string;
}

export function HeroFeatured({ featuredArticles, latestArticles, locale }: HeroFeaturedProps) {
  const isNe = locale === 'ne';
  const mainArticle = featuredArticles[0] || latestArticles[0];
  const sideArticles = featuredArticles.slice(1, 4).length > 0
    ? featuredArticles.slice(1, 4)
    : latestArticles.slice(1, 4);

  if (!mainArticle) {
    return (
      <div className="py-12 text-center text-text-3">
        {isNe ? 'हाल कुनै प्रमुख समाचार उपलब्ध छैन।' : 'No featured stories available.'}
      </div>
    );
  }

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Main Lead Story */}
          <div className="lg:col-span-8">
            <ArticleCard article={mainArticle} locale={locale} variant="featured" />
          </div>

          {/* Sidebar Top Stories */}
          <div className="lg:col-span-4 bg-surface rounded-2xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <h3 className="font-extrabold text-base text-text-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                {isNe ? 'प्रमुख घटनाक्रम' : 'Top Stories'}
              </h3>
              <Link
                href={`/${locale}/news`}
                className="text-xs font-semibold text-accent hover:underline"
              >
                {isNe ? 'सबै हेर्नुहोस् →' : 'View all →'}
              </Link>
            </div>

            <div className="flex flex-col">
              {sideArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  locale={locale}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
