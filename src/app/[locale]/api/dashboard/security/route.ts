import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import QRCode from 'qrcode';
import { SESSION_COOKIE_NAME, verifySessionToken, OWNER_EMAIL } from '@/lib/owner-auth';
import { createAdminClient } from '@/lib/supabase-admin';

async function checkAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  return session !== null && session.mfaVerified;
}

export async function GET() {
  const isAuthed = await checkAuth();
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  // 1. Fetch Login Attempts Log
  const { data: attempts } = await supabase
    .from('login_attempts')
    .select('*')
    .order('attempt_time', { ascending: false })
    .limit(50);

  // 2. Fetch MFA Factor
  const { data: factor } = await supabase
    .from('mfa_factors')
    .select('*')
    .eq('issuer', 'YouTh Brain News')
    .maybeSingle();

  let qrCodeDataUrl = '';
  if (factor?.secret) {
    const otpAuthUrl = `otpauth://totp/YouTh%20Brain%20News:${OWNER_EMAIL}?secret=${factor.secret}&issuer=YouTh%20Brain%20News`;
    qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, { margin: 1, width: 200 });
  }

  return NextResponse.json({
    attempts: attempts || [],
    mfaFactor: factor ? { ...factor, qrCodeDataUrl } : null,
  });
}

export async function POST(request: NextRequest) {
  const isAuthed = await checkAuth();
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { action } = body;
    const supabase = createAdminClient();

    // Reset lockout attempts if owner requests administrative reset
    if (action === 'reset_lockout') {
      await supabase
        .from('login_attempts')
        .delete()
        .eq('email', OWNER_EMAIL)
        .eq('success', false);

      return NextResponse.json({ success: true, message: 'Lockout attempts cleared.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
