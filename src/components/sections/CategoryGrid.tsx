import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ArticleCard } from '@/components/news/ArticleCard';
import type { Article, Category } from '@/types';

interface CategoryGridProps {
  category: Category;
  articles: Article[];
  locale: string;
}

export function CategoryGrid({ category, articles, locale }: CategoryGridProps) {
  if (!articles || articles.length === 0) return null;

  const isNe = locale === 'ne';
  const categoryName = isNe ? category.name_ne : category.name_en;
  const categoryDesc = isNe ? category.description_ne : category.description_en;
  const categoryColor = category.color || '#235DBC';

  const [leadArticle, ...restArticles] = articles;

  return (
    <section className="py-6 sm:py-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="flex items-end justify-between mb-6 pb-2 border-b-2" style={{ borderColor: categoryColor }}>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-sm"
                style={{ backgroundColor: categoryColor }}
              />
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-1">
                {categoryName}
              </h2>
            </div>
            {categoryDesc && (
              <p className="text-xs sm:text-sm text-text-3 mt-1">
                {categoryDesc}
              </p>
            )}
          </div>
          <Link
            href={`/${locale}/category/${category.slug}`}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold hover:underline"
            style={{ color: categoryColor }}
          >
            <span>{isNe ? 'सबै समाचार' : 'View all'}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {leadArticle && (
            <div className="lg:col-span-6">
              <ArticleCard article={leadArticle} locale={locale} variant="standard" />
            </div>
          )}

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restArticles.slice(0, 4).map((art) => (
              <ArticleCard key={art.id} article={art} locale={locale} variant="standard" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
