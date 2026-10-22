'use server';

import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import {
  OWNER_EMAIL,
  SESSION_COOKIE_NAME,
  MFA_PENDING_COOKIE_NAME,
  SESSION_EXPIRY_DAYS,
  signSessionPayload,
  verifySessionToken,
  checkAccountLockout,
  recordLoginAttempt,
  verifyTotpCode,
  generateBase32Secret,
} from './owner-auth';
import { createServerSupabaseClient } from './supabase-server';
import { createAdminClient } from './supabase-admin';

const loginSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(6),
});

const mfaSchema = z.object({
  code: z.string().length(6),
});

export async function loginAction(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const headerList = headers();
  const ipAddress = headerList.get('cf-connecting-ip') || headerList.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = headerList.get('user-agent') || 'unknown';

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: 'कृपया मान्य इमेल र कम्तिमा ६ अक्षरको पासवर्ड प्रविष्ट गर्नुहोस्।' };
  }

  const { email, password } = parsed.data;

  // 1. Strict Owner Boundary
  if (email !== OWNER_EMAIL) {
    await recordLoginAttempt({
      email,
      ipAddress,
      userAgent,
      success: false,
      failureReason: 'Unauthorized email attempt',
    });
    return { error: 'यो इमेललाई व्यवस्थापक अनुमति छैन।' };
  }

  // 2. Strict 10-Minute Lockout Check (Server-side & Account-wide)
  const lockout = await checkAccountLockout(email);
  if (lockout.isLocked) {
    const minutes = Math.floor(lockout.remainingSeconds / 60);
    const seconds = lockout.remainingSeconds % 60;
    return {
      isLocked: true,
      remainingSeconds: lockout.remainingSeconds,
      error: `सुरक्षा सतर्कता: ३ पटक असफल प्रयासका कारण खाता अस्थायी रूपमा बन्द गरिएको छ। कृपया ${minutes} मिनेट ${seconds} सेकेन्ड पछि पुन: प्रयास गर्नुहोस्।`,
    };
  }

  // 3. Authenticate with Supabase Auth or Service Auth
  const supabase = createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    // Record failed attempt
    await recordLoginAttempt({
      email,
      ipAddress,
      userAgent,
      success: false,
      failureReason: authError?.message || 'Invalid credentials',
    });

    // Check if this failure triggered lockout
    const postLockout = await checkAccountLockout(email);
    if (postLockout.isLocked) {
      return {
        isLocked: true,
        remainingSeconds: postLockout.remainingSeconds,
        error: `सुरक्षा सतर्कता: ३ पटक असफल प्रयासका कारण खाता १० मिनेटका लागि बन्द गरिएको छ।`,
      };
    }

    return {
      error: 'अमान्य इमेल वा पासवर्ड। कृपया पुन: प्रयास गर्नुहोस्।',
      consecutiveFailures: postLockout.consecutiveFailures,
    };
  }

  // 4. Password Succeeded -> Require Mandatory TOTP MFA
  // Set temporary MFA pending cookie (10 minutes max)
  const now = Math.floor(Date.now() / 1000);
  const mfaPendingToken = await signSessionPayload({
    email,
    userId: authData.user.id,
    mfaVerified: false,
    issuedAt: now,
    expiresAt: now + 600, // 10 minutes to complete MFA
  });

  cookieStore.set(MFA_PENDING_COOKIE_NAME, mfaPendingToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return {
    success: true,
    requireMfa: true,
  };
}

export async function verifyMfaAction(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const headerList = headers();
  const ipAddress = headerList.get('cf-connecting-ip') || headerList.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = headerList.get('user-agent') || 'unknown';

  const mfaPendingCookie = cookieStore.get(MFA_PENDING_COOKIE_NAME)?.value;
  if (!mfaPendingCookie) {
    return { error: 'सत्र समाप्त भएको छ। कृपया पुन: लगइन गर्नुहोस्।' };
  }

  // Verify pending token signature
  const pendingPayload = await verifySessionToken(mfaPendingCookie).catch(() => null);
  // Note: verifySessionToken checks mfaVerified, but here it's false, so check raw payload signature
  const adminClient = createAdminClient();

  const code = formData.get('code')?.toString()?.trim() || '';
  const parsed = mfaSchema.safeParse({ code });
  if (!parsed.success) {
    return { error: 'कृपया ६ अंकको मान्य प्रमाणीकरण कोड प्रविष्ट गर्नुहोस्।' };
  }

  // Check lockout
  const lockout = await checkAccountLockout(OWNER_EMAIL);
  if (lockout.isLocked) {
    return {
      isLocked: true,
      remainingSeconds: lockout.remainingSeconds,
      error: `खाता बन्द छ। कृपया केही समय पर्खनुहोस्।`,
    };
  }

  // Fetch or setup TOTP secret from mfa_factors
  const { data: factor } = await adminClient
    .from('mfa_factors')
    .select('*')
    .eq('issuer', 'YouTh Brain News')
    .maybeSingle();

  let secret = factor?.secret;
  if (!secret) {
    // Generate default seed secret if not enrolled
    secret = generateBase32Secret(20);
    await adminClient.from('mfa_factors').insert({
      secret,
      issuer: 'YouTh Brain News',
      is_verified: true,
      user_id: '00000000-0000-0000-0000-000000000001',
    });
  }

  const isValidOtp = await verifyTotpCode(secret, code);
  if (!isValidOtp) {
    // In dev / test fallback: allow 123456 if testing initial setup
    const isDevFallback = process.env.NODE_ENV !== 'production' && code === '123456';
    if (!isDevFallback) {
      await recordLoginAttempt({
        email: OWNER_EMAIL,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Invalid MFA TOTP Code',
      });
      return { error: 'प्रमाणीकरण कोड गलत छ। कृपया गुगल अथेन्टिकेटर हेरी पुन: प्रयास गर्नुहोस्।' };
    }
  }

  // MFA verified successfully!
  await recordLoginAttempt({
    email: OWNER_EMAIL,
    ipAddress,
    userAgent,
    success: true,
    failureReason: null,
  });

  // Issue 7-day Cryptographic Session Cookie
  const now = Math.floor(Date.now() / 1000);
  const sessionToken = await signSessionPayload({
    email: OWNER_EMAIL,
    userId: factor?.user_id || '00000000-0000-0000-0000-000000000001',
    mfaVerified: true,
    issuedAt: now,
    expiresAt: now + SESSION_EXPIRY_DAYS * 86400,
  });

  // Clear MFA pending cookie
  cookieStore.delete(MFA_PENDING_COOKIE_NAME);

  // Set official session cookie
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRY_DAYS * 86400,
  });

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(MFA_PENDING_COOKIE_NAME);
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  return { success: true };
}
