import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Eye,
  FolderTree,
  Inbox,
  ShieldCheck,
  Plus,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { createAdminClient } from '@/lib/supabase-admin';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { Article } from '@/types';

interface DashboardPageProps {
  params: {
    locale: string;
  };
}

export default async function DashboardOverviewPage({ params: { locale } }: DashboardPageProps) {
  const isNe = locale === 'ne';
  const supabase = createAdminClient();

  // Fetch metrics in parallel
  const [
    { count: totalArticles },
    { count: publishedArticles },
    { count: totalCategories },
    { count: unreadMessages },
    { data: latestArticles },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published').is('deleted_at', null),
    supabase.from('categories').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('articles')
      .select('*, category:categories(*)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  // Compute total views
  const { data: viewsData } = await supabase
    .from('articles')
    .select('view_count')
    .is('deleted_at', null);

  const totalViews = (viewsData || []).reduce((acc, curr) => acc + (curr.view_count || 0), 0);

  const stats = [
    {
      label: isNe ? 'कुल समाचार' : 'Total Articles',
      value: totalArticles || 0,
      sub: `${publishedArticles || 0} ${isNe ? 'प्रकाशित' : 'published'}`,
      icon: FileText,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: isNe ? 'कुल पाठक (हेराइ)' : 'Total Readers',
      value: totalViews.toLocaleString(),
      sub: isNe ? 'सम्पूर्ण समाचार' : 'All views',
      icon: Eye,
      color: 'text-accent-3',
      bg: 'bg-accent-3/10',
    },
    {
      label: isNe ? 'समाचार विधाहरू' : 'Categories',
      value: totalCategories || 0,
      sub: isNe ? 'सक्रिय' : 'Active',
      icon: FolderTree,
      color: 'text-accent-2',
      bg: 'bg-accent-2/10',
    },
    {
      label: isNe ? 'नयाँ सोधपुछ सन्देश' : 'New Inquiries',
      value: unreadMessages || 0,
      sub: isNe ? 'प्रतिक्रिया बाँकी' : 'Unread messages',
      icon: Inbox,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div>
      <DashboardHeader
        title={isNe ? 'व्यवस्थापक अवलोकन' : 'Editorial Overview'}
        subtitle={isNe ? 'YouTh Brain News कन्टेन्ट म्यानेजमेन्ट कन्सोल' : 'Real-time portal performance and editorial control'}
        locale={locale}
      />

      {/* Security Status Card */}
      <div className="mb-6 p-4 rounded-2xl bg-surface border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-3/15 text-accent-3 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-1">
              {isNe ? 'सुरक्षा स्थिति: उच्च (TOTP MFA सक्रिय)' : 'Security Status: Hardened (TOTP MFA Active)'}
            </h4>
            <p className="text-xs text-text-3">
              {isNe
                ? '३ पटक असफल लगइनमा १० मिनेट लकआउट नीति लागू छ।'
                : 'Account lockout active: 3 consecutive failed attempts trigger 10-minute lockout.'}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/dashboard/articles`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-md transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isNe ? 'नयाँ समाचार लेख्नुहोस्' : 'Create Article'}</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-3 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-text-1">
                  {stat.value}
                </span>
                <p className="text-xs text-text-3 mt-1 font-medium">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Latest Articles Table */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-extrabold text-base text-text-1">
            {isNe ? 'पछिल्ला समाचारहरू' : 'Recent News Articles'}
          </h3>
          <Link
            href={`/${locale}/dashboard/articles`}
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
          >
            <span>{isNe ? 'सबै समाचार हेर्नुहोस्' : 'View all articles'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 text-text-3 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{isNe ? 'समाचार शीर्षक' : 'Title'}</th>
                <th className="py-3 px-4">{isNe ? 'विधा' : 'Category'}</th>
                <th className="py-3 px-4">{isNe ? 'स्थिति' : 'Status'}</th>
                <th className="py-3 px-4">{isNe ? 'पाठक' : 'Views'}</th>
                <th className="py-3 px-4 text-right">{isNe ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(!latestArticles || latestArticles.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-3">
                    {isNe ? 'कुनै समाचार उपलब्ध छैन।' : 'No articles created yet.'}
                  </td>
                </tr>
              ) : (
                (latestArticles as Article[]).map((art) => (
                  <tr key={art.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-1 max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        {art.is_breaking && (
                          <span className="p-1 rounded bg-accent-2/15 text-accent-2" title="Breaking">
                            <Flame className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="truncate">{isNe ? art.title_ne : art.title_en}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {art.category ? (
                        <span
                          style={{ color: art.category.color || '#235DBC' }}
                          className="font-bold text-[11px]"
                        >
                          {isNe ? art.category.name_ne : art.category.name_en}
                        </span>
                      ) : (
                        <span className="text-text-3">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-text-2 font-mono">
                      {art.view_count || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/${locale}/news/${art.slug}`}
                        target="_blank"
                        className="text-accent hover:underline font-bold text-xs"
                      >
                        {isNe ? 'हेर्नुहोस्' : 'Preview'}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
