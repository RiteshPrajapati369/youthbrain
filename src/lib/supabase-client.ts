import { createBrowserClient } from '@supabase/ssr';

const FALLBACK_URL = 'https://mpdqhdsojfmlezmkyikg.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_build_fallback_key';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch {
    return createBrowserClient(FALLBACK_URL, FALLBACK_KEY);
  }
}
