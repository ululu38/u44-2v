"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clientCachedFetch, clearCache } from "@/lib/api/client-cache";
import { CachedImage } from "@/components/common/CachedImage";

// ─── Constants ────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const ITEMS_PER_PAGE = 9;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function imgUrl(p?: string | null): string | null {
  if (!p) return null;
  return p.startsWith("http") ? p : `${API}${p}`;
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const TAG_COLORS: Record<string, string> = {
  News:     "bg-blue-600/90",
  Solution: "bg-indigo-600/90",
  Project:  "bg-amber-600/90",
  Movement: "bg-emerald-600/90",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface ThumbnailMedia {
  id?: number;
  urlFull?: string;
  urlThumb?: string;
  urlMini?: string;
  blurHash?: string;
}

interface Client {
  clientId: number;
  name: string;
}

interface Post {
  postId: number;
  title: string;
  slug?: string;
  tags?: string[];
  createdAt: string;
  status?: number;
  relevanceScore?: number;
  thumbnailMedia?: ThumbnailMedia | null;
  clients?: Client[];
}

interface SearchMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  query?: string;
}

interface PostsSearchUIProps {
  initialKeyword?: string;
  title?: string;
  description?: string;
  hideControls?: boolean;
}

// ─── Solution Card ────────────────────────────────────────────────────────────
function SolutionCard({
  post,
  isSelected,
  index,
  onHover,
}: {
  post: Post;
  isSelected: boolean;
  index: number;
  onHover: (idx: number) => void;
}) {
  const thumb = imgUrl(post.thumbnailMedia?.urlThumb || post.thumbnailMedia?.urlFull);
  const href = `/posts/${post.slug || post.postId}`;
  const firstTag = post.tags?.[0];
  const tagColor = firstTag ? (TAG_COLORS[firstTag] ?? "bg-white/10") : "";

  return (
    <Link
      href={href}
      data-index={index}
      className={
        "block aspect-[3/2] group relative rounded-md overflow-hidden border border-gray-600 " +
        "transition-all duration-300 bg-[#151517] " +
        (isSelected
          ? "ring-2 ring-blue-500/60 z-20 -translate-y-1 shadow-[0_10px_40px_rgba(59,130,246,0.22)]"
          : "hover:-translate-y-1 shadow-[0_8px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.15)]")
      }
      style={{ transform: "translateZ(0)", willChange: "transform" }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(-1)}
    >
      <div className="w-full h-full flex flex-col justify-end relative">
        {/* Full Image */}
        <CachedImage
          src={thumb}
          alt={post.title}
          className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] object-cover group-hover:scale-105 transition-transform duration-500"
          skeletonClassName="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] animate-pulse bg-white/5"
          fallback={
            <div className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-blue-400">
              <span className="material-icons text-5xl">image</span>
            </div>
          }
        />

        {/* Gradient Overlay */}
        <div className="absolute -inset-[2px] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content overlaid at bottom */}
        <div className="relative px-3 pb-2.5 pt-6 flex flex-col z-10">
          {/* Tags row */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {post.tags?.slice(0, 2).map((t) => (
              <span
                key={t}
                className={`text-[9px] ${TAG_COLORS[t] ?? "bg-white/15"} text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider`}
              >
                {t}
              </span>
            ))}
            {post.clients?.slice(0, 1).map((c) => (
              <span
                key={c.clientId}
                className="text-[9px] bg-amber-500/15 text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded-full font-medium"
              >
                {c.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h5 className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors mb-2">
            {post.title}
          </h5>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] text-gray-400 font-medium">
              {formatDate(post.createdAt)}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-0.5 transition-transform duration-300">
                arrow_forward
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton Grid ─────────────────────────────────────────────────────────────
function SkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/2] animate-pulse rounded-md bg-white/5 border border-white/5 overflow-hidden"
        >
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PostsSearchUI({
  initialKeyword = "",
  title = "ข่าวสารและบทความ",
  description = "ติดตามข่าวสาร อัปเดตเทคโนโลยี และความรู้ใหม่ๆ จาก U44Tech",
  hideControls = false,
}: PostsSearchUIProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  const totalPages = meta?.totalPages ?? 1;
  const hasMore = page < totalPages;

  // ── Build search URL ─────────────────────────────────────────────────────
  const buildUrl = useCallback(
    (kw: string, pg: number) => {
      const params = new URLSearchParams({
        q: kw || " ",        // /search requires q; send a space to list all if empty
        page: String(pg),
        limit: String(ITEMS_PER_PAGE),
        fields: "title,slug,tags,createdAt,thumbnailMedia:thumb,clients",
      });
      return `${API}/search?${params}`;
    },
    []
  );

  // ── Fetch page ────────────────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (kw: string, pg: number, reset: boolean) => {
      setIsLoading(true);
      try {
        const url = buildUrl(kw, pg);
        const json = await clientCachedFetch<{ data: Post[]; meta: SearchMeta }>(url, {
          cacheTTL: 3 * 60 * 1000, // 3 minutes for search results
        });

        const incoming = json.data ?? [];
        if (reset) {
          setPosts(incoming);
        } else {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.postId));
            return [...prev, ...incoming.filter((p) => !existingIds.has(p.postId))];
          });
        }
        setMeta(json.meta ?? null);
      } catch (err) {
        console.error("[PostsSearchUI] fetch error:", err);
        if (reset) setPosts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [buildUrl]
  );

  // ── When keyword changes: reset & reload ──────────────────────────────────
  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  // ── Debounced search on keyword / page change ─────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPage(keyword, page, page === 1);
    }, page === 1 ? 300 : 0);
    return () => clearTimeout(timer);
  }, [keyword, page, fetchPage]);

  // ── Reset page when keyword changes ──────────────────────────────────────
  const prevKeyword = useRef(keyword);
  useEffect(() => {
    if (keyword !== prevKeyword.current) {
      prevKeyword.current = keyword;
      setPosts([]);
      setMeta(null);
      setPage(1);
      clearCache(); // bust client-side cache for fresh search
    }
  }, [keyword]);

  // ── Infinite scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading || !hasMore) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "250px" }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [isLoading, hasMore]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement !== inputRef.current) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((p) => Math.min(p + 1, posts.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((p) => Math.max(p - 1, -1));
      } else if (e.key === "Enter" && selectedIndex >= 0 && posts[selectedIndex]) {
        const p = posts[selectedIndex];
        router.push(`/posts/${p.slug || p.postId}`);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [posts, selectedIndex, router]);

  // Scroll selected card into view
  useEffect(() => {
    if (selectedIndex >= 0) {
      const el = document.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  // Reset selection when posts change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [posts]);

  // ── Render ────────────────────────────────────────────────────────────────
  const isEmpty = !isLoading && posts.length === 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      {title && (
        <div className="text-center mb-12 mt-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 hero-text-glow">
            {title}
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-6 rounded-full mb-6" />
          {description && (
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Search Controls */}
      {!hideControls && (
        <div className="flex flex-col md:flex-row gap-4 mb-10 max-w-3xl mx-auto">
          <div className="relative flex-grow">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px] pointer-events-none">
              search
            </span>
            <input
              ref={inputRef}
              id="posts-search-input"
              type="text"
              placeholder="พิมพ์คำค้นหา..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-[#151517] border border-white/10 text-white rounded-lg pl-12 pr-10 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-500"
              autoComplete="off"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Result count badge */}
          {meta && (
            <div className="flex items-center justify-center px-5 py-2 bg-[#151517] border border-white/10 rounded-lg text-sm text-gray-400 shrink-0">
              <span className="text-white font-bold mr-1">{meta.total}</span> รายการ
            </div>
          )}
        </div>
      )}

      {/* Loading skeleton (first page) */}
      {isLoading && page === 1 && <SkeletonGrid count={ITEMS_PER_PAGE} />}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center text-gray-500 py-20 bg-[#1a1b20] rounded-2xl border border-white/5">
          <span className="material-icons text-4xl mb-4 block text-gray-600">search_off</span>
          <p className="text-xl font-semibold">ไม่พบผลลัพธ์</p>
          <p className="text-sm mt-2">
            {keyword ? `ไม่พบบทความสำหรับ "${keyword}"` : "ลองค้นหาด้วยคำอื่นดูนะครับ"}
          </p>
        </div>
      )}

      {/* Post Grid */}
      {posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <SolutionCard
              key={post.postId}
              post={post}
              index={idx}
              isSelected={selectedIndex === idx}
              onHover={setSelectedIndex}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div
        ref={sentinelRef}
        className="h-24 w-full flex items-center justify-center mt-8 mb-12"
      >
        {isLoading && page > 1 && (
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
        {!hasMore && posts.length > 0 && !isLoading && (
          <p className="text-gray-600 text-sm">— แสดงทั้งหมดแล้ว —</p>
        )}
      </div>

      <style jsx>{`
        .hero-text-glow {
          text-shadow:
            0 0 30px rgba(255, 255, 255, 0.2),
            0 0 60px rgba(37, 99, 235, 0.3);
        }
      `}</style>
    </div>
  );
}
