'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Save, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { HomepageSection } from '@/types';

interface HomepageConfigPageProps {
  params: {
    locale: string;
  };
}

export default function DashboardHomepagePage({ params: { locale } }: HomepageConfigPageProps) {
  const isNe = locale === 'ne';
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSections = async () => {
    try {
      const res = await fetch(`/${locale}/api/dashboard/homepage`);
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
      }
    } catch {
      toast.error('Failed to load homepage sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleUpdate = (id: string, field: keyof HomepageSection, value: any) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, [field]: value } : sec))
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/${locale}/api/dashboard/homepage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });

      if (res.ok) {
        toast.success(isNe ? 'गृहपृष्ठ संरचना सफलतापूर्वक सुरक्षित भयो।' : 'Homepage layout saved successfully.');
      } else {
        toast.error('Failed to save layout');
      }
    } catch {
      toast.error('Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title={isNe ? 'गृहपृष्ठ संरचना व्यवस्थापन' : 'Homepage Section Configuration'}
        subtitle={isNe ? 'ताजा ब्रेकिङ टिकर, मुख्य समाचार र विधा ब्लकहरूको क्रम मिलाउनुहोस्' : 'Manage section visibility, sorting and display parameters'}
        locale={locale}
      />

      <div className="flex justify-between items-center mb-6">
        <p className="text-xs text-text-3">
          {isNe
            ? 'सक्रिय बनाउन चेकबक्समा चिन्ह लगाउनुहोस् र प्रदर्शन क्रम मिलाउनुहोस्।'
            : 'Toggle active status and adjust display order numbers.'}
        </p>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? (isNe ? 'सुरक्षित गर्दै...' : 'Saving...') : (isNe ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'Save Changes')}</span>
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-text-3 bg-surface rounded-2xl border border-border">
            {isNe ? 'खण्डहरू लोड हुँदैछ...' : 'Loading sections...'}
          </div>
        ) : sections.length === 0 ? (
          <div className="py-16 text-center text-text-3 bg-surface rounded-2xl border border-border">
            {isNe ? 'कुनै खण्ड कन्फिगर गरिएको छैन।' : 'No homepage sections found.'}
          </div>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className={`p-5 rounded-2xl border transition-all ${
                section.is_active
                  ? 'bg-surface border-border shadow-sm'
                  : 'bg-surface/50 border-border/50 opacity-60'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Active Checkbox & Key */}
                <div className="md:col-span-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={section.is_active}
                    onChange={(e) => handleUpdate(section.id, 'is_active', e.target.checked)}
                    className="w-4 h-4 rounded text-accent focus:ring-accent"
                  />
                  <div>
                    <span className="font-extrabold text-sm text-text-1 capitalize block">
                      {section.section_key}
                    </span>
                    <span className="text-[11px] text-text-3 font-mono">
                      key: {section.section_key}
                    </span>
                  </div>
                </div>

                {/* Nepali Title */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-text-3 uppercase mb-1">
                    {isNe ? 'नेपाली शीर्षक' : 'Nepali Title'}
                  </label>
                  <input
                    type="text"
                    value={section.title_ne}
                    onChange={(e) => handleUpdate(section.id, 'title_ne', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-text-1 text-xs font-semibold"
                  />
                </div>

                {/* English Title */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-text-3 uppercase mb-1">
                    {isNe ? 'अंग्रेजी शीर्षक' : 'English Title'}
                  </label>
                  <input
                    type="text"
                    value={section.title_en}
                    onChange={(e) => handleUpdate(section.id, 'title_en', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-text-1 text-xs font-semibold"
                  />
                </div>

                {/* Sort Order */}
                <div className="md:col-span-3 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-text-3 uppercase mb-1">
                      {isNe ? 'क्रम (Sort)' : 'Sort Order'}
                    </label>
                    <input
                      type="number"
                      value={section.sort_order}
                      onChange={(e) => handleUpdate(section.id, 'sort_order', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-text-1 text-xs font-mono"
                    />
                  </div>
                  <span
                    className={`mt-4 px-2 py-1 rounded text-[10px] font-bold ${
                      section.is_active ? 'bg-accent-3/15 text-accent-3' : 'bg-text-3/15 text-text-3'
                    }`}
                  >
                    {section.is_active ? (isNe ? 'सक्रिय' : 'Active') : (isNe ? 'निष्क्रिय' : 'Off')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
