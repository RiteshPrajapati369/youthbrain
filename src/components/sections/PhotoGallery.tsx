import React from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import type { Article } from '@/types';

interface PhotoGalleryProps {
  articles: Article[];
  locale: string;
}

export function PhotoGallery({ articles, locale }: PhotoGalleryProps) {
  const isNe = locale === 'ne';
  const galleryItems = articles.slice(0, 4);

  if (galleryItems.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 bg-surface/60 border-t border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-5 h-5 text-accent-2" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-1">
            {isNe ? 'फोटो फिचर' : 'Photo Gallery'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-text-3 mb-6">
          {isNe ? 'दृश्यका माध्यमबाट समेटिएका नेपाली परिवेश र घटनाक्रम' : 'Visual chronicles capturing the spirit and moments of Nepal'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {galleryItems.map((item) => {
            const title = isNe ? item.title_ne : item.title_en;
            return (
              <div
                key={item.id}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-2 border border-border shadow-sm cursor-pointer"
              >
                <Image
                  src={item.cover_image_url || '/logo.jpg'}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-accent-2 mb-1">
                    {isNe ? 'फोटो' : 'Photo'}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold line-clamp-2 leading-tight">
                    {title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
