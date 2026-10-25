'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Clock, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import type { Category } from '@/types';

interface NavbarProps {
  locale: string;
  categories?: Category[];
}

export function Navbar({ locale, categories = [] }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeString, setTimeString] = useState<string>('');
  const pathname = usePathname();
  const isNe = locale === 'ne';

  // Live ticking clock in HH:MM:SS format
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());
      setTimeString(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Priority News Categories
  const priorityCategories = [
    { slug: 'politics', name_ne: 'राजनीति', name_en: 'Politics' },
    { slug: 'society', name_ne: 'समाज', name_en: 'Society' },
    { slug: 'economy', name_ne: 'अर्थ', name_en: 'Economy' },
    { slug: 'science-tech', name_ne: 'विज्ञान तथा प्रविधि', name_en: 'Science & Tech' },
    { slug: 'sports', name_ne: 'खेलकुद', name_en: 'Sports' },
    { slug: 'interview', name_ne: 'अन्तर्वार्ता', name_en: 'Interview' },
  ];

  const navLinks = [
    { href: `/${locale}`, label: isNe ? 'गृहपृष्ठ' : 'Home' },
    ...priorityCategories.map((cat) => ({
      href: `/${locale}/category/${cat.slug}`,
      label: isNe ? cat.name_ne : cat.name_en,
    })),
  ];

  const secondaryLinks = [
    { href: `/${locale}/news`, label: isNe ? 'सबै समाचार' : 'All News' },
    { href: `/${locale}/about`, label: isNe ? 'हाम्रोबारे' : 'About' },
    { href: `/${locale}/contact`, label: isNe ? 'सम्पर्क' : 'Contact' },
  ];

  const currentDateFormatted = new Date().toLocaleDateString(isNe ? 'ne-NP' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full">
      {/* 1. Top Bar: Higher height, Left (Date & Time), Center (Prominent Logo + Name + Tagline), Right (Lang & Theme). Slides up and disappears on scroll */}
      <div className="w-full border-b border-border bg-surface/50 py-5 sm:py-7 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side: Date and Time */}
          <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-start gap-1.5 order-2 md:order-1 md:flex-1">
            <span className="text-xs sm:text-sm font-semibold text-text-2 tracking-tight">
              {currentDateFormatted}
            </span>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-accent bg-bg-soft px-3 py-1 rounded-full border border-border/80 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>{timeString || '--:--:--'}</span>
            </div>
          </div>

          {/* Center: Logo + “YouTh Brain News” prominent text + tagline */}
          <div className="flex items-center justify-center order-1 md:order-2 flex-shrink-0 text-center">
            <Link href={`/${locale}`} className="flex items-center gap-3 sm:gap-4 md:gap-5 group">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 sm:border-3 border-accent shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.jpg"
                  alt="YouTh Brain News Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col items-start justify-center text-left">
                <span className="font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight text-text-1 group-hover:text-accent transition-colors leading-none">
                  {isNe ? 'युथ ब्रेन न्युज' : 'YouTh Brain News'}
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm text-text-3 tracking-[0.2em] uppercase font-bold mt-1.5">
                  {isNe ? 'सत्य, तथ्य र निष्पक्ष' : 'TRUTH, FACTS & IMPARTIAL'}
                </span>
              </div>
            </Link>
          </div>

          {/* Right side: Language switcher (नेपाली | EN) + Day/Night mode toggle */}
          <div className="w-full md:w-auto flex items-center justify-center md:justify-end gap-2.5 sm:gap-3 order-3 md:flex-1">
            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar: Sticky and fixed at the top of the screen after top bar scrolls away */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/80 shadow-xs transition-shadow duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 sm:h-14">
            {/* Navigation Menu Items: Home, Politics, Society, Economy, Science & Tech, Sports, Interview */}
            <nav className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 overflow-x-auto py-1 scrollbar-none flex-1 justify-start md:justify-center">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'text-accent bg-bg-soft shadow-xs font-bold'
                        : 'text-text-2 hover:text-text-1 hover:bg-surface'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center ml-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-text-2 hover:text-text-1 hover:bg-surface border border-border"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface p-4 transition-all animate-in slide-in-from-top-2 shadow-lg">
            <div className="pb-2 mb-2 border-b border-border text-xs text-text-3 font-semibold flex items-center justify-between">
              <span className="font-medium text-text-2">{currentDateFormatted}</span>
              <span className="font-mono text-accent font-bold">{timeString}</span>
            </div>

            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                    pathname === link.href
                      ? 'text-accent bg-bg-soft font-bold'
                      : 'text-text-1 hover:bg-surface-2'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 border-t border-border mt-2 space-y-1">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 rounded-lg text-xs font-semibold text-text-3 hover:text-text-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-border mt-2">
                <Link
                  href={`/${locale}/dashboard`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-text-3 hover:text-accent hover:bg-bg-soft"
                >
                  <Shield className="w-4 h-4 text-accent" />
                  <span>{isNe ? 'व्यवस्थापक पोर्टल (CMS)' : 'Editorial CMS'}</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
