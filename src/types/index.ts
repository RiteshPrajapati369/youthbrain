export type SupportedLocale = 'ne' | 'en';

export interface Profile {
  id: string;
  user_id?: string;
  full_name: string;
  headline?: string | null;
  bio?: string | null;
  about_description?: string | null;
  avatar_url?: string | null;
  email: string;
  phone?: string | null;
  location?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Category {
  id: string;
  profile_id?: string;
  name_ne: string;
  name_en: string;
  slug: string;
  description_ne?: string | null;
  description_en?: string | null;
  color?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Article {
  id: string;
  profile_id?: string;
  category_id?: string | null;
  category?: Category | null;
  title_ne: string;
  title_en: string;
  slug: string;
  summary_ne?: string | null;
  summary_en?: string | null;
  content_ne: string;
  content_en: string;
  cover_image_url?: string | null;
  status: ArticleStatus;
  is_breaking: boolean;
  is_featured: boolean;
  published_at?: string | null;
  view_count: number;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ArticleImage {
  id: string;
  article_id: string;
  image_url: string;
  caption_ne?: string | null;
  caption_en?: string | null;
  sort_order: number;
  created_at: string;
}

export interface MediaItem {
  id: string;
  profile_id?: string;
  url: string;
  alt_ne?: string | null;
  alt_en?: string | null;
  type: string;
  folder: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface HomepageSection {
  id: string;
  profile_id?: string;
  section_key: string;
  title_ne: string;
  title_en: string;
  config: Record<string, any>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  profile_id?: string;
  platform: string;
  url: string;
  label: string;
  icon_name?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  profile_id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip_address?: string | null;
  user_agent?: string | null;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface LoginAttempt {
  id: string;
  email: string;
  attempt_time: string;
  ip_address?: string | null;
  user_agent?: string | null;
  success: boolean;
  failure_reason?: string | null;
}

export interface SiteSettings {
  id: string;
  profile_id?: string;
  site_name_ne: string;
  site_name_en: string;
  tagline_ne?: string | null;
  tagline_en?: string | null;
  logo_url: string;
  og_image_url: string;
  copyright_ne?: string | null;
  copyright_en?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerSessionPayload {
  email: string;
  userId?: string;
  mfaVerified: boolean;
  issuedAt: number;
  expiresAt: number;
}
