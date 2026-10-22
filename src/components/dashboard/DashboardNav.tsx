'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Sliders,
  Inbox,
  UserCheck,
  ShieldAlert,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { logoutAction } from '@/lib/auth-actions';
import { toast } from 'sonner';

interface DashboardNavProps {
  locale: string;
}

export function DashboardNav({ locale }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isNe = locale === 'ne';

  const menuItems = [
    {
      href: `/${locale}/dashboard`,
      label: isNe ? 'ओभरभ्यू' : 'Overview',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/${locale}/dashboard/articles`,
      label: isNe ? 'समाचार आलेख' : 'Articles',
      icon: FileText,
    },
    {
      href: `/${locale}/dashboard/categories`,
      label: isNe ? 'समाचार विधा' : 'Categories',
      icon: FolderTree,
    },
    {
      href: `/${locale}/dashboard/media`,
      label: isNe ? 'मिडिया पुस्तकालय' : 'Media Library',
      icon: ImageIcon,
    },
    {
      href: `/${locale}/dashboard/homepage`,
      label: isNe ? 'गृहपृष्ठ संरचना' : 'Homepage Layout',
      icon: Sliders,
    },
    {
      href: `/${locale}/dashboard/messages`,
      label: isNe ? 'सम्पर्क सन्देश' : 'Inquiries',
      icon: Inbox,
    },
    {
      href: `/${locale}/dashboard/profile`,
      label: isNe ? 'सम्पादक प्रोफाइल' : 'Editor Profile',
      icon: UserCheck,
    },
    {
      href: `/${locale}/dashboard/security`,
      label: isNe ? 'सुरक्षा र लग' : 'Security & Logs',
      icon: ShieldAlert,
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutAction();
      toast.success(isNe ? 'सफलतापूर्वक लगआउट भयो।' : 'Logged out securely.');
      router.push(`/${locale}/auth/login`);
      router.refresh();
    } catch {
      toast.error('Logout error');
    }
  };

  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen flex flex-col justify-between p-4 flex-shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-border">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-accent shadow-sm flex-shrink-0">
            <Image src="/logo.jpg" alt="YouTh Brain News" fill className="object-cover" priority />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-text-1 leading-tight">
              {isNe ? 'युथ ब्रेन CMS' : 'YouTh Brain CMS'}
            </span>
            <span className="text-[10px] text-accent font-semibold">
              panditritesh005@gmail.com
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-2 hover:text-text-1 hover:bg-surface-2'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-3'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-4 border-t border-border space-y-2">
        <Link
          href={`/${locale}`}
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-text-2 hover:text-text-1 hover:bg-surface-2 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-text-3" />
            <span>{isNe ? 'सार्वजनिक साइट' : 'Live Website'}</span>
          </span>
          <span className="text-[10px] bg-surface-2 px-1.5 py-0.5 rounded text-text-3">↗</span>
        </Link>

        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-accent-2 hover:bg-accent-2/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{isNe ? 'सुरक्षित लगआउट' : 'Secure Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
