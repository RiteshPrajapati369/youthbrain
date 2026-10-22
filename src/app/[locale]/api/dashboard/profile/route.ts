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
  const { data: profile } = await supabase.from('profiles').select('*').limit(1).maybeSingle();
  const { data: socialLinks } = await supabase.from('social_links').select('*').order('sort_order', { ascending: true });

  return NextResponse.json({ profile, socialLinks });
}

export async function PUT(request: NextRequest) {
  const isAuthed = await checkAuth();
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { profile, socialLinks } = body;
    const supabase = createAdminClient();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          headline: profile.headline,
          bio: profile.bio,
          about_description: profile.about_description,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          location: profile.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id || '00000000-0000-0000-0000-000000000001');
    }

    if (Array.isArray(socialLinks)) {
      for (const link of socialLinks) {
        if (link.id) {
          await supabase
            .from('social_links')
            .update({
              url: link.url,
              label: link.label,
              is_active: link.is_active,
              sort_order: link.sort_order,
              updated_at: new Date().toISOString(),
            })
            .eq('id', link.id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
