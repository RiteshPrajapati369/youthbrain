import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
  Shield,
  Mail,
  Phone,
  MapPin,
  Globe,
  MessageCircle,
} from 'lucide-react';
import type { SocialLink, Profile } from '@/types';

interface FooterProps {
  locale: string;
  socialLinks?: SocialLink[];
  profile?: (Profile & { secondary_email?: string }) | null;
}

export function Footer({ locale, socialLinks = [], profile }: FooterProps) {
  const isNe = locale === 'ne';

  // Helper for social icons
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return Facebook;
      case 'twitter':
      case 'x':
        return Twitter;
      case 'youtube':
        return Youtube;
      case 'linkedin':
        return Linkedin;
      case 'instagram':
        return Instagram;
      case 'whatsapp':
      case 'telegram':
        return MessageCircle;
      default:
        return Globe;
    }
  };

  // Determine active channels
  const activeSocials =
    socialLinks && socialLinks.filter((s) => s.is_active && s.url).length > 0
      ? socialLinks.filter((s) => s.is_active && s.url)
      : [
          { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/youthbrainnews' },
          { platform: 'twitter', label: 'X (Twitter)', url: 'https://twitter.com/youthbrainnews' },
          { platform: 'youtube', label: 'YouTube', url: 'https://youtube.com/@youthbrainnews' },
          { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/youthbrainnews' },
        ];

  const email = profile?.email || 'panditritesh005@gmail.com';
  const phone = profile?.phone || '+977-9800000000';
  const location = profile?.location || (isNe ? 'हेटौँडा, नेपाल' : 'Hetauda, Nepal');
  const editorName = profile?.full_name || (isNe ? 'रितेश प्रजापति' : 'Ritesh Prajapati');

  return (
    <footer className="border-t border-border bg-surface text-text-2 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-5">
            <Link href={`/${locale}`} className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-accent">
                <Image
                  src={profile?.avatar_url || '/logo.jpg'}
                  alt="YouTh Brain News"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-extrabold text-xl text-text-1">
                {isNe ? 'युथ ब्रेन न्युज' : 'YouTh Brain News'}
              </span>
            </Link>
            <p className="text-sm text-text-3 max-w-sm leading-relaxed mb-5">
              {isNe
                ? 'नेपालको स्वतन्त्र तथा निष्पक्ष डिजिटल समाचार पोर्टल। सत्य, तथ्य र विश्लेषणका साथ युवा नवप्रवर्तन र राष्ट्रिय घटनाहरूको निरन्तर कभरेज।'
                : 'Premier independent digital news portal committed to verified journalism, youth innovation, and comprehensive coverage across Nepal and beyond.'}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 text-text-3">
              {activeSocials.map((item) => {
                const Icon = getSocialIcon(item.platform);
                return (
                  <a
                    key={item.platform + item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.label || item.platform}
                    className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center hover:text-accent hover:border-accent hover:scale-110 transition-all shadow-sm"
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
              {isNe ? 'महत्वपूर्ण विधा' : 'Categories'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}`} className="hover:text-accent transition-colors">
                  {isNe ? 'गृहपृष्ठ' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/category/politics`} className="hover:text-accent transition-colors">
                  {isNe ? 'राजनीति' : 'Politics'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/category/society`} className="hover:text-accent transition-colors">
                  {isNe ? 'समाज' : 'Society'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/category/economy`} className="hover:text-accent transition-colors">
                  {isNe ? 'अर्थ' : 'Economy'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/category/science-tech`} className="hover:text-accent transition-colors">
                  {isNe ? 'विज्ञान तथा प्रविधि' : 'Science & Tech'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/category/sports`} className="hover:text-accent transition-colors">
                  {isNe ? 'खेलकुद' : 'Sports'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/category/interview`} className="hover:text-accent transition-colors">
                  {isNe ? 'अन्तर्वार्ता' : 'Interview'}
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
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-accent transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-accent transition-colors">
                  {phone}
                </a>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <Link
                href={`/${locale}/contact`}
                className="text-xs font-semibold text-accent hover:underline"
              >
                {isNe ? 'विस्तृत सम्पर्क पृष्ठ →' : 'Contact Us Page →'}
              </Link>
              <Link
                href={`/${locale}/dashboard`}
                className="inline-flex items-center gap-1.5 text-xs text-text-3 hover:text-accent transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isNe ? 'व्यवस्थापक CMS' : 'Editor CMS'}</span>
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
              {isNe ? `प्रधान सम्पादक: ${editorName}` : `Editor-in-Chief: ${editorName}`}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
