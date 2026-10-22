'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Copy, Check, Trash2, Folder, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { MediaItem } from '@/types';

interface MediaPageProps {
  params: {
    locale: string;
  };
}

export default function DashboardMediaPage({ params: { locale } }: MediaPageProps) {
  const isNe = locale === 'ne';
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadMedia = async () => {
    try {
      const res = await fetch(`/${locale}/api/dashboard/media`);
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data.media || []);
      }
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', selectedFolder === 'all' ? 'media' : selectedFolder);
      formData.append('alt_ne', file.name);
      formData.append('alt_en', file.name);

      try {
        const res = await fetch(`/${locale}/api/dashboard/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || 'Upload error');
        }
      } catch {
        toast.error('Upload failed');
      }
    }

    toast.success(isNe ? 'मिडिया सफलतापूर्वक अपलोड भयो।' : 'Files uploaded successfully.');
    setUploading(false);
    loadMedia();
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success(isNe ? 'URL कपी गरियो!' : 'Image URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isNe ? 'के तपाईं यो मिडिया हटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete this media item?')) {
      return;
    }

    try {
      const res = await fetch(`/${locale}/api/dashboard/media?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(isNe ? 'मिडिया हटाइयो।' : 'Media item deleted.');
        loadMedia();
      } else {
        toast.error('Delete failed');
      }
    } catch {
      toast.error('Delete error');
    }
  };

  const filteredItems = mediaItems.filter((item) => {
    if (selectedFolder === 'all') return true;
    return item.folder === selectedFolder;
  });

  return (
    <div>
      <DashboardHeader
        title={isNe ? 'मिडिया पुस्तकालय' : 'Media Library'}
        subtitle={isNe ? 'समाचारका लागि तस्विर अपलोड र व्यवस्थापन' : 'Upload, organize and reuse assets across articles'}
        locale={locale}
      />

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {['all', 'covers', 'articles', 'media', 'gallery'].map((folder) => (
            <button
              key={folder}
              type="button"
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedFolder === folder
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-surface text-text-2 hover:bg-surface-2'
              }`}
            >
              {folder}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex-shrink-0">
          <Upload className="w-4 h-4" />
          <span>{uploading ? (isNe ? 'अपलोड हुँदैछ...' : 'Uploading...') : (isNe ? 'नयाँ फोटो अपलोड गर्नुहोस्' : 'Upload Images')}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-text-3">
            {isNe ? 'मिडिया लोड हुँदैछ...' : 'Loading media items...'}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-16 text-center text-text-3 bg-surface rounded-2xl border border-border">
            <Folder className="w-10 h-10 mx-auto text-text-3 opacity-40 mb-3" />
            <p className="text-sm font-semibold">
              {isNe ? 'यस फोल्डरमा कुनै तस्विर भेटिएन।' : 'No media items in this bucket.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden bg-surface border border-border shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-square w-full bg-surface-2 overflow-hidden">
                <Image
                  src={item.url}
                  alt={item.alt_en || 'Media'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm uppercase">
                  {item.folder}
                </span>
              </div>

              <div className="p-2.5 flex items-center justify-between text-xs bg-surface border-t border-border">
                <span className="text-[11px] text-text-3 truncate max-w-[100px]">
                  {item.alt_en || 'image'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.url, item.id)}
                    className="p-1 rounded text-text-3 hover:text-accent hover:bg-surface-2"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-accent-3" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded text-text-3 hover:text-accent hover:bg-surface-2"
                    title="Open full image"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded text-text-3 hover:text-accent-2 hover:bg-accent-2/10"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
