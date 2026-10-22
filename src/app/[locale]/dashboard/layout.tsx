import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/owner-auth';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

interface DashboardLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default async function DashboardLayout({
  children,
  params: { locale },
}: DashboardLayoutProps) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  // Cryptographic Fast-Path Verification (< 0.1ms)
  const session = await verifySessionToken(sessionToken);
  if (!session || !session.mfaVerified) {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <div className="min-h-screen flex bg-bg-primary">
      <DashboardNav locale={locale} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
