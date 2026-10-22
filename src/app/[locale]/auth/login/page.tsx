'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { loginAction } from '@/lib/auth-actions';

interface LoginPageProps {
  params: {
    locale: string;
  };
}

export default function LoginPage({ params: { locale } }: LoginPageProps) {
  const router = useRouter();
  const isNe = locale === 'ne';

  const [email, setEmail] = useState('panditritesh005@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Live countdown timer for 10-minute lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMsg(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const res = await loginAction(null, formData);

      if (res?.isLocked) {
        setLockoutSeconds(res.remainingSeconds || 600);
        setErrorMsg(res.error);
        toast.error(res.error);
        setLoading(false);
        return;
      }

      if (res?.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
        setLoading(false);
        return;
      }

      if (res?.requireMfa) {
        toast.success(
          isNe ? 'पासवर्ड स्वीकृत भयो। कृपया MFA कोड प्रविष्ट गर्नुहोस्।' : 'Password verified. Please enter TOTP code.'
        );
        router.push(`/${locale}/auth/mfa`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
      toast.error('Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  const minutesRemaining = Math.floor(lockoutSeconds / 60);
  const secondsRemaining = lockoutSeconds % 60;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-accent-2/10 blur-3xl" />

      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8 relative z-10">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-block group">
            <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-accent shadow-md mb-4 group-hover:scale-105 transition-transform">
              <Image src="/logo.jpg" alt="YouTh Brain News" fill className="object-cover" priority />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>{isNe ? 'सुरक्षित व्यवस्थापक पोर्टल' : 'Editorial CMS Gateway'}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-1">
            {isNe ? 'व्यवस्थापक लगइन' : 'Editor-in-Chief Sign In'}
          </h1>
          <p className="text-xs text-text-3 mt-1">
            {isNe ? 'अधिकृत पोर्टल व्यवस्थापन प्रणाली' : 'Strictly restricted to authorized portal owner'}
          </p>
        </div>

        {/* 10-Minute Lockout Alert Banner */}
        {lockoutSeconds > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-accent-2/10 border border-accent-2/30 text-accent-2 flex items-start gap-3 animate-in fade-in">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {isNe ? 'खाता अस्थायी रूपमा बन्द (१० मिनेट)' : 'Account Locked (10 Minutes)'}
              </h4>
              <p className="text-xs mt-1 leading-relaxed">
                {isNe
                  ? `३ पटक लगातार असफल प्रयासका कारण खाता सुरक्षाका लागि १० मिनेट बन्द गरिएको छ। बाँकी समय: ${minutesRemaining} मिनेट ${secondsRemaining} सेकेन्ड`
                  : `Too many failed attempts. Security lockout active. Remaining time: ${minutesRemaining}m ${secondsRemaining}s`}
              </p>
            </div>
          </div>
        )}

        {/* Standard Error Notice */}
        {errorMsg && lockoutSeconds === 0 && (
          <div className="mb-6 p-3 rounded-xl bg-accent-2/10 border border-accent-2/30 text-accent-2 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5">
              {isNe ? 'अधिकृत इमेल' : 'Owner Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                readOnly
                value={email}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-2 text-text-1 text-sm font-medium cursor-not-allowed opacity-90"
              />
            </div>
            <p className="text-[11px] text-text-3 mt-1">
              {isNe ? 'यो प्रणाली panditritesh005@gmail.com का लागि मात्र सुरक्षित छ।' : 'Access locked exclusively to owner account.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5">
              {isNe ? 'गोप्य पासवर्ड' : 'Master Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={lockoutSeconds > 0}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutSeconds > 0}
            className="w-full mt-2 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>{isNe ? 'प्रमाणीकरण गर्दै...' : 'Verifying...'}</span>
            ) : lockoutSeconds > 0 ? (
              <span>{isNe ? `१० मिनेट लकआउट सक्रिय (${minutesRemaining}:${secondsRemaining < 10 ? '0' : ''}${secondsRemaining})` : `Locked (${minutesRemaining}:${secondsRemaining < 10 ? '0' : ''}${secondsRemaining})`}</span>
            ) : (
              <>
                <span>{isNe ? 'पासवर्ड प्रमाणित गर्नुहोस्' : 'Verify Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <Link
            href={`/${locale}`}
            className="text-xs text-text-3 hover:text-accent font-medium transition-colors"
          >
            ← {isNe ? 'सार्वजनिक गृहपृष्ठमा फर्कनुहोस्' : 'Return to Public Homepage'}
          </Link>
        </div>
      </div>
    </div>
  );
}
