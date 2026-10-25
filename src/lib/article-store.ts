import fs from 'fs';
import path from 'path';
import type { Article, Category } from '@/types';
import { DEFAULT_PRIORITY_CATEGORIES } from './services';
import { createAdminClient } from './supabase-admin';

const ARTICLES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'articles.json');

// In-memory fallback cache in case filesystem is read-only
let memoryArticles: Article[] | null = null;

function loadLocalArticles(): Article[] {
  if (memoryArticles) {
    return memoryArticles;
  }
  try {
    if (fs.existsSync(ARTICLES_FILE_PATH)) {
      const raw = fs.readFileSync(ARTICLES_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryArticles = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('Could not read articles.json from disk, using fallback empty array:', err);
  }
  return [];
}

function saveLocalArticles(articles: Article[]) {
  memoryArticles = articles;
  try {
    const dir = path.dirname(ARTICLES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ARTICLES_FILE_PATH, JSON.stringify(articles, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist articles.json to disk (memory cache updated):', err);
  }
}

function attachCategory(article: any): Article {
  if (article.category) return article as Article;
  const cat = DEFAULT_PRIORITY_CATEGORIES.find((c) => c.id === article.category_id);
  return {
    ...article,
    category: cat || null,
  };
}

/**
 * Fetch all active articles (from Supabase first, fallback to local store)
 */
export async function fetchStoreArticles(): Promise<Article[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data as Article[];
    }
  } catch {
    // Supabase unreachable or misconfigured
  }

  // Fallback to local store
  const local = loadLocalArticles();
  return local
    .filter((a) => !a.deleted_at)
    .sort((a, b) => new Date(b.created_at || b.published_at || 0).getTime() - new Date(a.created_at || a.published_at || 0).getTime())
    .map(attachCategory);
}

/**
 * Get article by slug
 */
export async function fetchStoreArticleBySlug(slug: string): Promise<Article | null> {
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

  const local = loadLocalArticles();
  const match = local.find((a) => a.slug === slug && !a.deleted_at);
  return match ? attachCategory(match) : null;
}

/**
 * Save / create new article
 */
export async function createStoreArticle(payload: any): Promise<Article> {
  const newId = payload.id || `20000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`;
  const now = new Date().toISOString();

  const articleRecord: Article = {
    id: newId,
    profile_id: payload.profile_id || '00000000-0000-0000-0000-000000000001',
    category_id: payload.category_id || null,
    title_ne: payload.title_ne,
    title_en: payload.title_en,
    slug: payload.slug,
    summary_ne: payload.summary_ne || null,
    summary_en: payload.summary_en || null,
    content_ne: payload.content_ne,
    content_en: payload.content_en,
    cover_image_url: payload.cover_image_url || '/logo.jpg',
    status: payload.status || 'draft',
    is_breaking: !!payload.is_breaking,
    is_featured: !!payload.is_featured,
    published_at: payload.status === 'published' ? (payload.published_at || now) : null,
    view_count: payload.view_count || 0,
    seo_title: payload.seo_title || null,
    seo_description: payload.seo_description || null,
    created_at: now,
    updated_at: now,
    category: DEFAULT_PRIORITY_CATEGORIES.find((c) => c.id === payload.category_id) as Category || null,
  };

  // Attempt Supabase insert
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('articles')
      .insert({
        ...articleRecord,
        category: undefined,
      })
      .select()
      .single();

    if (!error && data) {
      articleRecord.id = data.id;
    }
  } catch {
    // Supabase offline
  }

  // Update local file
  const local = loadLocalArticles();
  const updated = [articleRecord, ...local];
  saveLocalArticles(updated);

  return articleRecord;
}

/**
 * Update existing article
 */
export async function updateStoreArticle(id: string, payload: any): Promise<Article | null> {
  const now = new Date().toISOString();
  let updatedRecord: Article | null = null;

  // Attempt Supabase update
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('articles')
      .update({
        title_ne: payload.title_ne,
        title_en: payload.title_en,
        category_id: payload.category_id || null,
        summary_ne: payload.summary_ne,
        summary_en: payload.summary_en,
        content_ne: payload.content_ne,
        content_en: payload.content_en,
        cover_image_url: payload.cover_image_url,
        status: payload.status,
        is_breaking: !!payload.is_breaking,
        is_featured: !!payload.is_featured,
        seo_title: payload.seo_title,
        seo_description: payload.seo_description,
        published_at: payload.status === 'published' ? (payload.published_at || now) : null,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (data) {
      updatedRecord = data as Article;
    }
  } catch {
    // Supabase offline
  }

  // Update local file
  const local = loadLocalArticles();
  const idx = local.findIndex((a) => a.id === id);
  if (idx !== -1) {
    const existing = local[idx];
    const merged: Article = {
      ...existing,
      ...payload,
      id,
      updated_at: now,
      published_at: payload.status === 'published' ? (existing.published_at || now) : existing.published_at,
      category: DEFAULT_PRIORITY_CATEGORIES.find((c) => c.id === (payload.category_id || existing.category_id)) as Category || null,
    };
    local[idx] = merged;
    saveLocalArticles(local);
    if (!updatedRecord) updatedRecord = merged;
  }

  return updatedRecord;
}

/**
 * Delete (soft delete) article
 */
export async function deleteStoreArticle(id: string): Promise<boolean> {
  // Attempt Supabase soft-delete
  try {
    const supabase = createAdminClient();
    await supabase
      .from('articles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
  } catch {
    // Supabase offline
  }

  // Remove / mark deleted locally
  const local = loadLocalArticles();
  const filtered = local.filter((a) => a.id !== id);
  saveLocalArticles(filtered);
  return true;
}
