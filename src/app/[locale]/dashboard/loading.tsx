import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-2 rounded-lg" />
          <div className="h-4 w-72 bg-surface-2 rounded-md" />
        </div>
        <div className="h-10 w-36 bg-surface-2 rounded-xl" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-surface border border-border p-5 space-y-3">
            <div className="h-4 w-24 bg-surface-2 rounded" />
            <div className="h-8 w-16 bg-surface-2 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Table Skeleton */}
      <div className="rounded-2xl bg-surface border border-border p-6 space-y-4">
        <div className="h-6 w-36 bg-surface-2 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-surface-2 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
