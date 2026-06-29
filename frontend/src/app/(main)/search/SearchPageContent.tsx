'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2, SearchX } from 'lucide-react';

import { fetchSearchPosts, Post, SearchResponse } from './api';
import { PostCard } from '../../components/PostCard';
import { SearchBar } from '../../components/SearchBar';

// ─── Inline skeleton for the grid while loading more ─────────────────────────
function PostGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/2] rounded-md bg-neutral-900 border border-neutral-800 overflow-hidden relative"
        >
          <div className="w-full h-full animate-shimmer absolute inset-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Client Component: handles all interactive state ─────────────────────────
export default function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialise from URL ?q= on hydration
  const queryQ = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(queryQ);
  const [keyword, setKeyword] = useState(queryQ);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when URL changes (back/forward navigation)
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setInputValue(q);
    setKeyword(q);
  }, [searchParams]);

  // ── Search submit ─────────────────────────────────────────────────────────
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setKeyword(trimmed);

    const params = new URLSearchParams(window.location.search);
    if (trimmed) params.set('q', trimmed);
    else params.delete('q');
    router.push(`/search?${params.toString()}`);
  };

  // ── TanStack infinite query ───────────────────────────────────────────────
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch, isRefetching } =
    useInfiniteQuery<SearchResponse>({
      queryKey: ['search', keyword],
      queryFn: ({ pageParam = 1 }) =>
        fetchSearchPosts({ pageParam: pageParam as number, keyword }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.meta;
        return page < totalPages ? page + 1 : undefined;
      },
      staleTime: Infinity, // never refetch automatically
      gcTime: 30 * 60 * 1000,
    });

  // Deduplicate posts across pages
  const posts = React.useMemo<Post[]>(() => {
    if (!data) return [];
    const seen = new Set<number>();
    return data.pages.flatMap((page) =>
      page.data.filter((p) => {
        if (seen.has(p.postId)) return false;
        seen.add(p.postId);
        return true;
      })
    );
  }, [data]);

  const meta = data?.pages[data.pages.length - 1]?.meta ?? null;

  // ── Infinite scroll ───────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '250px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const isEmpty = !isLoading && posts.length === 0 && !error;

  return (
    <div className="space-y-8">
      {/* The grid streams in independently — other UI stays interactive      */}
      {isLoading && posts.length === 0 && <PostGridSkeleton count={9} />}

      {/* ── Error state ──────────────────────────────────────────────────── */}
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
          เกิดข้อผิดพลาด — กรุณาลองใหม่อีกครั้ง
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {isEmpty && (
        <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-700">
          <SearchX className="w-10 h-10 mx-auto mb-4 text-neutral-600" />
          <p className="text-lg font-semibold text-neutral-400">ไม่พบผลลัพธ์</p>
          <p className="text-sm text-neutral-500 mt-2">
            {keyword
              ? `ไม่พบบทความสำหรับ "${keyword}"`
              : 'ลองพิมพ์คำค้นหาด้านบน'}
          </p>
        </div>
      )}

      {/* ── Post grid ─────────────────────────────────────────────────────── */}
      {posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <PostCard key={post.postId} post={post} priority={idx < 3} />
          ))}
        </div>
      )}

      {/* ── Infinite scroll sentinel ──────────────────────────────────────── */}
      <div ref={sentinelRef} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
            <span>กำลังโหลดเพิ่มเติม...</span>
          </div>
        )}
        {!hasNextPage && posts.length > 0 && !isFetchingNextPage && (
          <p className="text-neutral-600 text-sm">— แสดงทั้งหมดแล้ว —</p>
        )}
      </div>
    </div>
  );
}
