/**
 * Skeleton Loading Components for Better UX
 * Displays while content is loading to prevent layout shift
 */

import React from 'react';

export function PostCardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-slate-700" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-6 bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-700 rounded w-2/3" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-slate-700 rounded w-20" />
          <div className="h-8 bg-slate-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-pulse">
      {/* Title skeleton */}
      <div className="h-12 bg-slate-700 rounded w-3/4 mb-6" />
      
      {/* Meta skeleton */}
      <div className="flex gap-6 mb-8">
        <div className="h-4 bg-slate-700 rounded w-32" />
        <div className="h-4 bg-slate-700 rounded w-24" />
      </div>
      
      {/* Featured image skeleton */}
      <div className="w-full h-96 bg-slate-700 rounded-lg mb-12" />
      
      {/* Content skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-700 rounded w-full" />
        ))}
        <div className="h-4 bg-slate-700 rounded w-3/4" />
      </div>
    </div>
  );
}
