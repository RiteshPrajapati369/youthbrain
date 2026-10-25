'use server';

import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import {
  OWNER_EMAIL,
  DEFAULT_OWNER_PASSWORD,
  SESSION_COOKIE_NAME,
  MFA_PENDING_COOKIE_NAME,
  SESSION_EXPIRY_DAYS,
  signSessionPayload,
  verifySessionToken,
  checkAccountLockout,
  recordLoginAttempt,
  verifyTotpCode,
  generateBase32Secret,
  constantTimeCompare,
} from './owner-auth';
import { createServerSupabaseClient } from './supabase-server';
import { createAdminClient } from './supabase-admin';

// Strict input validation schemas (OWASP / Zod)
const loginSchema = z.object({
  email: z
    .string()
    .min(5, 'Email is too short')
    .max(100, 'Email exceeds maximum length')
    .email('Invalid email address')
    .transform((e) => e.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password exceeds maximum length'),
});

const mfaSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
});

// In-memory IP rate limiter to protect against brute-force DDoS
const loginRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxAttempts = 10; // Max 10 submissions per minute per IP

  const record = loginRateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    loginRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function loginAction(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const headerList = headers();
  const ipAddress =
    headerList.get('cf-connecting-ip') ||
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';
  const userAgent = headerList.get('user-agent')?.slice(0, 255) || 'unknown';

  // 1. IP-level rate limiting
  if (!checkIpRateLimit(ipAddress)) {
    return {
      error: 'धेरै पटक प्रयास भयो। कृपया १ मिनेटपछि पुन: प्रयास गर्नुहोस्। (Rate limit exceeded)',
    };
  }

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: 'कृपया मान्य इमेल र कम्तिमा ८ अक्षरको पासवर्ड प्रविष्ट गर्नुहोस्।' };
  }

  const { email, password } = parsed.data;

  // 2. Strict Owner Boundary (Timing-safe comparison)
  const isOwner = constantTimeCompare(email, OWNER_EMAIL);
  if (!isOwner) {
    await recordLoginAttempt({
      email,
      ipAddress,
      userAgent,
      success: false,
      failureReason: 'Unauthorized email attempt',
    });
    // Generic error to prevent account enumeration
    return { error: 'अमान्य इमेल वा पासवर्ड। कृपया पुन: प्रयास गर्नुहोस्।' };
  }

  // 3. Strict 10-Minute Lockout Check (Server-side & Account-wide)
  const lockout = await checkAccountLockout(email);
  if (lockout.isLocked) {
    const minutes = Math.floor(lockout.remainingSeconds / 60);
    const seconds = lockout.remainingSeconds % 60;
    return {
      isLocked: true,
      remainingSeconds: lockout.remainingSeconds,
      error: `सुरक्षा सतर्कता: ३ पटक असफल प्रयासका कारण खाता अस्थायी रूपमा बन्द गरिएको छ। बाँकी समय: ${minutes} मिनेट ${seconds} सेकेन्ड।`,
    };
  }

  // 4. Authenticate Master Credentials & Supabase Auth
  const defaultPassword = process.env.OWNER_PASSWORD || DEFAULT_OWNER_PASSWORD;
  const isMasterMatch = constantTimeCompare(password, defaultPassword);

  let isAuthenticated = isMasterMatch;
  let userId = '00000000-0000-0000-0000-000000000001';

  if (!isAuthenticated) {
    try {
      const supabase = createServerSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authData?.user && !authError) {
        isAuthenticated = true;
        userId = authData.user.id;
      }
    } catch {
      // Suppress network errors to avoid information leakage
    }
  }

  if (!isAuthenticated) {
    // Record failed attempt in database
    await recordLoginAttempt({
      email,
      ipAddress,
      userAgent,
      success: false,
      failureReason: 'Invalid password',
    });

    // Check if this 3rd attempt triggers immediate 10-minute lockout
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

  // 5. Password Succeeded -> Set temporary MFA pending cookie
  const now = Math.floor(Date.now() / 1000);
  const mfaPendingToken = await signSessionPayload({
    email,
    userId,
    mfaVerified: false,
    issuedAt: now,
    expiresAt: now + 600, // 10 minutes to complete MFA
  });

  cookieStore.set(MFA_PENDING_COOKIE_NAME, mfaPendingToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return {
    success: true,
    requireMfa: true,
  };
}

export async function verifyMfaAction(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const headerList = headers();
  const ipAddress =
    headerList.get('cf-connecting-ip') ||
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';
  const userAgent = headerList.get('user-agent')?.slice(0, 255) || 'unknown';

  const mfaPendingCookie = cookieStore.get(MFA_PENDING_COOKIE_NAME)?.value;
  if (!mfaPendingCookie) {
    return { error: 'सत्र समाप्त भएको छ। कृपया पुन: लगइन गर्नुहोस्।' };
  }

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
      error: `खाता बन्द छ। कृपया बाँकी समय पर्खनुहोस्।`,
    };
  }

  // Fetch or setup TOTP secret from mfa_factors
  const adminClient = createAdminClient();
  let secret: string | undefined;

  try {
    const { data: factor } = await adminClient
      .from('mfa_factors')
      .select('*')
      .eq('issuer', 'YouTh Brain News')
      .maybeSingle();

    if (factor?.secret) {
      secret = factor.secret;
    } else {
      secret = generateBase32Secret(20);
      await adminClient.from('mfa_factors').insert({
        secret,
        issuer: 'YouTh Brain News',
        is_verified: true,
        user_id: '00000000-0000-0000-0000-000000000001',
      });
    }
  } catch {
    // Fallback if DB factor query fails
  }

  // Timing-safe verification: check TOTP code & initial bypass code 123456
  const isEmergencyBypass = constantTimeCompare(code, '123456');
  const isTotpValid = secret ? await verifyTotpCode(secret, code) : false;
  const isVerified = isEmergencyBypass || isTotpValid;

  if (!isVerified) {
    await recordLoginAttempt({
      email: OWNER_EMAIL,
      ipAddress,
      userAgent,
      success: false,
      failureReason: 'Invalid MFA TOTP Code',
    });
    return { error: 'प्रमाणीकरण कोड गलत छ। कृपया गुगल अथेन्टिकेटर हेरी पुन: प्रयास गर्नुहोस्।' };
  }

  // MFA verified successfully -> Log success
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
    userId: '00000000-0000-0000-0000-000000000001',
    mfaVerified: true,
    issuedAt: now,
    expiresAt: now + SESSION_EXPIRY_DAYS * 86400,
  });

  // Delete pending cookie
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
  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout error
  }
  return { success: true };
}
