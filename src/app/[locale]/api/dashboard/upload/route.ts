import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/owner-auth';
import { uploadFileToStorage, StorageBucket } from '@/lib/storage';
import { createAdminClient } from '@/lib/supabase-admin';

async function checkAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  return session !== null && session.mfaVerified;
}

export async function POST(request: NextRequest) {
  const isAuthed = await checkAuth();
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as StorageBucket) || 'media';
    const altNe = (formData.get('alt_ne') as string) || '';
    const altEn = (formData.get('alt_en') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Scoped path by owner user id: /<user-id>/timestamp-filename
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `00000000-0000-0000-0000-000000000001/${Date.now()}_${cleanFileName}`;

    const { url, error: uploadError } = await uploadFileToStorage(bucket, path, file);
    if (uploadError || !url) {
      return NextResponse.json({ error: uploadError || 'Upload failed' }, { status: 500 });
    }

    // Record in media table
    const supabase = createAdminClient();
    await supabase.from('media').insert({
      profile_id: '00000000-0000-0000-0000-000000000001',
      url,
      alt_ne: altNe || cleanFileName,
      alt_en: altEn || cleanFileName,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      folder: bucket,
    });

    return NextResponse.json({ url, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
