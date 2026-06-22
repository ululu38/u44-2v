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
      {/* ── Hero Section ── */}
      <section className="relative h-[350px] md:h-[450px] flex items-center justify-center overflow-hidden border-b border-neutral-900">
        <CachedImage
          src={getImageUrl('/images/Hero_1.jpg')}
          alt="Search Hero Background"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.35]"
          priority={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-[1]" />
        
        <div className="relative z-10 text-center space-y-4 px-6 pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-widest uppercase mb-2">
            <span className="material-icons-outlined text-sm">search</span>
            Explore & Discover
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_40px_rgba(37,99,235,0.3)]">
            ค้นหาบทความ
          </h1>
          <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto">
            ค้นหาโครงการ สินค้า หรือข่าวสารที่เกี่ยวข้องกับเทคโนโลยีโซลูชันของเรา
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto space-y-10 py-16 px-6">
        {/* ── Granular Suspense boundary: streams in independently ── */}
        <Suspense fallback={<SearchGridSkeleton />}>
          <SearchPageContent />
        </Suspense>
      </div>
    </div>
  );
}
