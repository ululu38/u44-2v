// ── Server Component (no 'use client') ────────────────────────────────────────
// The header is part of the static shell and renders immediately.
// SearchPageContent suspends while waiting for client-side hydration,
// with SkeletonGrid shown as the Suspense fallback.
import { Suspense } from 'react';
import SearchPageContent from './SearchPageContent';
import SearchGridSkeleton from './SearchGridSkeleton';
import { CachedImage } from '@/app/components/CachedImage';
import { getImageUrl } from '@/lib/utils/image';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">

      <div className="max-w-7xl mx-auto space-y-10 py-16 px-6">
        {/* ── Granular Suspense boundary: streams in independently ── */}
        <Suspense fallback={<SearchGridSkeleton />}>
          <SearchPageContent />
        </Suspense>
      </div>
    </div>
  );
}
