import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { ShieldCheck, Award, Target, Users } from 'lucide-react';
import { getCategories, getOwnerProfile, getSocialLinks } from '@/lib/services';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';

interface AboutPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: AboutPageProps): Promise<Metadata> {
  const isNe = locale === 'ne';
  return {
    title: isNe ? 'हाम्रोबारे - युथ ब्रेन न्युज' : 'About Us - YouTh Brain News',
    description: isNe
      ? 'YouTh Brain News को सम्पादकीय मिसन, मूल्य र सम्पादकीय समूहको परिचय।'
      : 'Editorial mission, core values, and editorial leadership of YouTh Brain News.',
  };
}

export default async function AboutPage({ params: { locale } }: AboutPageProps) {
  const [categories, profile, socialLinks] = await Promise.all([
    getCategories(),
    getOwnerProfile(),
    getSocialLinks(),
  ]);

  const isNe = locale === 'ne';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar locale={locale} categories={categories} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden border-4 border-accent mb-6 shadow-md">
            <Image src="/logo.jpg" alt="YouTh Brain News Logo" fill className="object-cover" priority />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-1 tracking-tight">
            {isNe ? 'युथ ब्रेन न्युजको बारेमा' : 'About YouTh Brain News'}
          </h1>
          <p className="mt-4 text-base sm:text-xl text-text-2 max-w-2xl mx-auto leading-relaxed">
            {isNe
              ? 'सत्य, तथ्य र निष्पक्ष खोज पत्रकारिताको माध्यमबाट नेपाली समाज र विश्वव्यापी युवा पुस्तालाई सशक्त बनाउने डिजिटल समाचार मञ्च।'
              : 'A modern digital journalism platform committed to empowering Nepali youth and global readers through fact-checked, impartial, and impactful news.'}
          </p>
        </div>

        {/* Pillars / Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-1 mb-2">
              {isNe ? 'तथ्य जाँच र निष्पक्षता' : 'Fact-Checking & Truth'}
            </h3>
            <p className="text-sm text-text-3 leading-relaxed">
              {isNe
                ? 'हामी हरेक समाचारलाई बहुपक्षीय स्रोतहरूबाट पुष्टि गरेर मात्र प्रकाशन गर्दछौँ।'
                : 'Every report is verified through primary sources and rigorous editorial scrutiny before publication.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-accent-2/10 text-accent-2 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-1 mb-2">
              {isNe ? 'युवा र नवप्रवर्तन केन्द्रित' : 'Youth & Innovation'}
            </h3>
            <p className="text-sm text-text-3 leading-relaxed">
              {isNe
                ? 'नेपाली युवाहरूको स्टार्टअप, सूचना प्रविधि र नेतृत्व लहरलाई प्राथमिकता दिन्छौँ।'
                : 'Spotlighting youth entrepreneurship, IT talent, leadership, and transformative ideas shaping the future.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-accent-3/10 text-accent-3 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-1 mb-2">
              {isNe ? 'डिजिटल पारदर्शिता' : 'Digital Integrity'}
            </h3>
            <p className="text-sm text-text-3 leading-relaxed">
              {isNe
                ? 'आधुनिक क्लाउड र एज आर्किटेक्चरमार्फत पाठकको गोपनीयता र सुरक्षाको पूर्ण प्रत्याभूति।'
                : 'Built with edge-native speed, hardened security, and unwavering respect for reader privacy.'}
            </p>
          </div>
        </div>

        {/* Editor Leadership Profile */}
        <div className="p-8 rounded-2xl bg-surface border border-border shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-accent flex-shrink-0">
              <Image src="/logo.jpg" alt="Ritesh Prajapati" fill className="object-cover" />
            </div>
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                {isNe ? 'संस्थापक तथा प्रधान सम्पादक' : 'Founder & Editor-in-Chief'}
              </span>
              <h2 className="text-2xl font-bold text-text-1 mt-1">
                {profile?.full_name || 'Ritesh Prajapati'}
              </h2>
              <p className="text-sm text-text-3 mt-1">
                {profile?.headline || 'Journalist, Technologist & Digital Media Innovator'}
              </p>
              <p className="text-sm text-text-2 mt-3 leading-relaxed">
                {profile?.bio ||
                  'Dedicated to elevating the standards of independent digital news in Nepal through technological excellence, open-source principles, and fearless reporting.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} socialLinks={socialLinks} profile={profile} />
    </div>
  );
}
