import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Youtube, Linkedin, Shield, Mail, Phone, MapPin } from 'lucide-react';
import type { SocialLink } from '@/types';

interface FooterProps {
  locale: string;
  socialLinks?: SocialLink[];
}

export function Footer({ locale, socialLinks }: FooterProps) {
  const isNe = locale === 'ne';

  const defaultSocials = [
    { platform: 'facebook', url: 'https://facebook.com/youthbrainnews', icon: Facebook },
    { platform: 'twitter', url: 'https://twitter.com/youthbrainnews', icon: Twitter },
    { platform: 'youtube', url: 'https://youtube.com/@youthbrainnews', icon: Youtube },
    { platform: 'linkedin', url: 'https://linkedin.com/company/youthbrainnews', icon: Linkedin },
  ];

  return (
    <footer className="border-t border-border bg-surface text-text-2 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-5">
            <Link href={`/${locale}`} className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-accent">
                <Image
                  src="/logo.jpg"
                  alt="YouTh Brain News"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-extrabold text-xl text-text-1">
                {isNe ? 'युथ ब्रेन न्युज' : 'YouTh Brain News'}
              </span>
            </Link>
            <p className="text-sm text-text-3 max-w-sm leading-relaxed mb-4">
              {isNe
                ? 'नेपालको स्वतन्त्र तथा निष्पक्ष डिजिटल समाचार पोर्टल। सत्य, तथ्य र विश्लेषणका साथ युवा नवप्रवर्तन र राष्ट्रिय घटनाहरूको निरन्तर कभरेज।'
                : 'Premier independent digital news portal committed to verified journalism, youth innovation, and comprehensive coverage across Nepal and beyond.'}
            </p>
            <div className="flex items-center space-x-3 text-text-3">
              {defaultSocials.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.platform}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center hover:text-accent hover:border-accent transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-sm text-text-1 uppercase tracking-wider mb-4">
              {isNe ? 'महत्वपूर्ण लिङ्कहरू' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}`} className="hover:text-accent transition-colors">
                  {isNe ? 'गृहपृष्ठ' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/news`} className="hover:text-accent transition-colors">
                  {isNe ? 'सम्पूर्ण समाचार' : 'All News'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/category/technology`} className="hover:text-accent transition-colors">
                  {isNe ? 'सूचना प्रविधि' : 'Technology'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/category/politics`} className="hover:text-accent transition-colors">
                  {isNe ? 'राजनीति' : 'Politics'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/category/youth`} className="hover:text-accent transition-colors">
                  {isNe ? 'युवा र उद्यम' : 'Youth & Startups'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="hover:text-accent transition-colors">
                  {isNe ? 'हाम्रोबारे' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-accent transition-colors">
                  {isNe ? 'सम्पर्क' : 'Contact Us'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial & Contact Info */}
          <div className="md:col-span-4">
            <h4 className="font-bold text-sm text-text-1 uppercase tracking-wider mb-4">
              {isNe ? 'सम्पर्क र सम्पादकीय' : 'Editorial Desk'}
            </h4>
            <div className="space-y-2.5 text-sm text-text-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{isNe ? 'काठमाडौँ, नेपाल' : 'Kathmandu, Nepal'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <span>panditritesh005@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <span>+977-9800000000</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link
                href={`/${locale}/dashboard`}
                className="inline-flex items-center gap-1.5 text-xs text-text-3 hover:text-accent transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isNe ? 'व्यवस्थापक CMS लगइन' : 'Editor CMS Login'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-3 gap-3">
          <p>
            {isNe
              ? '© २०२६ YouTh Brain News (youthbrainnews.com.np)। सर्वाधिकार सुरक्षित।'
              : '© 2026 YouTh Brain News (youthbrainnews.com.np). All rights reserved.'}
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-accent font-medium">
              {isNe ? 'प्रधान सम्पादक: रितेश प्रजापति' : 'Editor-in-Chief: Ritesh Prajapati'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
