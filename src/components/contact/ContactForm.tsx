'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContactFormProps {
  locale: string;
}

export function ContactForm({ locale }: ContactFormProps) {
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
    } catch {
      toast.error(isNe ? 'नेटवर्क त्रुटि भयो।' : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-12 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
        <h4 className="text-xl font-bold text-text-1">
          {isNe ? 'सन्देश सफलतापूर्वक पठाइयो!' : 'Message Sent Successfully!'}
        </h4>
        <p className="text-sm text-text-3 max-w-sm mx-auto">
          {isNe
            ? 'हाम्रो सम्पादकीय टोलीले यथाशीघ्र तपाईंको सन्देशको समीक्षा गर्नेछ।'
            : 'Our editorial desk will review your submission shortly.'}
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
          }}
          className="mt-4 px-4 py-2 rounded-xl bg-surface-2 border border-border text-xs font-semibold hover:border-accent"
        >
          {isNe ? 'अर्को सन्देश पठाउनुहोस्' : 'Send Another Message'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5">
            {isNe ? 'तपाईंको पूरा नाम' : 'Your Full Name'} *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={isNe ? 'उदा: रितेश शर्मा' : 'e.g. Ritesh Sharma'}
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
            placeholder="you@domain.com"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
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
  );
}
