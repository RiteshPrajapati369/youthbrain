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
    .from('media')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ media: data });
}

export async function DELETE(request: NextRequest) {
  const isAuthed = await checkAuth();
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('media')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
