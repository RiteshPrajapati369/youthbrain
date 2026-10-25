'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Flame,
  Star,
  Eye,
  Check,
  X,
  Upload,
  Languages,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { Article, Category } from '@/types';

interface ArticlesPageProps {
  params: {
    locale: string;
  };
}

export default function DashboardArticlesPage({ params: { locale } }: ArticlesPageProps) {
  const isNe = locale === 'ne';
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title_ne: '',
    title_en: '',
    slug: '',
    category_id: '',
    summary_ne: '',
    summary_en: '',
    content_ne: '',
    content_en: '',
    cover_image_url: '/logo.jpg',
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_breaking: false,
    is_featured: false,
    seo_title: '',
    seo_description: '',
  });

  // Translation State & Synchronization
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [activeSourceLocale, setActiveSourceLocale] = useState<'ne' | 'en' | null>(null);
  const debounceTimerRef = React.useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimerRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const translateSingleField = async (
    fieldName: 'title' | 'summary' | 'content',
    from: 'ne' | 'en',
    to: 'ne' | 'en',
    textValue?: string
  ) => {
    const sourceVal =
      textValue !== undefined
        ? textValue
        : from === 'ne'
        ? formData[`${fieldName}_ne`]
        : formData[`${fieldName}_en`];

    if (!sourceVal || !sourceVal.trim()) return;

    setTranslatingField(fieldName);
    try {
      const res = await fetch(`/${locale}/api/dashboard/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceVal, from, to }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          setFormData((prev) => {
            const next = { ...prev };
            const targetKey = `${fieldName}_${to}` as keyof typeof prev;
            (next as any)[targetKey] = data.translatedText;
            if (fieldName === 'title' && to === 'en') {
              const currentSlug = prev.slug.trim();
              if (!currentSlug || currentSlug.startsWith('news-') || currentSlug === 'news') {
                next.slug = data.translatedText
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, '')
                  .slice(0, 80);
              }
            }
            return next;
          });
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslatingField(null);
    }
  };

  const translateAllFields = async (from: 'ne' | 'en', to: 'ne' | 'en') => {
    const title = from === 'ne' ? formData.title_ne : formData.title_en;
    const summary = from === 'ne' ? formData.summary_ne : formData.summary_en;
    const content = from === 'ne' ? formData.content_ne : formData.content_en;

    if (!title && !summary && !content) {
      toast.error(isNe ? 'अनुवाद गर्नका लागि कुनै सामग्री छैन।' : 'No content to translate.');
      return;
    }

    setTranslatingField('all');
    try {
      const res = await fetch(`/${locale}/api/dashboard/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: { title, summary, content },
          from,
          to,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translatedFields) {
          setFormData((prev) => {
            const next = { ...prev };
            if (data.translatedFields.title) {
              (next as any)[`title_${to}`] = data.translatedFields.title;
              if (to === 'en') {
                const currentSlug = prev.slug.trim();
                if (!currentSlug || currentSlug.startsWith('news-') || currentSlug === 'news') {
                  next.slug = data.translatedFields.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '')
                    .slice(0, 80);
                }
              }
            }
            if (data.translatedFields.summary) {
              (next as any)[`summary_${to}`] = data.translatedFields.summary;
            }
            if (data.translatedFields.content) {
              (next as any)[`content_${to}`] = data.translatedFields.content;
            }
            return next;
          });
          toast.success(
            isNe
              ? `सफलतापूर्वक ${from === 'ne' ? 'अंग्रेजीमा' : 'नेपालीमा'} अनुवाद भयो।`
              : `Successfully translated to ${to === 'ne' ? 'Nepali' : 'English'}.`
          );
        }
      } else {
        toast.error(isNe ? 'अनुवाद सेवामा समस्या आयो।' : 'Translation service error.');
      }
    } catch {
      toast.error('Translation failed');
    } finally {
      setTranslatingField(null);
    }
  };

  const triggerDebouncedTranslate = (
    fieldName: 'title' | 'summary' | 'content',
    val: string,
    from: 'ne' | 'en',
    to: 'ne' | 'en',
    delay = 900
  ) => {
    if (!autoTranslate) return;
    if (debounceTimerRef.current[fieldName]) {
      clearTimeout(debounceTimerRef.current[fieldName]);
    }
    if (!val || !val.trim()) return;

    debounceTimerRef.current[fieldName] = setTimeout(() => {
      translateSingleField(fieldName, from, to, val);
    }, delay);
  };

  const loadData = async () => {
    try {
      const [artRes, catRes] = await Promise.all([
        fetch(`/${locale}/api/dashboard/articles`),
        fetch(`/${locale}/api/dashboard/categories`),
      ]);

      if (artRes.ok) {
        const artData = await artRes.json();
        setArticles(artData.articles || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
    } catch {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingArticle(null);
    setFormData({
      title_ne: '',
      title_en: '',
      slug: '',
      category_id: categories[0]?.id || '',
      summary_ne: '',
      summary_en: '',
      content_ne: '',
      content_en: '',
      cover_image_url: '/logo.jpg',
      status: 'draft',
      is_breaking: false,
      is_featured: false,
      seo_title: '',
      seo_description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (art: Article) => {
    setEditingArticle(art);
    setFormData({
      title_ne: art.title_ne,
      title_en: art.title_en,
      slug: art.slug,
      category_id: art.category_id || '',
      summary_ne: art.summary_ne || '',
      summary_en: art.summary_en || '',
      content_ne: art.content_ne,
      content_en: art.content_en,
      cover_image_url: art.cover_image_url || '/logo.jpg',
      status: art.status,
      is_breaking: art.is_breaking,
      is_featured: art.is_featured,
      seo_title: art.seo_title || '',
      seo_description: art.seo_description || '',
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append('file', file);
    body.append('bucket', 'covers');

    try {
      const res = await fetch(`/${locale}/api/dashboard/upload`, {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, cover_image_url: data.url }));
        toast.success(isNe ? 'कभर फोटो सफलतापूर्वक अपलोड भयो।' : 'Cover image uploaded.');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_ne || !formData.title_en || !formData.content_ne || !formData.content_en) {
      toast.error(isNe ? 'कृपया नेपाली र अंग्रेजी दुबै शीर्षक तथा समाचार सामग्री भर्नुहोस्।' : 'Please fill title and content in both locales.');
      return;
    }

    setSaving(true);
    const method = editingArticle ? 'PUT' : 'POST';
    const payload = editingArticle ? { ...formData, id: editingArticle.id } : formData;

    try {
      const res = await fetch(`/${locale}/api/dashboard/articles`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save article');
        setSaving(false);
        return;
      }

      toast.success(
        editingArticle
          ? (isNe ? 'समाचार अद्यावधिक भयो।' : 'Article updated.')
          : (isNe ? 'नयाँ समाचार सिर्जना भयो।' : 'Article created.')
      );
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isNe ? 'के तपाईं यो समाचार हटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const res = await fetch(`/${locale}/api/dashboard/articles?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(isNe ? 'समाचार हटाइयो।' : 'Article deleted.');
        loadData();
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Error deleting article');
    }
  };

  // Filter articles
  const filteredArticles = articles.filter((art) => {
    const title = (isNe ? art.title_ne : art.title_en).toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || art.slug.includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || art.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <DashboardHeader
        title={isNe ? 'समाचार व्यवस्थापन' : 'Article Management'}
        subtitle={isNe ? 'द्विभाषिक समाचार सम्पादन, प्रकाशन र वर्गीकरण' : 'Bilingual publishing, editing and breaking news'}
        locale={locale}
      />

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-text-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isNe ? 'समाचार खोजी गर्नुहोस्...' : 'Search articles...'}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface text-text-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-surface text-text-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">{isNe ? 'सबै स्थिति' : 'All Status'}</option>
            <option value="published">{isNe ? 'प्रकाशित' : 'Published'}</option>
            <option value="draft">{isNe ? 'ड्राफ्ट' : 'Draft'}</option>
            <option value="archived">{isNe ? 'अभिलेख' : 'Archived'}</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isNe ? 'नयाँ समाचार सिर्जना गर्नुहोस्' : 'Write New Article'}</span>
        </button>
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-surface-2 text-text-3 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{isNe ? 'कभर' : 'Cover'}</th>
                <th className="py-3 px-4">{isNe ? 'शीर्षक' : 'Title'}</th>
                <th className="py-3 px-4">{isNe ? 'विधा' : 'Category'}</th>
                <th className="py-3 px-4">{isNe ? 'स्थिति' : 'Status'}</th>
                <th className="py-3 px-4">{isNe ? 'विशेष' : 'Badges'}</th>
                <th className="py-3 px-4">{isNe ? 'पाठक' : 'Views'}</th>
                <th className="py-3 px-4 text-right">{isNe ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-3">
                    {isNe ? 'लोड हुँदैछ...' : 'Loading articles...'}
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-3">
                    {isNe ? 'कुनै समाचार भेटिएन।' : 'No articles found.'}
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-2 border border-border flex-shrink-0">
                        <Image
                          src={art.cover_image_url || '/logo.jpg'}
                          alt={art.title_en}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs font-semibold text-text-1">
                      <div className="truncate font-bold">{isNe ? art.title_ne : art.title_en}</div>
                      <div className="text-[11px] text-text-3 truncate font-normal">{art.slug}</div>
                    </td>
                    <td className="py-3 px-4">
                      {art.category ? (
                        <span
                          style={{ color: art.category.color || '#235DBC' }}
                          className="font-bold text-xs"
                        >
                          {isNe ? art.category.name_ne : art.category.name_en}
                        </span>
                      ) : (
                        <span className="text-text-3">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          art.status === 'published'
                            ? 'bg-accent-3/15 text-accent-3'
                            : art.status === 'draft'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-text-3/15 text-text-3'
                        }`}
                      >
                        {art.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {art.is_breaking && (
                          <span className="p-1 rounded bg-accent-2/15 text-accent-2" title="Breaking">
                            <Flame className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {art.is_featured && (
                          <span className="p-1 rounded bg-accent/15 text-accent" title="Featured">
                            <Star className="w-3.5 h-3.5 fill-accent" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-text-2">
                      {art.view_count || 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/news/${art.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-text-3 hover:text-accent hover:bg-surface-2 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(art)}
                          className="p-1.5 rounded-lg text-text-3 hover:text-accent hover:bg-surface-2 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(art.id)}
                          className="p-1.5 rounded-lg text-text-3 hover:text-accent-2 hover:bg-accent-2/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-surface border border-border rounded-2xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-1">
                {editingArticle
                  ? (isNe ? 'समाचार सम्पादन गर्नुहोस्' : 'Edit News Article')
                  : (isNe ? 'नयाँ समाचार सिर्जना गर्नुहोस्' : 'Create News Article')}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-text-3 hover:text-text-1 hover:bg-surface-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Category, Status, Flags Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-2/60 border border-border">
                <div>
                  <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                    {isNe ? 'समाचार विधा' : 'Category'}
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs sm:text-sm"
                  >
                    <option value="">{isNe ? 'विधा छान्नुहोस्' : 'Select Category'}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {isNe ? cat.name_ne : cat.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                    {isNe ? 'प्रकाशन स्थिति' : 'Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs sm:text-sm font-semibold"
                  >
                    <option value="draft">{isNe ? 'ड्राफ्ट (Draft)' : 'Draft'}</option>
                    <option value="published">{isNe ? 'प्रकाशित (Published)' : 'Published'}</option>
                    <option value="archived">{isNe ? 'अभिलेख (Archived)' : 'Archived'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-4 sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-1">
                    <input
                      type="checkbox"
                      checked={formData.is_breaking}
                      onChange={(e) => setFormData({ ...formData, is_breaking: e.target.checked })}
                      className="rounded border-border text-accent-2 focus:ring-accent-2"
                    />
                    <span>{isNe ? 'ताजा ब्रेकिङ' : 'Breaking'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-1">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span>{isNe ? 'प्रमुख आलेख' : 'Featured'}</span>
                  </label>
                </div>
              </div>

              {/* Cover Image Upload / URL */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                    {isNe ? 'कभर फोटो URL वा अपलोड' : 'Cover Image URL'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.cover_image_url}
                      onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                      placeholder="/logo.jpg"
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs sm:text-sm"
                    />
                    <label className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-xs font-bold text-text-1 hover:bg-border cursor-pointer flex items-center gap-1.5 flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? '...' : (isNe ? 'अपलोड' : 'Upload')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-4 flex items-center gap-3">
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-surface-2 border border-border flex-shrink-0">
                    <Image
                      src={formData.cover_image_url || '/logo.jpg'}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[11px] text-text-3">
                    {isNe ? 'आधिकारिक logo.jpg पूर्ववत सक्रिय' : 'Default: /logo.jpg'}
                  </span>
                </div>
              </div>

              {/* Bilingual Auto-Sync Translation Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-accent/10 via-surface-2 to-accent-3/10 border border-accent/25 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent text-white shadow-sm flex-shrink-0">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs sm:text-sm font-bold text-text-1">
                        {isNe ? 'द्विभाषिक स्वतः अनुवाद (Bilingual Auto-Sync)' : 'Bilingual Auto-Sync Engine'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoTranslate}
                          onChange={(e) => setAutoTranslate(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
                      </label>
                    </div>
                    <p className="text-[11px] text-text-3 mt-0.5">
                      {isNe
                        ? 'नेपालीमा लेख्दा अंग्रेजीमा र अंग्रेजीमा लेख्दा नेपालीमा स्वतः अनुवाद हुन्छ।'
                        : 'Typing in Nepali auto-translates to English; typing in English auto-translates to Nepali.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {translatingField && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/15 text-accent text-xs font-bold animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>
                        {translatingField === 'all'
                          ? (isNe ? 'सबै अनुवाद हुँदैछ...' : 'Translating all...')
                          : (isNe ? `${translatingField} अनुवाद हुँदैछ...` : `Translating ${translatingField}...`)}
                      </span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => translateAllFields('ne', 'en')}
                    disabled={translatingField !== null}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold text-text-1 hover:border-accent hover:text-accent transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                    title="Translate entire article from Nepali to English"
                  >
                    <span>🇳🇵 ➔ 🇬🇧 {isNe ? 'सम्पूर्ण अंग्रेजीमा' : 'To English'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => translateAllFields('en', 'ne')}
                    disabled={translatingField !== null}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold text-text-1 hover:border-accent hover:text-accent transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                    title="Translate entire article from English to Nepali"
                  >
                    <span>🇬🇧 ➔ 🇳🇵 {isNe ? 'सम्पूर्ण नेपालीमा' : 'To Nepali'}</span>
                  </button>
                </div>
              </div>

              {/* Multilingual Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-text-1 uppercase tracking-wider">
                      {isNe ? 'नेपाली समाचार शीर्षक *' : 'Nepali Title *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => translateSingleField('title', 'en', 'ne')}
                      disabled={translatingField !== null || !formData.title_en}
                      className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-semibold disabled:opacity-40"
                      title="Translate from English"
                    >
                      <RefreshCw className={`w-3 h-3 ${translatingField === 'title' ? 'animate-spin' : ''}`} />
                      <span>{isNe ? 'अंग्रेजीबाट अनुवाद' : 'From EN'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.title_ne}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActiveSourceLocale('ne');
                      setFormData((prev) => ({ ...prev, title_ne: val }));
                      triggerDebouncedTranslate('title', val, 'ne', 'en', 800);
                    }}
                    onBlur={(e) => {
                      if (autoTranslate && e.target.value.trim() && !formData.title_en) {
                        translateSingleField('title', 'ne', 'en', e.target.value);
                      }
                    }}
                    placeholder="नेपाली भाषामा मुख्य शीर्षक..."
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-text-1 uppercase tracking-wider">
                      {isNe ? 'अंग्रेजी शीर्षक *' : 'English Title *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => translateSingleField('title', 'ne', 'en')}
                      disabled={translatingField !== null || !formData.title_ne}
                      className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-semibold disabled:opacity-40"
                      title="Translate from Nepali"
                    >
                      <RefreshCw className={`w-3 h-3 ${translatingField === 'title' ? 'animate-spin' : ''}`} />
                      <span>{isNe ? 'नेपालीबाट अनुवाद' : 'From NE'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActiveSourceLocale('en');
                      setFormData((prev) => {
                        const next = { ...prev, title_en: val };
                        if (!prev.slug || prev.slug.startsWith('news-')) {
                          next.slug = val
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '')
                            .slice(0, 80);
                        }
                        return next;
                      });
                      triggerDebouncedTranslate('title', val, 'en', 'ne', 800);
                    }}
                    onBlur={(e) => {
                      if (autoTranslate && e.target.value.trim() && !formData.title_ne) {
                        translateSingleField('title', 'en', 'ne', e.target.value);
                      }
                    }}
                    placeholder="English headline..."
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Slug Row */}
              <div>
                <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                  {isNe ? 'URL स्लग (Slug) *' : 'URL Slug *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="news-article-slug"
                  className="w-full font-mono px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs sm:text-sm"
                />
              </div>

              {/* Multilingual Summaries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-text-1 uppercase tracking-wider">
                      {isNe ? 'नेपाली सारांश' : 'Nepali Summary'}
                    </label>
                    <button
                      type="button"
                      onClick={() => translateSingleField('summary', 'en', 'ne')}
                      disabled={translatingField !== null || !formData.summary_en}
                      className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-semibold disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${translatingField === 'summary' ? 'animate-spin' : ''}`} />
                      <span>{isNe ? 'अंग्रेजीबाट अनुवाद' : 'From EN'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.summary_ne}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActiveSourceLocale('ne');
                      setFormData((prev) => ({ ...prev, summary_ne: val }));
                      triggerDebouncedTranslate('summary', val, 'ne', 'en', 1000);
                    }}
                    placeholder="संक्षिप्त सारांश (Lead Paragraph)..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-text-1 uppercase tracking-wider">
                      {isNe ? 'अंग्रेजी सारांश' : 'English Summary'}
                    </label>
                    <button
                      type="button"
                      onClick={() => translateSingleField('summary', 'ne', 'en')}
                      disabled={translatingField !== null || !formData.summary_ne}
                      className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-semibold disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${translatingField === 'summary' ? 'animate-spin' : ''}`} />
                      <span>{isNe ? 'नेपालीबाट अनुवाद' : 'From NE'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.summary_en}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActiveSourceLocale('en');
                      setFormData((prev) => ({ ...prev, summary_en: val }));
                      triggerDebouncedTranslate('summary', val, 'en', 'ne', 1000);
                    }}
                    placeholder="Brief lead summary in English..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Multilingual Markdown Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-text-1 uppercase tracking-wider">
                      {isNe ? 'नेपाली समाचार सामग्री (Markdown) *' : 'Nepali Content (Markdown) *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => translateSingleField('content', 'en', 'ne')}
                      disabled={translatingField !== null || !formData.content_en}
                      className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-semibold disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${translatingField === 'content' ? 'animate-spin' : ''}`} />
                      <span>{isNe ? 'अंग्रेजीबाट अनुवाद' : 'From EN'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={9}
                    required
                    value={formData.content_ne}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActiveSourceLocale('ne');
                      setFormData((prev) => ({ ...prev, content_ne: val }));
                      triggerDebouncedTranslate('content', val, 'ne', 'en', 1200);
                    }}
                    placeholder="# मुख्य समाचार विवरण..."
                    className="w-full font-mono px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-text-1 uppercase tracking-wider">
                      {isNe ? 'अंग्रेजी समाचार सामग्री (Markdown) *' : 'English Content (Markdown) *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => translateSingleField('content', 'ne', 'en')}
                      disabled={translatingField !== null || !formData.content_ne}
                      className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-semibold disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${translatingField === 'content' ? 'animate-spin' : ''}`} />
                      <span>{isNe ? 'नेपालीबाट अनुवाद' : 'From NE'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={9}
                    required
                    value={formData.content_en}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActiveSourceLocale('en');
                      setFormData((prev) => ({ ...prev, content_en: val }));
                      triggerDebouncedTranslate('content', val, 'en', 'ne', 1200);
                    }}
                    placeholder="# Comprehensive news body in English..."
                    className="w-full font-mono px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-border bg-surface text-text-2 font-bold text-xs sm:text-sm hover:bg-surface-2"
                >
                  {isNe ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? (isNe ? 'सुरक्षित गर्दै...' : 'Saving...') : (isNe ? 'समाचार सुरक्षित गर्नुहोस्' : 'Save Article')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
