import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticles, getCategories, getCategoryBySlug, getSocialLinks } from '@/lib/services';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';
import { ArticleCard } from '@/components/news/ArticleCard';

interface CategoryPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({
  params: { locale, slug },
}: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };

  const isNe = locale === 'ne';
  const name = isNe ? category.name_ne : category.name_en;
  const description = isNe ? category.description_ne : category.description_en;

  return {
    title: `${name} - YouTh Brain News`,
    description: description || name,
  };
}

export default async function CategoryPage({
  params: { locale, slug },
}: CategoryPageProps) {
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [articles, allCategories, socialLinks] = await Promise.all([
    getArticles({ categorySlug: slug, limit: 30 }),
    getCategories(),
    getSocialLinks(),
  ]);

  const isNe = locale === 'ne';
  const categoryName = isNe ? category.name_ne : category.name_en;
  const categoryDesc = isNe ? category.description_ne : category.description_en;
  const categoryColor = category.color || '#235DBC';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar locale={locale} categories={allCategories} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Category Header Banner */}
        <div
          className="mb-10 p-6 sm:p-10 rounded-2xl border text-white shadow-sm"
          style={{
            backgroundColor: categoryColor,
            borderColor: categoryColor,
          }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2">
            {isNe ? 'समाचार विधा' : 'News Category'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {categoryName}
          </h1>
          {categoryDesc && (
            <p className="mt-3 text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed">
              {categoryDesc}
            </p>
          )}
        </div>

        {/* Category Articles */}
        {articles.length === 0 ? (
          <div className="py-16 text-center text-text-3 bg-surface rounded-2xl border border-border">
            {isNe ? 'यस विधामा हाल कुनै समाचार भेटिएन।' : 'No articles currently found in this category.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} locale={locale} variant="standard" />
            ))}
          </div>
        )}
      </main>

      <Footer locale={locale} socialLinks={socialLinks} />
    </div>
  );
}
