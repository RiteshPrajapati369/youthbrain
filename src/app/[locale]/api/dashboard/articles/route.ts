import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/owner-auth';
import { createAdminClient } from '@/lib/supabase-admin';

// Helper to check dashboard authorization
async function checkAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  return session !== null && session.mfaVerified;
}

export async function GET(request: NextRequest) {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data });
}

export async function POST(request: NextRequest) {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createAdminClient();

    // Auto-generate slug if not provided
    const slug = body.slug
      ? body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : (body.title_en || 'news')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    const newArticle = {
      profile_id: '00000000-0000-0000-0000-000000000001',
      category_id: body.category_id || null,
      title_ne: body.title_ne,
      title_en: body.title_en,
      slug,
      summary_ne: body.summary_ne || null,
      summary_en: body.summary_en || null,
      content_ne: body.content_ne,
      content_en: body.content_en,
      cover_image_url: body.cover_image_url || '/logo.jpg',
      status: body.status || 'draft',
      is_breaking: !!body.is_breaking,
      is_featured: !!body.is_featured,
      published_at: body.status === 'published' ? new Date().toISOString() : null,
      view_count: 0,
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
    };

    const { data, error } = await supabase
      .from('articles')
      .insert(newArticle)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ article: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updateData: any = {
      title_ne: body.title_ne,
      title_en: body.title_en,
      category_id: body.category_id || null,
      summary_ne: body.summary_ne,
      summary_en: body.summary_en,
      content_ne: body.content_ne,
      content_en: body.content_en,
      cover_image_url: body.cover_image_url,
      status: body.status,
      is_breaking: !!body.is_breaking,
      is_featured: !!body.is_featured,
      seo_title: body.seo_title,
      seo_description: body.seo_description,
      updated_at: new Date().toISOString(),
    };

    if (body.status === 'published' && !body.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ article: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  // Soft delete
  const { error } = await supabase
    .from('articles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
