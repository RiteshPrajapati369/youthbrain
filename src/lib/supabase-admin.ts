import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://mpdqhdsojfmlezmkyikg.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_build_fallback_key';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_KEY;

  try {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch {
    return createClient(FALLBACK_URL, FALLBACK_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
}
