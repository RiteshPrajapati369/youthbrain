'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { Category } from '@/types';

interface CategoriesPageProps {
  params: {
    locale: string;
  };
}

export default function DashboardCategoriesPage({ params: { locale } }: CategoriesPageProps) {
  const isNe = locale === 'ne';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name_ne: '',
    name_en: '',
    slug: '',
    description_ne: '',
    description_en: '',
    color: '#235DBC',
    sort_order: 1,
    is_active: true,
  });

  const loadCategories = async () => {
    try {
      const res = await fetch(`/${locale}/api/dashboard/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name_ne: '',
      name_en: '',
      slug: '',
      description_ne: '',
      description_en: '',
      color: '#235DBC',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name_ne: cat.name_ne,
      name_en: cat.name_en,
      slug: cat.slug,
      description_ne: cat.description_ne || '',
      description_en: cat.description_en || '',
      color: cat.color || '#235DBC',
      sort_order: cat.sort_order || 0,
      is_active: cat.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_ne || !formData.name_en) {
      toast.error(isNe ? 'कृपया विधाको नेपाली र अंग्रेजी नाम लेख्नुहोस्।' : 'Please enter names in both languages.');
      return;
    }

    setSaving(true);
    const method = editingCategory ? 'PUT' : 'POST';
    const payload = editingCategory ? { ...formData, id: editingCategory.id } : formData;

    try {
      const res = await fetch(`/${locale}/api/dashboard/categories`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save');
        setSaving(false);
        return;
      }

      toast.success(
        editingCategory
          ? (isNe ? 'विधा अद्यावधिक भयो।' : 'Category updated.')
          : (isNe ? 'नयाँ विधा थपियो।' : 'Category created.')
      );
      setIsModalOpen(false);
      loadCategories();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isNe ? 'के तपाईं यो विधा हटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const res = await fetch(`/${locale}/api/dashboard/categories?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(isNe ? 'विधा हटाइयो।' : 'Category deleted.');
        loadCategories();
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Error deleting');
    }
  };

  return (
    <div>
      <DashboardHeader
        title={isNe ? 'समाचार विधा व्यवस्थापन' : 'Category Management'}
        subtitle={isNe ? 'समाचार विधाहरूको सूची, रङ्ग कोड र क्रम निर्धारण' : 'Configure categories, custom colors, and sorting'}
        locale={locale}
      />

      <div className="flex justify-between items-center mb-6">
        <div className="text-xs text-text-3 font-semibold">
          {isNe ? `कुल विधाहरू: ${categories.length}` : `Total categories: ${categories.length}`}
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isNe ? 'नयाँ विधा थप्नुहोस्' : 'Create Category'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-text-3">
            {isNe ? 'लोड हुँदैछ...' : 'Loading categories...'}
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-text-3">
            {isNe ? 'कुनै विधा भेटिएन।' : 'No categories configured.'}
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: cat.color || '#235DBC' }}
                    />
                    <span className="font-extrabold text-base text-text-1">
                      {isNe ? cat.name_ne : cat.name_en}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.is_active ? 'bg-accent-3/15 text-accent-3' : 'bg-text-3/15 text-text-3'
                    }`}
                  >
                    {cat.is_active ? (isNe ? 'सक्रिय' : 'Active') : (isNe ? 'निष्क्रिय' : 'Inactive')}
                  </span>
                </div>

                <div className="text-xs text-text-2 mb-1">
                  <strong>EN:</strong> {cat.name_en}
                </div>
                <div className="text-xs text-text-3 font-mono mb-2">
                  <strong>Slug:</strong> /{cat.slug}
                </div>
                {(cat.description_ne || cat.description_en) && (
                  <p className="text-xs text-text-3 line-clamp-2">
                    {isNe ? cat.description_ne : cat.description_en}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs">
                <span className="text-text-3 font-mono">
                  {isNe ? 'क्रम:' : 'Order:'} {cat.sort_order}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-text-3 hover:text-accent hover:bg-surface-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg text-text-3 hover:text-accent-2 hover:bg-accent-2/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <h3 className="text-xl font-bold text-text-1">
                {editingCategory
                  ? (isNe ? 'विधा सम्पादन गर्नुहोस्' : 'Edit Category')
                  : (isNe ? 'नयाँ विधा थप्नुहोस्' : 'Create Category')}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-text-3 hover:text-text-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                  {isNe ? 'नेपाली नाम *' : 'Nepali Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_ne}
                  onChange={(e) => setFormData({ ...formData, name_ne: e.target.value })}
                  placeholder="उदा: प्रविधि"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                  {isNe ? 'अंग्रेजी नाम *' : 'English Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Technology"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="technology"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                    {isNe ? 'रङ्ग कोड' : 'Brand Color'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-9 p-0.5 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-2 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                    {isNe ? 'प्रदर्शन क्रम (Sort)' : 'Sort Order'}
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-1">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span>{isNe ? 'सक्रिय विधा' : 'Active'}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                  {isNe ? 'नेपाली विवरण' : 'Nepali Description'}
                </label>
                <textarea
                  rows={2}
                  value={formData.description_ne}
                  onChange={(e) => setFormData({ ...formData, description_ne: e.target.value })}
                  placeholder="यस विधामा समेटिने विषयहरू..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-2 hover:bg-surface-2"
                >
                  {isNe ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saving ? '...' : (isNe ? 'सुरक्षित गर्नुहोस्' : 'Save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
