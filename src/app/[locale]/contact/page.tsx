import React from 'react';
import type { Metadata } from 'next';
import { Mail, Phone, MapPin, ShieldCheck, Share2 } from 'lucide-react';
import { getCategories, getOwnerProfile, getSocialLinks } from '@/lib/services';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';
import { ContactForm } from '@/components/contact/ContactForm';

interface ContactPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: ContactPageProps): Promise<Metadata> {
  const isNe = locale === 'ne';
  return {
    title: isNe ? 'सम्पर्क - युथ ब्रेन न्युज' : 'Contact Us - YouTh Brain News',
    description: isNe
      ? 'YouTh Brain News को सम्पादकीय टोलीलाई समाचार, सुझाव वा सोधपुछ पठाउनुहोस्।'
      : 'Connect with the YouTh Brain News editorial desk for tips, inquiries, and press releases.',
  };
}

export default async function ContactPage({ params: { locale } }: ContactPageProps) {
  const isNe = locale === 'ne';
  const [categories, profile, socialLinks] = await Promise.all([
    getCategories(),
    getOwnerProfile(),
    getSocialLinks(),
  ]);

  const location = profile?.location || (isNe ? 'हेटौँडा, नेपाल' : 'Hetauda, Nepal');
  const primaryEmail = profile?.email || 'panditritesh005@gmail.com';
  const secondaryEmail = (profile as any)?.secondary_email || 'info@youthbrain.com.np';
  const phone = profile?.phone || '+977-9800000000';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar locale={locale} categories={categories} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-1 tracking-tight">
            {isNe ? 'हामीलाई सम्पर्क गर्नुहोस्' : 'Contact Editorial Desk'}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-text-2">
            {isNe
              ? 'समाचार सुझाव, गोप्य सूचना, सोधपुछ वा सम्पादकीय सहकार्यका लागि सिधै सम्पर्क गर्नुहोस्।'
              : 'Direct hotline for news tips, editorial pitches, press releases, and investigative leads.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-text-1">
              {isNe ? 'कार्यालय ठेगाना र विवरण' : 'Editorial Office'}
            </h3>

            <div className="space-y-4 text-sm text-text-2">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-bg-soft text-accent flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-1">{isNe ? 'ठेगाना' : 'Location'}</h4>
                  <p>{location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-bg-soft text-accent flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-1">{isNe ? 'इमेल ठेगाना' : 'Email'}</h4>
                  <p>
                    <a href={`mailto:${primaryEmail}`} className="hover:text-accent">
                      {primaryEmail}
                    </a>
                  </p>
                  {secondaryEmail && (
                    <p>
                      <a href={`mailto:${secondaryEmail}`} className="hover:text-accent text-xs text-text-3">
                        {secondaryEmail}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-bg-soft text-accent flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-1">{isNe ? 'फोन' : 'Hotline'}</h4>
                  <p>
                    <a href={`tel:${phone}`} className="hover:text-accent">
                      {phone}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {socialLinks && socialLinks.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-xs text-text-3 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-accent" />
                  <span>{isNe ? 'सामाजिक सञ्जालमा जोडिनुहोस्' : 'Connect Online'}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-medium text-text-2 hover:border-accent hover:text-accent transition-all"
                    >
                      {s.label || s.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border flex items-center gap-2 text-xs text-text-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                {isNe
                  ? 'स्रोतको गोपनीयता र सुरक्षाको पूर्ण प्रत्याभूति गरिन्छ।'
                  : 'Source confidentiality and whistle-blower security strictly guaranteed.'}
              </span>
            </div>
          </div>

          {/* Interactive Contact Form Card */}
          <div className="lg:col-span-7 bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-sm">
            <h3 className="text-xl font-bold text-text-1 mb-2">
              {isNe ? 'अनलाइन सन्देश पठाउनुहोस्' : 'Send an Inquiry'}
            </h3>
            <p className="text-xs text-text-3 mb-6">
              {isNe
                ? 'समाचार सुझाव, विज्ञप्ति वा सम्पादकीय प्रश्नका लागि तलको फारम भर्नुहोस्।'
                : 'Fill out the form below to reach the editorial desk directly.'}
            </p>

            <ContactForm locale={locale} />
          </div>
        </div>
      </main>

      <Footer locale={locale} socialLinks={socialLinks} profile={profile} />
    </div>
  );
}
