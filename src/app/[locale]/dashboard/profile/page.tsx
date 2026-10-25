'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  UserCheck,
  Save,
  Upload,
  Check,
  Mail,
  Phone,
  MapPin,
  Share2,
  Plus,
  Trash2,
  Globe,
  ExternalLink,
} from 'lucide-react';
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

  const [profile, setProfile] = useState<Profile & { secondary_email?: string }>({
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Ritesh Prajapati',
    headline: 'Editor-in-Chief & Founder, YouTh Brain News',
    bio: 'Journalist, technologist, and digital media innovator covering Nepal and the world.',
    about_description:
      'YouTh Brain News is a premier independent digital news portal committed to impartial, verified, and timely news reporting.',
    avatar_url: '/logo.jpg',
    email: 'panditritesh005@gmail.com',
    secondary_email: 'info@youthbrainnews.com.np',
    phone: '+977-9800000000',
    location: 'Hetauda, Nepal',
    status: 'active',
    created_at: '',
    updated_at: '',
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // New social link input state
  const [newPlatform, setNewPlatform] = useState('instagram');
  const [newUrl, setNewUrl] = useState('');

  const loadProfile = async () => {
    try {
      const res = await fetch(`/${locale}/api/dashboard/profile`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        if (Array.isArray(data.socialLinks)) setSocialLinks(data.socialLinks);
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

  const handleAddSocialLink = () => {
    if (!newUrl.trim()) {
      toast.error(isNe ? 'कृपया सामाजिक सञ्जालको URL प्रविष्ट गर्नुहोस्।' : 'Please enter a valid URL.');
      return;
    }

    const platformLabels: Record<string, string> = {
      facebook: 'Facebook',
      twitter: 'X (Twitter)',
      youtube: 'YouTube',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
      tiktok: 'TikTok',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      threads: 'Threads',
      github: 'GitHub',
    };

    const newLink: SocialLink = {
      id: `social-${Date.now()}`,
      platform: newPlatform,
      label: platformLabels[newPlatform] || newPlatform,
      url: newUrl.trim(),
      is_active: true,
      sort_order: socialLinks.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSocialLinks((prev) => [...prev, newLink]);
    setNewUrl('');
    toast.success(isNe ? 'नयाँ सामाजिक सञ्जाल थपियो।' : 'Social channel added.');
  };

  const handleDeleteSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((l) => l.id !== id));
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
        toast.success(
          isNe
            ? 'सम्पर्क विवरण, इमेल र सामाजिक सञ्जाल सुरक्षित भयो।'
            : 'Contact details, email, and social media saved successfully.'
        );
      } else {
        toast.error('Save failed');
      }
    } catch {
      toast.error('Error saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-text-3">
        {isNe ? 'विवरण लोड हुँदैछ...' : 'Loading profile...'}
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title={isNe ? 'सम्पर्क विवरण, इमेल र सामाजिक सञ्जाल' : 'Contact Details, Email & Social Media'}
        subtitle={
          isNe
            ? 'प्रधान सम्पादकको इमेल, फोन, ठेगाना, बायो र पोर्टलका सामाजिक च्यानलहरू परिवर्तन गर्नुहोस्'
            : 'Manage editorial email, hotline phone, office location, bio, and social channels'
        }
        locale={locale}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact Details & Official Emails */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-sm">
          <h3 className="text-lg font-bold text-text-1 mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-accent" />
            <span>{isNe ? 'इमेल तथा सम्पर्क ठेगाना' : 'Email & Contact Details'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5">
                {isNe ? 'प्रधान सम्पादक इमेल (Primary Email)' : 'Primary Email (Editor-in-Chief)'} *
              </label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm font-semibold focus:border-accent focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-text-3 mt-1">
                {isNe
                  ? 'यो इमेल फुटर र आधिकारिक सम्पर्क कार्डमा प्रदर्शन हुन्छ।'
                  : 'Displayed on footer and official correspondence cards.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5">
                {isNe ? 'सम्पादकीय डेस्क इमेल (Public Editorial Email)' : 'Editorial Desk Email'}
              </label>
              <input
                type="email"
                value={profile.secondary_email || ''}
                onChange={(e) => setProfile({ ...profile, secondary_email: e.target.value })}
                placeholder="info@youthbrainnews.com.np"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm font-semibold focus:border-accent focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-text-3 mt-1">
                {isNe
                  ? 'सम्पर्क पृष्ठ (Contact Page) मा देखिने सोधपुछ इमेल।'
                  : 'Public inquiries email on the Contact Page.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-accent" />
                <span>{isNe ? 'सम्पर्क फोन / हटलाइन' : 'Hotline Phone'}</span>
              </label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+977-9800000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm font-semibold focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>{isNe ? 'कार्यालय ठेगाना / स्थान' : 'Office Location'}</span>
              </label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="Hetauda, Nepal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm font-semibold focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Editor Identity & Bio */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-sm">
          <h3 className="text-lg font-bold text-text-1 mb-6 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-accent" />
            <span>{isNe ? 'सम्पादकीय परिचय र बायो' : 'Editor Identity & Bio'}</span>
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
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border text-xs font-bold text-text-1 hover:bg-border cursor-pointer shadow-sm transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? '...' : isNe ? 'नयाँ फोटो परिवर्तन' : 'Change Avatar'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
              <p className="text-[11px] text-text-3">
                {isNe
                  ? 'आधिकारिक logo.jpg वा सम्पादकको फोटो छान्नुहोस्।'
                  : 'Official logo.jpg or editor headshot.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                {isNe ? 'पूरा नाम (Full Name)' : 'Full Name'} *
              </label>
              <input
                type="text"
                required
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm font-semibold focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                {isNe ? 'सम्पादकीय पदवी (Headline)' : 'Headline Title'}
              </label>
              <input
                type="text"
                value={profile.headline || ''}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                placeholder="Editor-in-Chief & Founder"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm font-semibold focus:border-accent focus:outline-none transition-colors"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm leading-relaxed focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-1 uppercase tracking-wider mb-1">
                {isNe ? 'हाम्रोबारे विस्तृत विवरण' : 'About Portal Description'}
              </label>
              <textarea
                rows={3}
                value={profile.about_description || ''}
                onChange={(e) => setProfile({ ...profile, about_description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary text-text-1 text-sm leading-relaxed focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Social Channels Manager */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-border gap-2">
            <div>
              <h3 className="text-lg font-bold text-text-1 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-accent" />
                <span>{isNe ? 'सामाजिक सञ्जाल च्यानलहरू' : 'Social Media Channels'}</span>
              </h3>
              <p className="text-xs text-text-3 mt-1">
                {isNe
                  ? 'यी लिङ्कहरू वेबसाइटको फुटर, सम्पर्क पृष्ठ र सेयर बारमा स्वतः सक्रिय हुन्छन्।'
                  : 'Configured links render automatically across the footer and social bar.'}
              </p>
            </div>
          </div>

          {/* Existing Links List */}
          <div className="space-y-3 mb-6">
            {socialLinks.map((link, idx) => (
              <div
                key={link.id || `social-${idx}`}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl bg-bg-primary border border-border"
              >
                <div className="w-32 flex-shrink-0 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <span className="text-xs font-bold text-text-1 uppercase tracking-wider">
                    {link.label || link.platform}
                  </span>
                </div>

                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSocialLinks((prev) =>
                        prev.map((l, i) => (i === idx ? { ...l, url: val } : l))
                      );
                    }}
                    placeholder={`https://${link.platform}.com/...`}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text-1 text-xs font-mono focus:border-accent focus:outline-none"
                  />
                  {link.url && (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-text-3 hover:text-accent hover:bg-surface-2 transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <label className="flex items-center gap-1.5 text-xs text-text-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={link.is_active}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSocialLinks((prev) =>
                          prev.map((l, i) => (i === idx ? { ...l, is_active: checked } : l))
                        );
                      }}
                      className="w-4 h-4 rounded text-accent cursor-pointer"
                    />
                    <span>{link.is_active ? (isNe ? 'सक्रिय' : 'Active') : (isNe ? 'निष्क्रिय' : 'Disabled')}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteSocialLink(link.id)}
                    className="p-1.5 text-text-3 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Channel Control */}
          <div className="p-4 rounded-xl border border-dashed border-border bg-surface-2/60">
            <h4 className="text-xs font-bold text-text-1 uppercase tracking-wider mb-3">
              {isNe ? '+ नयाँ सामाजिक सञ्जाल थप्नुहोस्' : '+ Add New Social Channel'}
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                className="w-full sm:w-44 px-3 py-2 rounded-lg border border-border bg-surface text-text-1 text-xs font-bold"
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">X (Twitter)</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="threads">Threads</option>
                <option value="github">GitHub</option>
              </select>

              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="flex-1 w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-1 text-xs font-mono"
              />

              <button
                type="button"
                onClick={handleAddSocialLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-border hover:border-accent hover:text-accent text-xs font-bold text-text-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isNe ? 'थप्नुहोस्' : 'Add'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving
                ? isNe
                  ? 'सुरक्षित गर्दै...'
                  : 'Saving...'
                : isNe
                ? 'सबै परिवर्तन सुरक्षित गर्नुहोस्'
                : 'Save All Changes'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
