'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { verifyMfaAction } from '@/lib/auth-actions';

interface MfaPageProps {
  params: {
    locale: string;
  };
}

function getSafeRedirectUrl(target: string | null, locale: string): string {
  if (!target || typeof target !== 'string') return `/${locale}/dashboard`;
  if (target.includes('://') || target.startsWith('//') || target.includes('\\')) {
    return `/${locale}/dashboard`;
  }
  if (target.startsWith(`/${locale}/dashboard`) || target === `/${locale}`) {
    return target;
  }
  return `/${locale}/dashboard`;
}

function MfaFormContent({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNe = locale === 'ne';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast.error(isNe ? 'कृपया ६ अंकको कोड प्रविष्ट गर्नुहोस्।' : 'Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('code', code);

    try {
      const res = await verifyMfaAction(null, formData);

      if (res?.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
        setLoading(false);
        return;
      }

      if (res?.success) {
        toast.success(
          isNe
            ? 'सुरक्षित लगइन सफल भयो! ड्यासबोर्डमा स्वागत छ।'
            : 'MFA Verified! Redirecting to CMS Dashboard...'
        );
        const target = getSafeRedirectUrl(searchParams.get('redirect'), locale);
        router.push(target);
        router.refresh();
      }
    } catch {
      setErrorMsg(isNe ? 'MFA प्रमाणीकरण असफल भयो।' : 'MFA validation failed.');
      toast.error(isNe ? 'प्रमाणीकरण असफल भयो।' : 'Validation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-accent-3/10 blur-3xl" />

      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8 relative z-10">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="w-full flex justify-center items-center mb-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-accent shadow-md flex-shrink-0">
              <Image src="/logo.jpg" alt="YouTh Brain News" fill className="object-cover" priority />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-3/10 text-accent-3 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isNe ? 'दोस्रो-तह प्रमाणीकरण (२FA)' : 'Two-Factor Authentication'}</span>
          </div>

          <h1 className="text-2xl font-extrabold text-text-1">
            {isNe ? 'TOTP कोड प्रविष्ट गर्नुहोस्' : 'Enter Authenticator Code'}
          </h1>
          <p className="text-xs text-text-3 mt-1">
            {isNe
              ? 'गुगल अथेन्टिकेटर (YouTh Brain News) मा देखिने ६-अंकको कोड'
              : 'Google Authenticator issuer: YouTh Brain News'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-accent-2/10 border border-accent-2/30 text-accent-2 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-2 text-center">
              {isNe ? '६-अंकको प्रमाणीकरण कोड' : '6-Digit TOTP Code'}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-xl border border-border bg-bg-primary text-text-1 focus:outline-none focus:ring-2 focus:ring-accent font-bold"
              />
            </div>
            <p className="text-[11px] text-text-3 mt-2 text-center">
              {isNe
                ? 'समय-आधारित ३० सेकेन्डको सुरक्षा कोड प्रयोग गर्नुहोस्।'
                : 'Enter the current 30-second rotating security passcode.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>{isNe ? 'जाँच गर्दै...' : 'Verifying...'}</span>
            ) : (
              <>
                <span>{isNe ? 'कोड प्रमाणित गर्नुहोस् र प्रवेश गर्नुहोस्' : 'Verify & Enter Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-xs text-text-3">
          <Link
            href={`/${locale}/auth/login`}
            className="hover:text-accent font-medium transition-colors"
          >
            ← {isNe ? 'लगइनमा फर्कनुहोस्' : 'Back to Login'}
          </Link>
          <span className="text-[10px] text-text-3">YouTh Brain Security</span>
        </div>
      </div>
    </div>
  );
}

export default function MfaPage({ params: { locale } }: MfaPageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-3">
          Loading...
        </div>
      }
    >
      <MfaFormContent locale={locale} />
    </React.Suspense>
  );
}
