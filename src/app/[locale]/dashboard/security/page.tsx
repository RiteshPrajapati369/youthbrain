'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { LoginAttempt } from '@/types';

interface SecurityPageProps {
  params: {
    locale: string;
  };
}

export default function DashboardSecurityPage({ params: { locale } }: SecurityPageProps) {
  const isNe = locale === 'ne';
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [mfaData, setMfaData] = useState<{
    secret: string;
    is_verified: boolean;
    qrCodeDataUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const loadSecurityData = async () => {
    try {
      const res = await fetch(`/${locale}/api/dashboard/security`);
      if (res.ok) {
        const data = await res.json();
        setAttempts(data.attempts || []);
        if (data.mfaFactor) setMfaData(data.mfaFactor);
      }
    } catch {
      toast.error('Failed to load security logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const handleResetLockout = async () => {
    setResetting(true);
    try {
      const res = await fetch(`/${locale}/api/dashboard/security`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_lockout' }),
      });

      if (res.ok) {
        toast.success(isNe ? 'असफल प्रयासहरू रिसेट गरियो। १०-मिनेट लकआउट हटाइयो।' : 'Failed login attempts cleared. Lockout timer reset.');
        loadSecurityData();
      } else {
        toast.error('Reset failed');
      }
    } catch {
      toast.error('Error resetting lockout');
    } finally {
      setResetting(false);
    }
  };

  const copySecret = () => {
    if (mfaData?.secret) {
      navigator.clipboard.writeText(mfaData.secret);
      toast.success(isNe ? 'MFA Secret कपी गरियो!' : 'MFA Secret copied to clipboard!');
    }
  };

  return (
    <div>
      <DashboardHeader
        title={isNe ? 'सुरक्षा नियन्त्रण र अडिट लग' : 'Security Operations & Audit Logs'}
        subtitle={isNe ? 'TOTP MFA प्रमाणीकरण, १०-मिनेट लकआउट नीति र लगइन प्रयास अनुगमन' : 'Single-owner boundary, 10-minute lockout monitor, and real-time security events'}
        locale={locale}
      />

      {/* Security Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: 10-Minute Lockout Rule */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-3 uppercase tracking-wider">
              {isNe ? 'लकआउट नीति' : 'Lockout Policy'}
            </span>
            <div className="p-2 rounded-xl bg-accent-2/10 text-accent-2">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-text-1">
            {isNe ? '३ प्रयास → १० मिनेट लक' : '3 Attempts → 10m Lock'}
          </h3>
          <p className="text-xs text-text-3 mt-1 leading-relaxed">
            {isNe
              ? 'लगातार ३ पटक गलत पासवर्ड प्रयास भएमा खाता सर्भर-स्तरमा १० मिनेटका लागि पूर्ण बन्द हुन्छ।'
              : 'Enforced strictly across all devices and IPs. Timer resets after 10 minutes.'}
          </p>
          <div className="mt-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleResetLockout}
              disabled={resetting}
              className="w-full py-2 rounded-xl bg-surface-2 hover:bg-border text-xs font-bold text-text-1 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? '...' : (isNe ? 'असफल प्रयास रिसेट गर्नुहोस्' : 'Reset Lockout Attempts')}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Single Owner Boundary */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-3 uppercase tracking-wider">
              {isNe ? 'अधिकृत खाता' : 'Owner Boundary'}
            </span>
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-text-1 truncate">
            panditritesh005@gmail.com
          </h3>
          <p className="text-xs text-text-3 mt-1 leading-relaxed">
            {isNe
              ? 'खुला दर्ता पूर्ण बन्द छ। अन्य कुनै पनि खातालाई प्रशासनिक अनुमति छैन।'
              : 'Public registrations disabled. All foreign logins immediately terminated.'}
          </p>
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs font-semibold text-accent-3">
            <CheckCircle className="w-4 h-4" />
            <span>{isNe ? 'सुरक्षित सीमा सक्रिय' : 'Boundary Active'}</span>
          </div>
        </div>

        {/* Card 3: TOTP MFA Factor */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-3 uppercase tracking-wider">
              MFA Issuer
            </span>
            <div className="p-2 rounded-xl bg-accent-3/10 text-accent-3">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-text-1">
            YouTh Brain News
          </h3>
          <p className="text-xs text-text-3 mt-1 leading-relaxed">
            {isNe
              ? 'गुगल अथेन्टिकेटर (Google Authenticator) मा समय-आधारित ओटीपी अनिवार्य छ।'
              : 'RFC 6238 TOTP enforced on 100% of owner password verifications.'}
          </p>
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs font-semibold text-accent-3">
            <CheckCircle className="w-4 h-4" />
            <span>{isNe ? 'MFA अनिवार्य सक्रिय' : 'MFA Enforced'}</span>
          </div>
        </div>
      </div>

      {/* MFA Authenticator Enrollment & QR Code */}
      {mfaData?.qrCodeDataUrl && (
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-sm mb-8">
          <h3 className="text-lg font-bold text-text-1 mb-2 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-accent" />
            <span>{isNe ? 'गुगल अथेन्टिकेटर सेटअप (QR Code)' : 'Google Authenticator Enrollment'}</span>
          </h3>
          <p className="text-xs text-text-3 mb-6">
            {isNe
              ? 'आफ्नो मोबाइलको गुगल अथेन्टिकेटर एपबाट यो QR कोड स्क्यान गर्नुहोस् (Issuer: YouTh Brain News)'
              : 'Scan this QR code with Google Authenticator to synchronize 6-digit TOTP passcodes.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-border flex-shrink-0">
              <Image
                src={mfaData.qrCodeDataUrl}
                alt="MFA QR Code"
                width={180}
                height={180}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                  {isNe ? 'MFA गोप्य कुञ्जी (Secret Key)' : 'Base32 Secret Key'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={mfaData.secret}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-primary font-mono text-xs font-bold text-text-1"
                  />
                  <button
                    type="button"
                    onClick={copySecret}
                    className="p-2 rounded-lg bg-surface-2 hover:bg-border text-text-1"
                    title="Copy Secret"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs leading-relaxed">
                <strong>{isNe ? 'सुरक्षा सूचना:' : 'Security Note:'}</strong>{' '}
                {isNe
                  ? 'यो गोप्य कुञ्जी सुरक्षित राख्नुहोस्। लगइन गर्दा हरेक पटक यसै कुञ्जीबाट ६-अंकको कोड आवश्यक पर्दछ।'
                  : 'Store this secret safely. You will need the rotating 6-digit passcode on every sign-in.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Attempts Audit Log Table */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-text-1">
              {isNe ? 'लगइन प्रयास अडिट लग' : 'Login Attempts Audit History'}
            </h3>
            <p className="text-xs text-text-3 mt-0.5">
              {isNe
                ? '१०-मिनेट लकआउट प्रणालीद्वारा रेकर्ड गरिएका पछिल्ला प्रयासहरू'
                : 'Real-time telemetry monitored by the 10-minute lockout defense system'}
            </p>
          </div>
          <span className="text-xs font-bold text-text-3">
            {isNe ? `कुल रेकर्ड: ${attempts.length}` : `Records: ${attempts.length}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 text-text-3 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{isNe ? 'इमेल' : 'Email'}</th>
                <th className="py-3 px-4">{isNe ? 'मिति / समय' : 'Timestamp'}</th>
                <th className="py-3 px-4">{isNe ? 'नतिजा' : 'Outcome'}</th>
                <th className="py-3 px-4">{isNe ? 'आईपी ठेगाना' : 'IP Address'}</th>
                <th className="py-3 px-4">{isNe ? 'कारण' : 'Reason / Note'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-3">
                    {isNe ? 'लग लोड हुँदैछ...' : 'Loading audit entries...'}
                  </td>
                </tr>
              ) : attempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-3">
                    {isNe ? 'कुनै लगइन प्रयास भेटिएन।' : 'No login attempt records recorded.'}
                  </td>
                </tr>
              ) : (
                attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-1">
                      {att.email}
                    </td>
                    <td className="py-3 px-4 text-text-3 font-mono">
                      {new Date(att.attempt_time).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {att.success ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-3/15 text-accent-3">
                          <CheckCircle className="w-3 h-3" />
                          SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-2/15 text-accent-2">
                          <XCircle className="w-3 h-3" />
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-text-2 font-mono">
                      {att.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-text-3 max-w-xs truncate">
                      {att.failure_reason || (att.success ? 'Owner Authenticated' : '—')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
