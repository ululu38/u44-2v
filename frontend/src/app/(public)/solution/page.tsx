"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { CachedImage } from "@/components/common/CachedImage";
import { clientCachedFetch } from "@/lib/api/client-cache";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const SOLUTION_TAG = "Solution";

const SOLUTION_TABS = [
  { icon: "code",              label: "Software Development" },
  { icon: "work",              label: "Network & Security" },
  { icon: "chat",              label: "Unified Communication" },
  { icon: "folder",            label: "System Infrastructure" },
  { icon: "search",            label: "IT Services & Outsourcing" },
  { icon: "sensors",          label: "IoT" },
  { icon: "tv",               label: "Digital Signage" },
  { icon: "router",           label: "Smart Pole System" },
  { icon: "aod",              label: "Kiosk" },
  { icon: "camera_alt",       label: "CCTV & Access Control" },
  { icon: "chat_bubble",      label: "Web Application & Chat" },
  { icon: "storage",          label: "Server & Storage" },
  { icon: "shopping_cart",    label: "IT Equipment & Software" },
];

interface Post {
  postId: number;
  title: string;
  slug: string;
  content: string;
  contentText?: string;
  tags: string[] | null;
  thumbnailMedia?: { urlThumb?: string; urlFull?: string; urlMini?: string } | null;
  clients?: { clientId: number; name: string }[];
  createdAt: string;
}
interface Meta { total: number; page: number; limit: number; totalPages: number; }

function imgUrl(p?: string | null) {
  if (!p) return null;
  return p.startsWith("http") ? p : `${API}${p}`;
}

function formatDate(s?: string | null) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

// ── Swiper-style top hero (auto-scrolling row) ────────────────────────
function HeroSwiper({ posts }: { posts: Post[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 768) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const max = Math.max(0, posts.length - visibleCount);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((prev) => (prev >= max ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(id);
  }, [max]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const firstChild = el.children[0] as HTMLElement;
    if (!firstChild) return;
    const cardW = firstChild.getBoundingClientRect().width;
    el.style.transform = `translateX(-${idx * (cardW + 20)}px)`;
  }, [idx]);

  if (!posts.length) return null;

  return (
    <section 
      className="relative pt-12 pb-16 px-4 overflow-hidden border-b border-white/5" 
      style={{ 
        backgroundImage: 'linear-gradient(rgba(10, 20, 40, 0.82), rgba(10, 20, 40, 0.9)), url("/images/pexels-cookiecutter-1148820.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <h2 className="text-center font-heading font-bold text-white text-3xl mb-8 tracking-wider">
        Our Solutions
      </h2>
      
      <div className="overflow-hidden max-w-[1200px] mx-auto relative px-1">
        <div
          ref={trackRef}
          className="flex gap-5 transition-transform duration-700 ease-out"
          style={{ willChange: 'transform' }}
        >
          {posts.map((post) => {
            const thumb = imgUrl(post.thumbnailMedia?.urlThumb || post.thumbnailMedia?.urlFull);
            return (
              <Link
                key={post.postId}
                href={`/posts/${post.slug || post.postId}`}
                className="flex-none w-full sm:w-[calc(50%-10px)] md:w-[calc(33.33%-14px)] lg:w-[calc(25%-15px)] aspect-[3/2] group relative rounded-md overflow-hidden border-1 border-gray-600 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.15)] bg-[#151517]"
                style={{ transform: "translateZ(0)", willChange: "transform" }}
              >
                <div className="w-full h-full flex flex-col justify-end relative">
                  <CachedImage
                    src={thumb}
                    alt={post.title}
                    className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] object-cover group-hover:scale-105 transition-transform duration-500"
                    skeletonClassName="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] animate-pulse bg-white/5"
                    fallback={
                      <div className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-blue-300">
                        <span className="material-icons text-4xl">image</span>
                      </div>
                    }
                  />
                  {/* Tighter Gradient Overlay */}
                  <div className="absolute -inset-[2px] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  {/* Content Overlay */}
                  <div className="relative px-3 pb-2.5 pt-6 flex flex-col z-10">
                    <h4 className="font-heading font-semibold text-xs sm:text-sm text-white line-clamp-1 mb-1 tracking-wide">
                      {post.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 line-clamp-1 leading-relaxed mb-2">
                      {post.contentText ? post.contentText.slice(0, 100) : post.content?.replace(/<[^>]*>/g, "").slice(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {formatDate(post.createdAt)}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                        <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-0.5 transition-transform duration-300">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Swiper dots */}
      {max > 0 && (
        <div className="flex justify-center gap-1.5 mt-8">
          {[...Array(max + 1)].map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? 'w-6 h-2 bg-blue-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Solution card ────────────────────────────────────────────────────
function SolutionCard({ post }: { post: Post }) {
  const thumb = imgUrl(post.thumbnailMedia?.urlThumb || post.thumbnailMedia?.urlFull);

  return (
    <Link 
      href={`/posts/${post.slug || post.postId}`} 
      className="block aspect-[3/2] group relative rounded-md overflow-hidden border-1 border-gray-600 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.15)] bg-[#151517]"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
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

        {/* Black Gradient Overlay */}
        <div className="absolute -inset-[2px] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content overlaid at the bottom */}
        <div className="relative px-3 pb-2.5 pt-6 flex flex-col z-10">
          {/* Title */}
          <h5 className="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors mb-2">
            {post.title}
          </h5>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] text-gray-400 font-medium">
              {formatDate(post.createdAt)}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-0.5 transition-transform duration-300">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function SolutionPage() {
  const [heroPost, setHeroPost] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [activeTab, setActiveTab] = useState(SOLUTION_TABS[0].label);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!meta || page >= meta.totalPages) return;

    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "200px",
    });

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, meta, page]);

  // ── Fetch hero (latest solutions, no tag filter)
  useEffect(() => {
    document.title = "U44 Technology Solutions | Solutions";
    const url = `${API}/posts?page=1&limit=8&tag=${SOLUTION_TAG}&status=1&fields=postId,title,slug,tags,contentText,createdAt,thumbnailMedia,clients&thumbSize=thumb`;
    clientCachedFetch(url, { cacheTTL: 5 * 60 * 1000 })
      .then((d) => setHeroPost(d.data || []))
      .catch(() => {});
  }, []);

  // ── Fetch filtered grid
  const fetchGrid = useCallback(async (tab: string, pageNum: number) => {
    setLoading(true);
    try {
      const url = `${API}/posts?page=${pageNum}&limit=12&tag=${SOLUTION_TAG}&q=${encodeURIComponent(tab)}&status=1&fields=postId,title,slug,tags,createdAt,thumbnailMedia,clients&thumbSize=thumb`;
      const d = await clientCachedFetch(url, { cacheTTL: 5 * 60 * 1000 });
      const newPosts = d.data || [];
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map(p => p.postId));
          const filtered = newPosts.filter((p: Post) => !existingIds.has(p.postId));
          return [...prev, ...filtered];
        });
      }
      setMeta(d.meta || null);
    } catch {
      if (pageNum === 1) setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrid(activeTab, page);
  }, [activeTab, page, fetchGrid]);

  const handleTabClick = (label: string) => {
    if (label === activeTab) return;
    setPosts([]);
    setActiveTab(label);
    setPage(1);
  };

  // Split tabs for the design
  const mainTabs = SOLUTION_TABS.slice(0, 5);
  const overflowTabs = SOLUTION_TABS.slice(5);
  const isOverflowActive = overflowTabs.some(t => t.label === activeTab);

  // Determine which tabs to render in the visible nav
  const visibleTabs = [...mainTabs];
  if (isOverflowActive) {
    const activeOverflowTab = overflowTabs.find(t => t.label === activeTab);
    if (activeOverflowTab) {
      visibleTabs.push(activeOverflowTab);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-foreground pb-16">

      {/* 1 ── Hero Swiper */}
      <HeroSwiper posts={heroPost} />

      {/* 2 ── Tag nav bar (Pill-shaped Navigation) */}
      <div className="sticky top-[80px] z-40 py-6 px-4">
        <div className="bg-[#1b1c21]/95 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 max-w-[960px] mx-auto shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => handleTabClick(tab.label)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "text-white bg-blue-600 shadow-[0_2px_10px_rgba(59,130,246,0.4)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="material-icons text-[16px]">
                    {isActive ? "check_circle" : tab.icon}
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
                  ? "border-blue-500 bg-blue-600/20 text-blue-400"
                  : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
              }`}
              title="More categories"
            >
              <span className="material-symbols-outlined text-lg">add</span>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-[#1b1c21] rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                            ? "text-blue-400 bg-blue-500/10 font-semibold"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="material-icons text-[16px]">
                          {isActive ? "check_circle" : tab.icon}
                        </span>
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3 ── Results grid */}
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Loading skeleton */}
        {loading && page === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[#1c1d22]/60 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                <div className="aspect-[4/3] bg-white/5 rounded-xl mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-24 text-white/30 bg-[#1c1d22]/30 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <span className="material-icons text-5xl mb-4 block">search_off</span>
            ไม่พบบทความในหมวดนี้
          </div>
        )}

        {/* Grid */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post) => <SolutionCard key={post.postId} post={post} />)}
          </div>
        )}

        {/* Sentinel for Infinite Scroll */}
        <div ref={sentinelRef} className="h-20 w-full flex items-center justify-center mt-6 mb-12">
          {loading && page > 1 && (
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </div>
    </div>
  );
}
