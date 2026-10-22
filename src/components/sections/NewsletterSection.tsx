'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface NewsletterSectionProps {
  locale: string;
}

export function NewsletterSection({ locale }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const isNe = locale === 'ne';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(isNe ? 'कृपया मान्य इमेल प्रविष्ट गर्नुहोस्।' : 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    // Simulate or call contact endpoint
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success(
        isNe
          ? 'समाचार बुलेटिनमा स्वागत छ! सदस्यता सफल भयो।'
          : 'Thank you for subscribing to our news bulletin!'
      );
    }, 600);
  };

  return (
    <section className="py-12 bg-bg-soft/50 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex p-3 rounded-full bg-accent/10 text-accent mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text-1">
          {isNe ? 'दैनिक समाचार बुलेटिन' : 'Daily Editorial Bulletin'}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-text-2 max-w-xl mx-auto">
          {isNe
            ? 'सत्य, तथ्य र गम्भीर खोज पत्रकारिता सिधै तपाईंको इनबक्समा। कुनै स्प्याम छैन।'
            : 'Get verified journalism and essential updates delivered straight to your inbox. No spam.'}
        </p>

        {submitted ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-accent-3 font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isNe ? 'तपाईंको सदस्यता दर्ता भयो। धन्यवाद!' : 'Subscription confirmed. Thank you!'}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isNe ? 'तपाईंको इमेल ठेगाना...' : 'Enter your email address...'}
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface text-text-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (isNe ? 'दर्ता हुँदै...' : 'Subscribing...') : (isNe ? 'सदस्य बन्नुहोस्' : 'Subscribe')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
