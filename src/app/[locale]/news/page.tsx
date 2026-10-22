import React from 'react';
import Link from 'next/link';
import { getArticles, getCategories, getSocialLinks } from '@/lib/services';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';
import { ArticleCard } from '@/components/news/ArticleCard';

interface NewsListingPageProps {
  params: {
    locale: string;
  };
  searchParams: {
    category?: string;
  };
}

export default async function NewsListingPage({
  params: { locale },
  searchParams,
}: NewsListingPageProps) {
  const selectedCategory = searchParams.category;

  const [articles, categories, socialLinks] = await Promise.all([
    getArticles({ categorySlug: selectedCategory, limit: 30 }),
    getCategories(),
    getSocialLinks(),
  ]);

  const isNe = locale === 'ne';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar locale={locale} categories={categories} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-1 tracking-tight">
            {isNe ? 'सम्पूर्ण समाचार' : 'All News'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-text-3">
            {isNe
              ? 'देश, समाज, राजनीति, प्रविधि, युवा र विश्व घटनाक्रमका विश्वसनीय विवरणहरू'
              : 'Verified, comprehensive reporting across politics, youth innovation, technology, education and culture.'}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <Link
            href={`/${locale}/news`}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              !selectedCategory
                ? 'bg-accent text-white shadow-sm'
                : 'bg-surface text-text-2 hover:bg-surface-2'
            }`}
          >
            {isNe ? 'सबै समाचार' : 'All Categories'}
          </Link>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const name = isNe ? cat.name_ne : cat.name_en;
            return (
              <Link
                key={cat.id}
                href={`/${locale}/news?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'text-white shadow-sm'
                    : 'bg-surface text-text-2 hover:bg-surface-2'
                }`}
                style={isSelected ? { backgroundColor: cat.color || '#235DBC' } : undefined}
              >
                {name}
              </Link>
            );
          })}
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="py-16 text-center text-text-3 bg-surface rounded-2xl border border-border">
            {isNe ? 'यस विधामा हाल कुनै समाचार भेटिएन।' : 'No articles found in this category.'}
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
