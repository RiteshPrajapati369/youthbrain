'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';

interface ContactPageProps {
  params: {
    locale: string;
  };
}

export default function ContactPage({ params: { locale } }: ContactPageProps) {
  const isNe = locale === 'ne';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/${locale}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || (isNe ? 'सन्देश पठाउन असफल भयो।' : 'Failed to send message.'));
        setLoading(false);
        return;
      }

      setSubmitted(true);
      toast.success(
        isNe
          ? 'तपाईंको सन्देश सम्पादकीय डेस्कमा प्राप्त भयो। धन्यवाद!'
          : 'Your inquiry has been delivered to our editorial desk. Thank you!'
      );
    } catch (err) {
      toast.error(isNe ? 'नेटवर्क त्रुटि भयो।' : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar locale={locale} categories={[]} />

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
                  <p>{isNe ? 'काठमाडौँ, नेपाल' : 'Kathmandu, Nepal'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-bg-soft text-accent flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-1">{isNe ? 'इमेल' : 'Email'}</h4>
                  <p>panditritesh005@gmail.com</p>
                  <p>info@youthbrainnews.com.np</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-bg-soft text-accent flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-1">{isNe ? 'फोन' : 'Hotline'}</h4>
                  <p>+977-9800000000</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex items-center gap-2 text-xs text-text-3">
              <ShieldCheck className="w-4 h-4 text-accent-3 flex-shrink-0" />
              <span>
                {isNe
                  ? 'स्रोतको गोपनीयता र सुरक्षाको पूर्ण ग्यारेन्टी गरिन्छ।'
                  : 'Source confidentiality and data protection strictly guaranteed.'}
              </span>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent-3/15 text-accent-3 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-text-1">
                  {isNe ? 'सन्देश सफलतापूर्वक पठाइयो!' : 'Message Sent Successfully!'}
                </h3>
                <p className="text-sm text-text-2 max-w-md mx-auto">
                  {isNe
                    ? 'हाम्रो सम्पादकीय समूहले तपाईंको सन्देश अध्ययन गरेर चाँडै सम्पर्क गर्नेछ।'
                    : 'Our editorial team will review your dispatch and get in touch promptly.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90"
                >
                  {isNe ? 'अर्को सन्देश पठाउनुहोस्' : 'Send Another Message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5">
                    {isNe ? 'तपाईंको नाम' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isNe ? 'पूरा नाम लेख्नुहोस्' : 'Your full name'}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5">
                    {isNe ? 'इमेल ठेगाना' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={isNe ? 'example@domain.com' : 'you@example.com'}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5">
                    {isNe ? 'विषय' : 'Subject'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={isNe ? 'समाचार सुझाव वा सोधपुछ' : 'Story tip, inquiry, or partnership'}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5">
                    {isNe ? 'सन्देश विवरण' : 'Detailed Message'} *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={isNe ? 'आफ्नो सन्देश यहाँ स्पष्टसँग लेख्नुहोस्...' : 'Write your full message here...'}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {loading
                      ? isNe ? 'पठाउँदै...' : 'Sending...'
                      : isNe ? 'सन्देश पठाउनुहोस्' : 'Send Message'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer locale={locale} socialLinks={[]} />
    </div>
  );
}
