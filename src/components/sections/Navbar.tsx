'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Newspaper } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import type { Category } from '@/types';

interface NavbarProps {
  locale: string;
  categories: Category[];
}

export function Navbar({ locale, categories }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isNe = locale === 'ne';

  const navLinks = [
    { href: `/${locale}`, label: isNe ? 'गृहपृष्ठ' : 'Home' },
    { href: `/${locale}/news`, label: isNe ? 'समाचार' : 'News' },
    { href: `/${locale}/category/technology`, label: isNe ? 'प्रविधि' : 'Technology' },
    { href: `/${locale}/category/politics`, label: isNe ? 'राजनीति' : 'Politics' },
    { href: `/${locale}/category/youth`, label: isNe ? 'युवा' : 'Youth' },
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
            <span className="text-accent font-semibold">{isNe ? 'काठमाडौँ, नेपाल' : 'Kathmandu, Nepal'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/${locale}/dashboard`}
              className="flex items-center gap-1 text-text-2 hover:text-accent font-medium transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>{isNe ? 'व्यवस्थापक CMS' : 'Editor CMS'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Portal Identity */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-accent bg-bg-soft'
                      : 'text-text-2 hover:text-text-1 hover:bg-surface'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Theme Toggle, Language Switcher, CMS Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
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
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-base font-semibold ${
                  pathname === link.href
                    ? 'text-accent bg-bg-soft'
                    : 'text-text-1 hover:bg-surface-2'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border mt-2">
              <Link
                href={`/${locale}/dashboard`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-bold text-accent hover:bg-bg-soft"
              >
                <Shield className="w-5 h-5" />
                <span>{isNe ? 'व्यवस्थापक लगइन / ड्यासबोर्ड' : 'Editor Dashboard'}</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
