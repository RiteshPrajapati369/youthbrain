'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { UserCheck, Save, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { Profile, SocialLink } from '@/types';

interface ProfilePageProps {
  params: {
    locale: string;
  };
}

export default function DashboardProfilePage({ params: { locale } }: ProfilePageProps) {
  const isNe = locale === 'ne';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Ritesh Prajapati',
    headline: 'Editor-in-Chief & Founder, YouTh Brain News',
    bio: 'Journalist, technologist, and digital media innovator covering Nepal and the world.',
    about_description: 'YouTh Brain News is a premier independent digital news portal committed to impartial, verified, and timely news reporting.',
    avatar_url: '/logo.jpg',
    email: 'panditritesh005@gmail.com',
    phone: '+977-9800000000',
    location: 'Kathmandu, Nepal',
    status: 'active',
    created_at: '',
    updated_at: '',
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const loadProfile = async () => {
    try {
      const res = await fetch(`/${locale}/api/dashboard/profile`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        if (data.socialLinks) setSocialLinks(data.socialLinks);
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'avatars');

    try {
      const res = await fetch(`/${locale}/api/dashboard/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setProfile((prev) => ({ ...prev, avatar_url: data.url }));
        toast.success(isNe ? 'प्रोफाइल तस्विर अपडेट भयो।' : 'Avatar uploaded.');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/${locale}/api/dashboard/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, socialLinks }),
      });

      if (res.ok) {
        toast.success(isNe ? 'सम्पादक प्रोफाइल सुरक्षित गरियो।' : 'Profile saved successfully.');
      } else {
        toast.error('Save failed');
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
        title={isNe ? 'सम्पादक तथा पोर्टल प्रोफाइल' : 'Editor & Portal Profile'}
        subtitle={isNe ? 'प्रधान सम्पादकको विवरण, बायो, ब्राण्डिङ र सामाजिक सञ्जाल' : 'Owner leadership identity, bio and publication credentials'}
        locale={locale}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Identity Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-sm">
          <h3 className="text-lg font-bold text-text-1 mb-6 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-accent" />
            <span>{isNe ? 'सम्पादकीय परिचय' : 'Editor Identity'}</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-border">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-accent shadow-md flex-shrink-0 bg-surface-2">
              <Image
                src={profile.avatar_url || '/logo.jpg'}
                alt={profile.full_name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border text-xs font-bold text-text-1 hover:bg-border cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? '...' : (isNe ? 'नयाँ फोटो परिवर्तन' : 'Change Avatar')}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
              <p className="text-[11px] text-text-3">
                {isNe ? 'आधिकारिक logo.jpg वा नयाँ फोटो छान्नुहोस्।' : 'Official logo.jpg or custom photo.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                {isNe ? 'पूरा नाम' : 'Full Name'} *
              </label>
              <input
                type="text"
                required
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-1 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                {isNe ? 'इमेल ठेगाना' : 'Email (Owner)'}
              </label>
              <input
                type="email"
                readOnly
                value={profile.email}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-text-3 text-sm cursor-not-allowed font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                {isNe ? 'सम्पादकीय पदवी (Headline)' : 'Headline Title'}
              </label>
              <input
                type="text"
                value={profile.headline || ''}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                placeholder="Editor-in-Chief & Founder"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                {isNe ? 'फोन' : 'Phone'}
              </label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                {isNe ? 'स्थान' : 'Location'}
              </label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                {isNe ? 'सम्पादकीय संक्षिप्त बायो' : 'Short Bio'}
              </label>
              <textarea
                rows={3}
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-sm leading-relaxed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                {isNe ? 'हाम्रोबारे विस्तृत विवरण' : 'About Portal Description'}
              </label>
              <textarea
                rows={4}
                value={profile.about_description || ''}
                onChange={(e) => setProfile({ ...profile, about_description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Social Links Configuration */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-sm">
          <h3 className="text-lg font-bold text-text-1 mb-4">
            {isNe ? 'सामाजिक सञ्जाल च्यानलहरू' : 'Social Channels'}
          </h3>

          <div className="space-y-3">
            {socialLinks.map((link, idx) => (
              <div key={link.id} className="flex items-center gap-3">
                <span className="w-24 text-xs font-bold uppercase text-text-2">
                  {link.platform}
                </span>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSocialLinks((prev) =>
                      prev.map((l, i) => (i === idx ? { ...l, url: val } : l))
                    );
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-1 text-xs font-mono"
                />
                <input
                  type="checkbox"
                  checked={link.is_active}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSocialLinks((prev) =>
                      prev.map((l, i) => (i === idx ? { ...l, is_active: checked } : l))
                    );
                  }}
                  className="w-4 h-4 rounded text-accent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? (isNe ? 'सुरक्षित गर्दै...' : 'Saving...') : (isNe ? 'प्रोफाइल सुरक्षित गर्नुहोस्' : 'Save Profile')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
