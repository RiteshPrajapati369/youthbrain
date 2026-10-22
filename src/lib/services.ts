import { createAdminClient } from './supabase-admin';
import type { Article, Category, HomepageSection, Profile, SocialLink, SiteSettings } from '@/types';

// Articles
export async function getArticles(params?: {
  categorySlug?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<Article[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .is('deleted_at', null)
    .order('published_at', { ascending: false });

  if (params?.status) {
    query = query.eq('status', params.status);
  } else {
    query = query.eq('status', 'published');
  }

  if (params?.isBreaking !== undefined) {
    query = query.eq('is_breaking', params.isBreaking);
  }

  if (params?.isFeatured !== undefined) {
    query = query.eq('is_featured', params.isFeatured);
  }

  if (params?.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.categorySlug)
      .maybeSingle();

    if (cat?.id) {
      query = query.eq('category_id', cat.id);
    }
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }
  return data as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as Article;
}

export async function getBreakingNews(limit = 5): Promise<Article[]> {
  return getArticles({ isBreaking: true, limit, status: 'published' });
}

export async function getFeaturedArticles(limit = 4): Promise<Article[]> {
  return getArticles({ isFeatured: true, limit, status: 'published' });
}

export async function getRelatedArticles(categoryId: string | null, currentArticleId: string, limit = 4): Promise<Article[]> {
  if (!categoryId) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('category_id', categoryId)
    .neq('id', currentArticleId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as Article[];
}

export async function incrementViewCount(slug: string) {
  const supabase = createAdminClient();
  try {
    const { data: article } = await supabase
      .from('articles')
      .select('id, view_count')
      .eq('slug', slug)
      .maybeSingle();

    if (article) {
      await supabase
        .from('articles')
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq('id', article.id);
    }
  } catch (err) {
    console.error('Failed to increment view count:', err);
  }
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !data) return null;
  return data as Category;
}

// Homepage Sections
export async function getHomepageSections(): Promise<HomepageSection[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as HomepageSection[];
}

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (data) return data as SiteSettings;

  // Fallback defaults
  return {
    id: 'default',
    site_name_ne: 'युथ ब्रेन न्युज',
    site_name_en: 'YouTh Brain News',
    tagline_ne: 'सत्य, तथ्य र निष्पक्ष समाचारको भरपर्दो मुहान',
    tagline_en: 'Your Trusted Source for Truth, Facts and Impartial News',
    logo_url: '/logo.jpg',
    og_image_url: '/logo.jpg',
    copyright_ne: '© २०२६ YouTh Brain News. सर्वाधिकार सुरक्षित।',
    copyright_en: '© 2026 YouTh Brain News. All rights reserved.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Profile
export async function getOwnerProfile(): Promise<Profile | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .maybeSingle();

  return data as Profile | null;
}

// Social Links
export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as SocialLink[];
}
