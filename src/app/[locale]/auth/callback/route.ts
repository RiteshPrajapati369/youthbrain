import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const locale = params.locale || 'ne';

  if (code) {
    const supabase = createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/${locale}/dashboard`);
}
