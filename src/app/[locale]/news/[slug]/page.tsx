import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Eye, Share2, ArrowLeft, Bookmark } from 'lucide-react';
import {
  getArticleBySlug,
  getRelatedArticles,
  getCategories,
  getSocialLinks,
  incrementViewCount,
} from '@/lib/services';
import { formatHeaderDate } from '@/lib/date-utils';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';
import { MarkdownRenderer } from '@/components/news/MarkdownRenderer';
import { ArticleCard } from '@/components/news/ArticleCard';
import { NewsArticleJsonLd } from '@/components/seo/JsonLd';

interface ArticlePageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({
  params: { locale, slug },
}: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Not Found' };

  const isNe = locale === 'ne';
  const title = isNe ? article.title_ne : article.title_en;
  const description = isNe
    ? article.summary_ne || article.title_ne
    : article.summary_en || article.title_en;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://youthbrain.com.np';
  const imageUrl = article.cover_image_url || '/logo.jpg';

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/news/${slug}`,
      languages: {
        ne: `${siteUrl}/ne/news/${slug}`,
        en: `${siteUrl}/en/news/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/news/${slug}`,
      images: [{ url: imageUrl, alt: title }],
      type: 'article',
      publishedTime: article.published_at || article.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArticleDetailPage({
  params: { locale, slug },
}: ArticlePageProps) {
  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  // Increment view count in background
  incrementViewCount(slug);

  const [categories, relatedArticles, socialLinks] = await Promise.all([
    getCategories(),
    getRelatedArticles(article.category_id || null, article.id, 3),
    getSocialLinks(),
  ]);

  const isNe = locale === 'ne';
  const title = isNe ? article.title_ne : article.title_en;
  const summary = isNe ? article.summary_ne : article.summary_en;
  const content = isNe ? article.content_ne : article.content_en;
  const categoryName = isNe ? article.category?.name_ne : article.category?.name_en;
  const categoryColor = article.category?.color || '#235DBC';

  const formattedDate = article.published_at
    ? formatHeaderDate(article.published_at, locale)
    : '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://youthbrain.com.np';

  return (
    <div className="flex flex-col min-h-screen">
      <NewsArticleJsonLd article={article} locale={locale} />
      <Navbar locale={locale} categories={categories} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between text-xs text-text-3">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-1.5 text-text-2 hover:text-accent font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isNe ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Back to Home'}</span>
          </Link>
          {categoryName && (
            <Link
              href={`/${locale}/category/${article.category?.slug}`}
              style={{ backgroundColor: categoryColor }}
              className="px-3 py-1 rounded-full text-white font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
            >
              {categoryName}
            </Link>
          )}
        </div>

        {/* Article Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-text-1 tracking-tight leading-tight sm:leading-snug mb-4">
          {title}
        </h1>

        {/* Summary Lead */}
        {summary && (
          <p className="text-lg sm:text-xl text-text-2 font-medium leading-relaxed mb-6 border-l-4 border-accent pl-4 italic bg-surface/50 py-2 rounded-r">
            {summary}
          </p>
        )}

        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-y border-border text-xs sm:text-sm text-text-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-accent">
                <Image src="/logo.jpg" alt="Author" fill className="object-cover" />
              </div>
              <span className="font-bold text-text-1">
                {isNe ? 'सम्पादकीय डेस्क' : 'Editorial Desk'}
              </span>
            </div>
            {formattedDate && (
              <span suppressHydrationWarning className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-text-3" />
                {formattedDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-text-3" />
              {article.view_count || 0} {isNe ? 'हेराइ' : 'views'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">{isNe ? 'सेयर:' : 'Share:'}</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${siteUrl}/${locale}/news/${slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full bg-surface hover:text-accent hover:bg-surface-2 transition-colors border border-border"
              title="Share on Facebook"
            >
              <Share2 className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Cover Image */}
        {article.cover_image_url && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-8 shadow-md border border-border">
            <Image
              src={article.cover_image_url}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Body */}
        <div className="mb-12">
          <MarkdownRenderer content={content} />
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="pt-8 border-t border-border mt-12">
            <h3 className="text-xl sm:text-2xl font-extrabold text-text-1 mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent" />
              {isNe ? 'सम्बन्धित समाचारहरू' : 'Related Stories'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} locale={locale} variant="standard" />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer locale={locale} socialLinks={socialLinks} />
    </div>
  );
}
