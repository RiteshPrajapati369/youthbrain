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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/80 transition-colors">
      {/* Top Utility Bar */}
      <div className="hidden md:block border-b border-border bg-surface/50 text-xs text-text-3 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-text-2">{currentDateFormatted}</span>
            <span>•</span>
            <span className="text-accent font-semibold">{isNe ? 'हेटौँडा, नेपाल' : 'Hetauda, Nepal'}</span>
          </div>

          {/* Time in HH:MM:SS format replaces Editor CMS */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-accent bg-bg-soft px-3 py-1 rounded-full border border-border/80 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>{timeString || '--:--:--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Portal Identity */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden border-2 border-accent shadow-sm flex-shrink-0">
              <Image
                src="/logo.jpg"
                alt="YouTh Brain News Logo"
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-text-1 group-hover:text-accent transition-colors leading-tight">
                {isNe ? 'युथ ब्रेन न्युज' : 'YouTh Brain News'}
              </span>
              <span className="text-[10px] sm:text-xs text-text-3 tracking-wider uppercase font-medium">
                {isNe ? 'सत्य, तथ्य र निष्पक्ष' : 'Truth, Facts & Impartial'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Priority Categories */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
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

          {/* Large desktop secondary links */}
          <nav className="hidden lg:flex xl:hidden items-center space-x-1">
            {navLinks.slice(0, 5).map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-accent bg-bg-soft font-bold'
                      : 'text-text-2 hover:text-text-1 hover:bg-surface'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Theme Toggle, Language Switcher, Mobile Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Time on mobile/tablet */}
            <div className="md:hidden flex items-center gap-1 font-mono text-[11px] font-bold text-accent bg-bg-soft px-2 py-1 rounded-full border border-border">
              <Clock className="w-3 h-3 text-accent" />
              <span>{timeString || '--:--:--'}</span>
            </div>

            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle />

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-text-2 hover:text-text-1 hover:bg-surface border border-border"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-surface p-4 transition-all animate-in slide-in-from-top-2">
          <div className="pb-2 mb-2 border-b border-border text-xs text-text-3 font-semibold flex items-center justify-between">
            <span>{isNe ? 'हेटौँडा, नेपाल' : 'Hetauda, Nepal'}</span>
            <span className="font-mono text-accent">{timeString}</span>
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
  );
}
