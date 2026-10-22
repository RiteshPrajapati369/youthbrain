import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/owner-auth';
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
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sections: data });
}

export async function PUT(request: NextRequest) {
  const isAuthed = await checkAuth();
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const supabase = createAdminClient();

    if (Array.isArray(body.sections)) {
      for (const section of body.sections) {
        await supabase
          .from('homepage_sections')
          .update({
            title_ne: section.title_ne,
            title_en: section.title_en,
            sort_order: section.sort_order,
            is_active: section.is_active,
            config: section.config || {},
            updated_at: new Date().toISOString(),
          })
          .eq('id', section.id);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
