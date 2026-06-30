'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { fetchSolutionPosts } from './api';
import { SearchResponse, Post } from '../search/api';
import SolutionCard from './SolutionCard';

export interface SolutionExplorerProps {
  mode?: 'pagination' | 'infinite';
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }
  return pages;
}

const SOLUTION_TABS = [
  { icon: 'apps', label: 'All' },
  { icon: 'code', label: 'Software Development' },
  { icon: 'lan', label: 'Network & Security' },
  { icon: 'chat', label: 'Unified Communication' },
  { icon: 'dns', label: 'System Infrastructure' },
  { icon: 'engineering', label: 'IT Services & Outsourcing' },
  { icon: 'sensors', label: 'IoT' },
  { icon: 'tv', label: 'Digital Signage' },
  { icon: 'router', label: 'Smart Pole System' },
  { icon: 'co_present', label: 'Kiosk' },
  { icon: 'videocam', label: 'CCTV & Access Control' },
  { icon: 'question_answer', label: 'Web Application & Chat' },
  { icon: 'storage', label: 'Server & Storage' },
  { icon: 'shopping_cart', label: 'IT Equipment & Software' },
];

function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/2] rounded-2xl bg-white/5 border border-white/5 overflow-hidden"
        >
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
        </div>
      ))}
    </div>
  );
}

export default function SolutionExplorer({ mode = 'infinite' }: SolutionExplorerProps) {
  const [activeTab, setActiveTab] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Infinite Query
  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error: infiniteError,
    refetch: refetchInfinite,
    isRefetching: isInfiniteRefetching,
  } = useInfiniteQuery<SearchResponse>({
    queryKey: ['solutions', 'infinite', activeTab],
    queryFn: ({ pageParam = 1 }) =>
      fetchSolutionPosts({ pageParam: pageParam as number, category: activeTab }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: mode === 'infinite',
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  // 2. Paginated Query
  const {
    data: paginatedData,
    isLoading: isPaginatedLoading,
    error: paginatedError,
    refetch: refetchPaginated,
    isRefetching: isPaginatedRefetching,
  } = useQuery<SearchResponse>({
    queryKey: ['solutions', 'paginated', activeTab, page],
    queryFn: () =>
      fetchSolutionPosts({ pageParam: page, category: activeTab }),
    enabled: mode === 'pagination',
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  const isLoading = mode === 'infinite' ? isInfiniteLoading : isPaginatedLoading;
  const error = mode === 'infinite' ? infiniteError : paginatedError;
  const refetch = mode === 'infinite' ? refetchInfinite : refetchPaginated;
  const isRefetching = mode === 'infinite' ? isInfiniteRefetching : isPaginatedRefetching;

  const posts = React.useMemo<Post[]>(() => {
    if (mode === 'infinite') {
      if (!infiniteData) return [];
      const seen = new Set<number>();
      return infiniteData.pages.flatMap((page) =>
        page.data.filter((p) => {
          if (seen.has(p.postId)) return false;
          seen.add(p.postId);
          return true;
        })
      );
    } else {
      return paginatedData?.data || [];
    }
  }, [mode, infiniteData, paginatedData]);

  const totalPages = paginatedData?.meta?.totalPages || 1;

  const handleTabClick = (label: string) => {
    if (label === activeTab) return;
    setActiveTab(label);
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadMore = useCallback(() => {
    if (mode === 'infinite' && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [mode, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (mode !== 'infinite') return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '250px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [mode, loadMore]);

  const mainTabs = SOLUTION_TABS.slice(0, 5);
  const overflowTabs = SOLUTION_TABS.slice(5);
  const isOverflowActive = overflowTabs.some((t) => t.label === activeTab);

  const visibleTabs = [...mainTabs];
  if (isOverflowActive) {
    const activeOverflowTab = overflowTabs.find((t) => t.label === activeTab);
    if (activeOverflowTab) {
      visibleTabs.push(activeOverflowTab);
    }
  }

  const isEmpty = !isLoading && posts.length === 0 && !error;

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Pill-shaped Navigation Bar */}
      <div className="sticky top-[80px] z-40 py-4">
        <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-full px-4 py-2 flex items-center gap-2 max-w-[960px] mx-auto shadow-2xl">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 scroll-smooth">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => handleTabClick(tab.label)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-white bg-blue-600 shadow-[0_2px_10px_rgba(59,130,246,0.4)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                  suppressHydrationWarning
                >
                  <span className="material-icons text-[16px]">
                    {isActive ? 'check_circle' : tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Plus button for overflow */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 cursor-pointer ${
                isOverflowActive
                  ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white'
              }`}
              title="หมวดหมู่เพิ่มเติม"
              suppressHydrationWarning
            >
              <span className="material-icons text-lg">add</span>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {overflowTabs.map((tab) => {
                    const isActive = activeTab === tab.label;
                    return (
                      <button
                        key={tab.label}
                        onClick={() => {
                          handleTabClick(tab.label);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                          isActive
                            ? 'text-blue-400 bg-blue-500/10 font-semibold'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                        suppressHydrationWarning
                      >
                        <span className="material-icons text-[16px]">
                          {isActive ? 'check_circle' : tab.icon}
                        </span>
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Manual Refresh button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-neutral-800 hover:bg-neutral-750 text-neutral-400 rounded-full transition-colors cursor-pointer"
            title="โหลดข้อมูลใหม่"
            suppressHydrationWarning
          >
            <span className={`material-icons-outlined text-base ${isRefetching ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Grid skeleton when loading first page */}
      {isLoading && posts.length === 0 && <GridSkeleton count={6} />}

      {/* Error state */}
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl text-center">
          เกิดข้อผิดพลาด — กรุณาลองใหม่อีกครั้ง
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-800">
          <span className="material-icons text-5xl mb-4 block text-neutral-600">search_off</span>
          <p className="text-lg font-semibold text-neutral-400">ไม่พบบทความในหมวดหมู่ "{activeTab}"</p>
        </div>
      )}

      {/* Posts Grid */}
      {posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <SolutionCard key={post.postId} post={post} priority={idx < 3} />
          ))}
        </div>
      )}

      {/* Infinite Scroll sentinel / Pagination Controls */}
      {mode === 'infinite' ? (
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
      ) : (
        posts.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-8 pb-12">
            <button
              onClick={() => {
                setPage((prev) => Math.max(prev - 1, 1));
                containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              disabled={page === 1}
              className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-900 disabled:hover:text-neutral-400 transition-all duration-200 cursor-pointer"
              title="ก่อนหน้า"
            >
              <span className="material-icons text-lg">chevron_left</span>
            </button>
            
            {getPageNumbers(page, totalPages).map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-neutral-600 text-sm select-none">
                    ...
                  </span>
                );
              }
              
              const isPageActive = p === page;
              return (
                <button
                  key={`page-${p}`}
                  onClick={() => {
                    setPage(p as number);
                    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`w-10 h-10 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isPageActive
                      ? 'text-white bg-blue-600 shadow-[0_2px_10px_rgba(59,130,246,0.4)]'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => {
                setPage((prev) => Math.min(prev + 1, totalPages));
                containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-900 disabled:hover:text-neutral-400 transition-all duration-200 cursor-pointer"
              title="ถัดไป"
            >
              <span className="material-icons text-lg">chevron_right</span>
            </button>
          </div>
        )
      )}
    </div>
  );
}
