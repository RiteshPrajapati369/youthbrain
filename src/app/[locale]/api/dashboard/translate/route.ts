import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/owner-auth';
import { translateText } from '@/lib/translator';

async function checkAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  return session !== null && session.mfaVerified;
}

export async function POST(request: NextRequest) {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const from = (body.from === 'en' ? 'en' : 'ne') as 'ne' | 'en';
    const to = (body.to === 'ne' ? 'ne' : 'en') as 'ne' | 'en';

    // 1. Single text translation
    if (typeof body.text === 'string') {
      const translated = await translateText(body.text, from, to);
      return NextResponse.json({ translatedText: translated });
    }

    // 2. Batch fields translation (e.g. title, summary, content)
    if (body.fields && typeof body.fields === 'object') {
      const keys = Object.keys(body.fields);
      const translatedEntries = await Promise.all(
        keys.map(async (key) => {
          const val = body.fields[key];
          if (!val || typeof val !== 'string' || !val.trim()) {
            return [key, ''];
          }
          try {
            const res = await translateText(val, from, to);
            return [key, res];
          } catch {
            return [key, val]; // Fallback to original on partial failure
          }
        })
      );

      const translatedFields = Object.fromEntries(translatedEntries);
      return NextResponse.json({ translatedFields });
    }

    return NextResponse.json({ error: 'No text or fields provided' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Translation error' }, { status: 500 });
  }
}
