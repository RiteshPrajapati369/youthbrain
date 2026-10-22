import React from 'react';
import Link from 'next/link';
import { Flame, ChevronRight } from 'lucide-react';
import type { Article } from '@/types';

interface BreakingTickerProps {
  articles: Article[];
  locale: string;
}

export function BreakingTicker({ articles, locale }: BreakingTickerProps) {
  if (!articles || articles.length === 0) return null;

  const isNe = locale === 'ne';

  return (
    <div className="w-full bg-surface border-b border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center">
        {/* Ticker Badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-accent-2 text-white px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider mr-4 shadow-sm animate-pulse">
          <Flame className="w-3.5 h-3.5 fill-white" />
          <span>{isNe ? 'ताजा ब्रेकिङ' : 'BREAKING'}</span>
        </div>

        {/* Ticker Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-ticker space-x-8 text-sm font-semibold text-text-1">
            {articles.map((article) => {
              const title = isNe ? article.title_ne : article.title_en;
              return (
                <Link
                  key={article.id}
                  href={`/${locale}/news/${article.slug}`}
                  className="inline-flex items-center hover:text-accent transition-colors"
                >
                  <span>{title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-accent-2 ml-2 opacity-70" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
