import fs from 'fs';
import path from 'path';
import type { Profile, SocialLink } from '@/types';
import { createAdminClient } from './supabase-admin';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'site-config.json');

interface SiteConfig {
  profile: Profile & { secondary_email?: string };
  socialLinks: SocialLink[];
}

let memoryConfig: SiteConfig | null = null;

function loadLocalConfig(): SiteConfig {
  if (memoryConfig) return memoryConfig;

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryConfig = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('Could not read site-config.json, using fallback:', err);
  }

  const fallback: SiteConfig = {
    profile: {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Ritesh Prajapati',
      headline: 'Editor-in-Chief & Founder, YouTh Brain News',
      bio: 'Journalist, technologist, and digital media innovator covering Nepal and the world.',
      about_description: 'YouTh Brain News is a premier independent digital news portal committed to impartial, verified, and timely news reporting.',
      avatar_url: '/logo.jpg',
      email: 'panditritesh005@gmail.com',
      secondary_email: 'info@youthbrainnews.com.np',
      phone: '+977-9800000000',
      location: 'Hetauda, Nepal',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    socialLinks: [
      {
        id: 'social-1',
        platform: 'facebook',
        label: 'Facebook',
        url: 'https://facebook.com/youthbrainnews',
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'social-2',
        platform: 'twitter',
        label: 'X (Twitter)',
        url: 'https://twitter.com/youthbrainnews',
        is_active: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'social-3',
        platform: 'youtube',
        label: 'YouTube',
        url: 'https://youtube.com/@youthbrainnews',
        is_active: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'social-4',
        platform: 'linkedin',
        label: 'LinkedIn',
        url: 'https://linkedin.com/company/youthbrainnews',
        is_active: true,
        sort_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  memoryConfig = fallback;
  return fallback;
}

function saveLocalConfig(config: SiteConfig) {
  memoryConfig = config;
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write site-config.json:', err);
  }
}

/**
 * Fetch profile with fallback
 */
export async function fetchStoreProfile(): Promise<Profile & { secondary_email?: string }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('profiles').select('*').limit(1).maybeSingle();
    if (!error && data) {
      return data as Profile;
    }
  } catch {
    // Supabase fallback
  }

  const local = loadLocalConfig();
  return local.profile;
}

/**
 * Fetch social links with fallback
 */
export async function fetchStoreSocialLinks(activeOnly = true): Promise<SocialLink[]> {
  try {
    const supabase = createAdminClient();
    let query = supabase.from('social_links').select('*').order('sort_order', { ascending: true });
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as SocialLink[];
    }
  } catch {
    // Supabase fallback
  }

  const local = loadLocalConfig();
  if (activeOnly) {
    return local.socialLinks.filter((l) => l.is_active);
  }
  return local.socialLinks;
}

/**
 * Update profile and social links in both local store and Supabase
 */
export async function updateStoreSettings(payload: {
  profile?: Partial<Profile & { secondary_email?: string }>;
  socialLinks?: SocialLink[];
}): Promise<SiteConfig> {
  const current = loadLocalConfig();
  const now = new Date().toISOString();

  // Merge profile
  if (payload.profile) {
    current.profile = {
      ...current.profile,
      ...payload.profile,
      updated_at: now,
    };

    try {
      const supabase = createAdminClient();
      await supabase
        .from('profiles')
        .upsert({
          id: current.profile.id,
          full_name: current.profile.full_name,
          headline: current.profile.headline,
          bio: current.profile.bio,
          about_description: current.profile.about_description,
          avatar_url: current.profile.avatar_url,
          email: current.profile.email,
          phone: current.profile.phone,
          location: current.profile.location,
          updated_at: now,
        });
    } catch {
      // Supabase offline
    }
  }

  // Merge social links
  if (Array.isArray(payload.socialLinks)) {
    current.socialLinks = payload.socialLinks.map((link, idx) => ({
      ...link,
      id: link.id || `social-${idx + 1}`,
      sort_order: link.sort_order ?? idx + 1,
      updated_at: now,
    }));

    try {
      const supabase = createAdminClient();
      for (const link of current.socialLinks) {
        await supabase.from('social_links').upsert({
          id: link.id,
          platform: link.platform,
          label: link.label,
          url: link.url,
          is_active: link.is_active,
          sort_order: link.sort_order,
          updated_at: now,
        });
      }
    } catch {
      // Supabase offline
    }
  }

  saveLocalConfig(current);
  return current;
}
