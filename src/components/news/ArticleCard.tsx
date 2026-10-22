'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Sparkles } from 'lucide-react';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
  locale: string;
  variant?: 'featured' | 'standard' | 'compact' | 'horizontal';
}

export function ArticleCard({ article, locale, variant = 'standard' }: ArticleCardProps) {
  const isNe = locale === 'ne';
  const title = isNe ? article.title_ne : article.title_en;
  const summary = isNe ? article.summary_ne : article.summary_en;
  const categoryName = isNe ? article.category?.name_ne : article.category?.name_en;
  const categoryColor = article.category?.color || '#235DBC';

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString(isNe ? 'ne-NP' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const imageUrl = article.cover_image_url || '/logo.jpg';

  if (variant === 'featured') {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-surface border border-border shadow-md hover:shadow-xl transition-all duration-300">
        <Link href={`/${locale}/news/${article.slug}`} className="block">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {article.is_breaking && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-2 px-3 py-1 text-xs font-bold text-white shadow-sm animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  {isNe ? 'ताजा ब्रेकिङ' : 'BREAKING'}
                </span>
              )}
              {categoryName && (
                <span
                  style={{ backgroundColor: categoryColor }}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                >
                  {categoryName}
                </span>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 text-white">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight line-clamp-2 leading-snug group-hover:text-bg-soft transition-colors">
                {title}
              </h2>
              {summary && (
                <p className="mt-2 text-sm sm:text-base text-gray-200 line-clamp-2 leading-relaxed">
                  {summary}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-300">
                {formattedDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formattedDate}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {article.view_count || 0} {isNe ? 'हेराइ' : 'views'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group flex gap-3 sm:gap-4 items-start py-3 border-b border-border last:border-0">
        <Link href={`/${locale}/news/${article.slug}`} className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-lg bg-surface-2">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="flex-1 min-w-0">
          {categoryName && (
            <span
              style={{ color: categoryColor }}
              className="text-[11px] font-bold uppercase tracking-wider block mb-1"
            >
              {categoryName}
            </span>
          )}
          <Link href={`/${locale}/news/${article.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-text-1 group-hover:text-accent transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-text-3">
            {formattedDate && <span>{formattedDate}</span>}
            <span>•</span>
            <span>{article.view_count || 0} {isNe ? 'हेराइ' : 'views'}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article className="group grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-surface border border-border shadow-sm hover:shadow-md transition-all">
        <div className="relative md:col-span-5 aspect-[16/10] overflow-hidden rounded-lg bg-surface-2">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {article.is_breaking && (
            <span className="absolute top-2 left-2 rounded-full bg-accent-2 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
              {isNe ? 'ब्रेकिङ' : 'BREAKING'}
            </span>
          )}
        </div>
        <div className="md:col-span-7 flex flex-col justify-center">
          {categoryName && (
            <span
              style={{ color: categoryColor }}
              className="text-xs font-bold uppercase tracking-wider mb-1.5"
            >
              {categoryName}
            </span>
          )}
          <Link href={`/${locale}/news/${article.slug}`}>
            <h3 className="text-lg font-bold text-text-1 group-hover:text-accent transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>
          {summary && (
            <p className="mt-2 text-sm text-text-2 line-clamp-2 leading-relaxed">
              {summary}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-text-3">
            {formattedDate && <span>{formattedDate}</span>}
            <span>•</span>
            <span>{article.view_count || 0} {isNe ? 'हेराइ' : 'views'}</span>
          </div>
        </div>
      </article>
    );
  }

  // Standard Card
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-surface border border-border shadow-sm hover:shadow-md transition-all duration-300">
      <Link href={`/${locale}/news/${article.slug}`} className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {article.is_breaking && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-accent-2 px-2.5 py-0.5 text-xs font-bold text-white shadow">
            {isNe ? 'ब्रेकिङ' : 'BREAKING'}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          {categoryName ? (
            <span
              style={{ color: categoryColor }}
              className="font-bold uppercase tracking-wider text-[11px]"
            >
              {categoryName}
            </span>
          ) : (
            <span />
          )}
          {formattedDate && <span className="text-text-3">{formattedDate}</span>}
        </div>
        <Link href={`/${locale}/news/${article.slug}`}>
          <h3 className="text-base sm:text-lg font-bold text-text-1 group-hover:text-accent transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
        </Link>
        {summary && (
          <p className="mt-2 flex-1 text-xs sm:text-sm text-text-2 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        )}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-3">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {article.view_count || 0} {isNe ? 'हेराइ' : 'views'}
          </span>
          <span className="font-medium text-accent group-hover:underline">
            {isNe ? 'पुरा पढ्नुहोस् →' : 'Read more →'}
          </span>
        </div>
      </div>
    </article>
  );
}
