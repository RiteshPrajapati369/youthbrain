'use client';

import React from 'react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  locale: string;
}

export function DashboardHeader({ title, subtitle, locale }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-border">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-1 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-xs sm:text-sm text-text-3 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        <LanguageSwitcher currentLocale={locale} />
        <ThemeToggle />
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-accent shadow-sm hidden sm:block">
          <Image src="/logo.jpg" alt="Owner" fill className="object-cover" />
        </div>
      </div>
    </div>
  );
}
