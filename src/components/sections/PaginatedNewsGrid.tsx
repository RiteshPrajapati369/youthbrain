'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArticleCard } from '@/components/news/ArticleCard';
import type { Article } from '@/types';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';

interface PaginatedNewsGridProps {
  articles: Article[];
  locale: string;
}

export function PaginatedNewsGrid({ articles, locale }: PaginatedNewsGridProps) {
  const isNe = locale === 'ne';
  const sectionRef = useRef<HTMLElement>(null);

  // Read initial page from URL query if available
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = Number(params.get('page'));
      if (pageParam && pageParam >= 1) {
        setCurrentPage(pageParam);
      }
    }
  }, []);

  const total = articles.length;
  // Page 1 has 8 news; each subsequent page has 16 news
  const totalPages = total <= 8 ? (total === 0 ? 1 : 1) : 1 + Math.ceil((total - 8) / 16);

  // Ensure currentPage is within valid bounds
  const validPage = Math.max(1, Math.min(currentPage, totalPages));

  // Determine slice indices for current page
  let currentArticles: Article[] = [];
  if (validPage === 1) {
    currentArticles = articles.slice(0, 8);
  } else {
    const startIdx = 8 + (validPage - 2) * 16;
    const endIdx = startIdx + 16;
    currentArticles = articles.slice(startIdx, endIdx);
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newPage === 1) {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', String(newPage));
      }
      window.history.pushState({}, '', url.toString());
    }

    if (sectionRef.current) {
      const yOffset = -80; // offset for sticky navigation header
      const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Convert numbers to Nepali digits if locale is Nepali
  const formatPageNum = (num: number | string) => {
    if (typeof num === 'string') return num;
    if (!isNe) return String(num);
    const neDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(num).replace(/[0-9]/g, (d) => neDigits[Number(d)]);
  };

  // Build pagination array with ellipses
  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (validPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', validPage - 1, validPage, validPage + 1, '...', totalPages];
  };

  if (articles.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} id="older-news" className="py-8 sm:py-10 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-border gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-6 rounded-full bg-accent inline-block" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-1 tracking-tight">
                {isNe ? 'थप पछिल्ला समाचार' : 'More Stories & Updates'}
              </h2>
            </div>
            <p className="text-sm text-text-3 ml-4">
              {isNe
                ? 'राजनीति, समाज, अर्थ, विज्ञान-प्रविधि तथा खेलकुदका ताजा घटनाक्रम'
                : 'Comprehensive reporting across politics, society, business, tech, and sports'}
            </p>
          </div>

          <div className="text-xs font-medium text-text-3 flex items-center gap-1.5 ml-4 sm:ml-0 self-start sm:self-auto">
            <Newspaper className="w-4 h-4 text-accent" />
            <span>
              {isNe
                ? `पृष्ठ ${formatPageNum(validPage)} / ${formatPageNum(totalPages)} (जम्मा ${formatPageNum(total)} समाचार)`
                : `Page ${validPage} of ${totalPages} (${total} stories)`}
            </span>
          </div>
        </div>

        {/* News Grid: 4 columns on lg */}
        {/* Page 1: 8 news (2 rows x 4 cols) */}
        {/* Page 2+: 16 news (4 rows x 4 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              locale={locale}
              variant="standard"
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-center gap-2"
          >
            {/* Previous Page Button */}
            <button
              type="button"
              onClick={() => handlePageChange(validPage - 1)}
              disabled={validPage === 1}
              className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                validPage === 1
                  ? 'border-border text-text-3 opacity-40 cursor-not-allowed bg-surface'
                  : 'border-border bg-surface text-text-1 hover:border-accent hover:text-accent shadow-sm active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isNe ? 'अघिल्लो' : 'Previous'}</span>
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1.5">
              {getPaginationItems().map((item, idx) => {
                if (typeof item === 'string') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 py-1 text-text-3 font-semibold select-none"
                    >
                      …
                    </span>
                  );
                }

                const isActive = item === validPage;
                return (
                  <button
                    key={`page-${item}`}
                    type="button"
                    onClick={() => handlePageChange(item)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all flex items-center justify-center ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-surface text-text-1 border-border hover:border-accent hover:text-accent active:scale-95'
                    }`}
                  >
                    {formatPageNum(item)}
                  </button>
                );
              })}
            </div>

            {/* Next Page Button */}
            <button
              type="button"
              onClick={() => handlePageChange(validPage + 1)}
              disabled={validPage >= totalPages}
              className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                validPage >= totalPages
                  ? 'border-border text-text-3 opacity-40 cursor-not-allowed bg-surface'
                  : 'border-border bg-surface text-text-1 hover:border-accent hover:text-accent shadow-sm active:scale-95'
              }`}
            >
              <span>{isNe ? 'पछिल्लो' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
