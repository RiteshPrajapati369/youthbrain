import { createAdminClient } from './supabase-admin';
import type { OwnerSessionPayload } from '@/types';

export const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'panditritesh005@gmail.com').toLowerCase().trim();
export const DEFAULT_OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'YouthBrain@2026#Admin';
export const SESSION_COOKIE_NAME = 'ythbrain_owner_session';
export const MFA_PENDING_COOKIE_NAME = 'ythbrain_mfa_pending';
export const SESSION_EXPIRY_DAYS = 7;
export const LOCKOUT_THRESHOLD = 3;
export const LOCKOUT_DURATION_SECONDS = 600; // 10 minutes (strict)

// Constant-time string comparison to prevent timing attacks
export function constantTimeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const aBuf = enc.encode(a);
  const bBuf = enc.encode(b);
  const maxLen = Math.max(aBuf.length, bBuf.length);
  let mismatch = aBuf.length === bBuf.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    const aByte = i < aBuf.length ? aBuf[i] : 0;
    const bByte = i < bBuf.length ? bBuf[i] : 0;
    mismatch |= aByte ^ bByte;
  }
  return mismatch === 0;
}

const SECRET_KEY_STR = process.env.OWNER_SESSION_SECRET || 'youthbrain_secure_session_secret_key_32chars_long!';

// Web Crypto helper for Edge + Node compatibility
async function getCryptoKey(usage: KeyUsage): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET_KEY_STR),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

function base64UrlEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64url');
  }
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64url').toString('utf-8');
  }
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64url');
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Synchronous / microsecond cryptographic signature creation
export async function signSessionPayload(payload: OwnerSessionPayload): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);
  const key = await getCryptoKey('sign');
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(encodedPayload)
  );
  const signature = arrayBufferToBase64Url(signatureBuffer);
  return `${encodedPayload}.${signature}`;
}

// Edge Fast-Path Verification (< 0.1ms)
export async function verifySessionToken(token: string | undefined | null): Promise<OwnerSessionPayload | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  try {
    const key = await getCryptoKey('verify');
    const signatureBytes = Uint8Array.from(
      typeof Buffer !== 'undefined'
        ? Buffer.from(signature, 'base64url')
        : Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      new TextEncoder().encode(encodedPayload)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: OwnerSessionPayload = JSON.parse(payloadJson);

    // Verify owner email boundary
    if (!payload.email || payload.email.toLowerCase() !== OWNER_EMAIL) {
      return null;
    }

    // Verify MFA requirement
    if (!payload.mfaVerified) {
      return null;
    }

    // Verify expiry (7 days)
    const now = Math.floor(Date.now() / 1000);
    if (now >= payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

// Check 10-Minute Lockout Status from database
export async function checkAccountLockout(email: string): Promise<{
  isLocked: boolean;
  remainingSeconds: number;
  consecutiveFailures: number;
}> {
  const normalizedEmail = email.toLowerCase().trim();
  if (normalizedEmail !== OWNER_EMAIL) {
    return { isLocked: false, remainingSeconds: 0, consecutiveFailures: 0 };
  }

  const supabase = createAdminClient();

  try {
    // 1. Get the most recent successful login time
    const { data: lastSuccess } = await supabase
      .from('login_attempts')
      .select('attempt_time')
      .eq('email', normalizedEmail)
      .eq('success', true)
      .order('attempt_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Query failures after the last success
    let query = supabase
      .from('login_attempts')
      .select('attempt_time')
      .eq('email', normalizedEmail)
      .eq('success', false)
      .order('attempt_time', { ascending: false });

    if (lastSuccess?.attempt_time) {
      query = query.gt('attempt_time', lastSuccess.attempt_time);
    }

    const { data: failures, error } = await query;
    if (error || !failures) {
      return { isLocked: false, remainingSeconds: 0, consecutiveFailures: 0 };
    }

    const failureCount = failures.length;
    if (failureCount >= LOCKOUT_THRESHOLD && failures.length > 0) {
      const latestFailureTime = new Date(failures[0].attempt_time).getTime();
      const elapsedSeconds = Math.floor((Date.now() - latestFailureTime) / 1000);

      if (elapsedSeconds < LOCKOUT_DURATION_SECONDS) {
        const remainingSeconds = LOCKOUT_DURATION_SECONDS - elapsedSeconds;
        return {
          isLocked: true,
          remainingSeconds,
          consecutiveFailures: failureCount,
        };
      }
    }

    return {
      isLocked: false,
      remainingSeconds: 0,
      consecutiveFailures: failureCount,
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, consecutiveFailures: 0 };
  }
}

// Record login attempt
export async function recordLoginAttempt(params: {
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  success: boolean;
  failureReason?: string | null;
}) {
  const supabase = createAdminClient();
  try {
    await supabase.from('login_attempts').insert({
      email: params.email.toLowerCase().trim(),
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      success: params.success,
      failure_reason: params.failureReason || null,
      attempt_time: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to record login attempt:', err);
  }
}

// RFC 6238 TOTP Engine for Google Authenticator (Edge & Browser Compatible)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Decode(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val >= 0) {
      bits += val.toString(2).padStart(5, '0');
    }
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

export function generateBase32Secret(length = 20): string {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  let result = '';
  for (let i = 0; i < randomBytes.length; i++) {
    result += BASE32_ALPHABET[randomBytes[i] % 32];
  }
  return result;
}

export async function generateTotpCode(secretBase32: string, counterOffset = 0): Promise<string> {
  const keyBytes = base32Decode(secretBase32);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const timeStep = Math.floor(Date.now() / 1000 / 30) + counterOffset;
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, BigInt(timeStep), false); // Big endian

  const hmac = await crypto.subtle.sign('HMAC', cryptoKey, buffer);
  const hmacBytes = new Uint8Array(hmac);
  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;

  const binary =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

export async function verifyTotpCode(secretBase32: string, token: string): Promise<boolean> {
  const cleanToken = token.trim();
  if (!/^\d{6}$/.test(cleanToken)) return false;

  let matched = false;
  // Window of +/- 1 time step (90 seconds total) for clock drift tolerance
  // Constant execution time across offsets to avoid timing analysis
  for (let offset = -1; offset <= 1; offset++) {
    const expected = await generateTotpCode(secretBase32, offset);
    if (constantTimeCompare(expected, cleanToken)) {
      matched = true;
    }
  }
  return matched;
}
