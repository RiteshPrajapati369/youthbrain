import { createAdminClient } from './supabase-admin';
import { fetchStoreArticles, fetchStoreArticleBySlug } from './article-store';
import { fetchStoreProfile, fetchStoreSocialLinks } from './settings-store';
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
  try {
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
    if (!error && data && data.length > 0) {
      return data as Article[];
    }
  } catch {
    // Supabase fallback
  }

  // Fallback to unified article store
  const all = await fetchStoreArticles();
  const targetStatus = params?.status || 'published';

  let filtered = all.filter((a) => {
    if (a.status !== targetStatus) return false;
    if (params?.isBreaking !== undefined && a.is_breaking !== params.isBreaking) return false;
    if (params?.isFeatured !== undefined && a.is_featured !== params.isFeatured) return false;
    if (params?.categorySlug && a.category?.slug !== params.categorySlug) return false;
    return true;
  });

  const offset = params?.offset || 0;
  if (params?.limit) {
    filtered = filtered.slice(offset, offset + params.limit);
  } else if (offset > 0) {
    filtered = filtered.slice(offset);
  }

  return filtered;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
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

    if (!error && data) {
      return data as Article;
    }
  } catch {
    // Supabase fallback
  }

  return await fetchStoreArticleBySlug(slug);
}

export async function getBreakingNews(limit = 5): Promise<Article[]> {
  return getArticles({ isBreaking: true, limit, status: 'published' });
}

export async function getFeaturedArticles(limit = 4): Promise<Article[]> {
  return getArticles({ isFeatured: true, limit, status: 'published' });
}

export async function getRelatedArticles(categoryId: string | null, currentArticleId: string, limit = 4): Promise<Article[]> {
  if (!categoryId) return [];
  try {
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

    if (!error && data && data.length > 0) return data as Article[];
  } catch {
    // Supabase fallback
  }

  const all = await fetchStoreArticles();
  return all
    .filter((a) => a.category_id === categoryId && a.id !== currentArticleId && a.status === 'published')
    .slice(0, limit);
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

// Priority Categories Definition
export const DEFAULT_PRIORITY_CATEGORIES: Category[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name_ne: 'राजनीति',
    name_en: 'Politics',
    slug: 'politics',
    description_ne: 'समसामयिक राजनीतिक घटनाक्रम र नीतिगत विश्लेषण',
    description_en: 'Contemporary political events and policy analysis',
    color: '#235DBC',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name_ne: 'समाज',
    name_en: 'Society',
    slug: 'society',
    description_ne: 'सामाजिक सरोकार, न्याय, जनजीवन र रूपान्तरण',
    description_en: 'Social issues, justice, grassroots and community development',
    color: '#06B6D4',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name_ne: 'अर्थ',
    name_en: 'Economy',
    slug: 'economy',
    description_ne: 'अर्थतन्त्र, व्यापार, वित्त र बजार विश्लेषण',
    description_en: 'Economy, business, finance and market insights',
    color: '#10B981',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name_ne: 'विज्ञान तथा प्रविधि',
    name_en: 'Science & Technology',
    slug: 'science-tech',
    description_ne: 'आर्टिफिसियल इन्टेलिजेन्स, डिजिटल आविष्कार र वैज्ञानिक खोज',
    description_en: 'AI, digital innovation and scientific breakthroughs',
    color: '#EA4C89',
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    name_ne: 'खेलकुद',
    name_en: 'Sports',
    slug: 'sports',
    description_ne: 'क्रिकेट, फुटबल र राष्ट्रिय तथा अन्तर्राष्ट्रिय खेल',
    description_en: 'Cricket, football and sporting highlights',
    color: '#8B5CF6',
    sort_order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    name_ne: 'अन्तर्वार्ता',
    name_en: 'Interview',
    slug: 'interview',
    description_ne: 'राजनीतिक नेतृत्व, विज्ञ र प्रेरक व्यक्तित्वहरूसँग विशेष संवाद',
    description_en: 'Exclusive dialogues with policymakers, thinkers and leaders',
    color: '#F59E0B',
    sort_order: 6,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Categories
export async function getCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_PRIORITY_CATEGORIES;
  }
  return data as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', cleanSlug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !data) {
    const fallback = DEFAULT_PRIORITY_CATEGORIES.find((c) => c.slug === cleanSlug);
    return fallback || null;
  }
  return data as Category;
}

// Homepage Sections
export async function getHomepageSections(): Promise<HomepageSection[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) return [];
    return data as HomepageSection[];
  } catch {
    return [];
  }
}

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data) return data as SiteSettings;
  } catch {
    // Supabase fallback
  }

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
  try {
    return await fetchStoreProfile();
  } catch {
    return null;
  }
}

// Social Links
export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    return await fetchStoreSocialLinks(true);
  } catch {
    return [];
  }
}
