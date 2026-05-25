"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const getImageUrl = (path: string | null) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${path}`;
};

interface ClientGroup {
  groupId: number;
  name: string;
}

interface Client {
  clientId: number;
  name: string;
  groups?: ClientGroup[];
}

interface PostHit {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string | null;
  tags: string[];
  status: number;
  createdAt: string;
  categoryIds: number[];
  clients?: Client[];
}

interface PostsSearchUIProps {
  initialTag?: string | null;
  initialKeyword?: string;
  title?: string;
  description?: string;
  hideControls?: boolean;
}

export default function PostsSearchUI({
  initialTag = null,
  initialKeyword = "",
  title = "ข่าวสารและบทความ",
  description = "ติดตามข่าวสาร อัปเดตเทคโนโลยี และความรู้ใหม่ๆ จาก U44Tech",
  hideControls = false,
}: PostsSearchUIProps) {
  const [posts, setPosts] = useState<PostHit[]>([]);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [tag, setTag] = useState<string | null>(initialTag);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const itemsPerPage = 6;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isSearching) return;
    if (page >= totalPages) return;

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
  }, [isSearching, totalPages, page]);

  useEffect(() => {
    setKeyword(initialKeyword);
    setPosts([]);
    setPage(1);
  }, [initialKeyword]);

  useEffect(() => {
    setTag(initialTag);
    setPosts([]);
    setPage(1);
  }, [initialTag]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsSearching(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        let url = `${apiUrl}/posts?page=${page}&limit=${itemsPerPage}&status=1&fields=postId,title,slug,tags,contentText,createdAt,thumbnailMedia,clients&thumbSize=thumb`;
        if (keyword) url += `&q=${encodeURIComponent(keyword)}`;
        if (tag !== null && tag !== 'all') url += `&tag=${encodeURIComponent(tag)}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch posts');
        const json = await res.json();
        
        const mappedPosts = (json.data || []).map((p: any) => ({
          ...p,
          id: p.postId,
          thumbnailUrl: p.thumbnailMedia?.urlThumb || null,
          thumbnailMiniUrl: p.thumbnailMedia?.urlMini || null,
        }));
        
        if (page === 1) {
          setPosts(mappedPosts);
        } else {
          setPosts((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const filtered = mappedPosts.filter((p: PostHit) => !existingIds.has(p.id));
            return [...prev, ...filtered];
          });
        }
        setTotalPages(json.meta?.totalPages || 1);
      } catch (error) {
        console.error("API query error:", error);
        if (page === 1) setPosts([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the search slightly
    const timeoutId = setTimeout(() => {
      fetchPosts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [keyword, tag, page]);

  // reset selection when posts change
  useEffect(() => { setSelectedIndex(-1); }, [posts]);

  const router = useRouter();

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, posts.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && posts[selectedIndex]) {
        const p = posts[selectedIndex];
        router.push(`/posts/${p.slug || p.id}`);
      }
    }
  };

  // fallback: listen on window when input is focused (helps with some IME or focus edge cases)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement !== inputRef.current) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, posts.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && posts[selectedIndex]) {
          const p = posts[selectedIndex];
          router.push(`/posts/${p.slug || p.id}`);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [posts, selectedIndex, router]);

  // scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0) {
      const el = document.querySelector(`[data-index=\"${selectedIndex}\"]`) as HTMLElement | null;
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header section */}
      {title && (
        <div className="text-center mb-12 mt-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 hero-text-glow">
            {title}
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-6 rounded-full mb-6"></div>
          {description && (
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Controls: Search and Filter */}
      {!hideControls && (
        <div className="flex flex-col md:flex-row gap-4 mb-10 max-w-4xl mx-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="พิมพ์คำค้นหา..."
              value={keyword}
              onChange={(e) => {
                setPosts([]);
                setKeyword(e.target.value);
                setPage(1);
              }}
              onKeyDown={onInputKeyDown}
              ref={inputRef}
              className="w-full bg-[#151517] border border-white/10 text-white rounded-lg px-5 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-500"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <select
            value={tag === null ? "all" : tag}
            onChange={(e) => {
              const val = e.target.value;
              setPosts([]);
              setTag(val === "all" ? null : val);
              setPage(1);
            }}
            className="bg-[#151517] border border-white/10 text-white rounded-lg px-5 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer min-w-[200px]"
          >
            <option value="all">ทั้งหมด (All)</option>
            <option value="News">News (ข่าวสาร)</option>
            <option value="Solution">Solution (โซลูชัน)</option>
            <option value="Project">Project (โครงการ)</option>
            <option value="Movement">Movement (ความเคลื่อนไหว)</option>
          </select>
        </div>
      )}

      {/* Results Grid */}
      {isSearching && page === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#1f2026] rounded-lg p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
              <div className="aspect-[3/2] bg-white/5 rounded-md mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 && !isSearching ? (
        <div className="text-center text-gray-500 py-20 bg-[#1f2026] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <p className="text-xl">ไม่พบข้อมูลที่ค้นหา</p>
          <p className="text-sm mt-2">ลองใช้คำค้นหาอื่น หรือเปลี่ยนหมวดหมู่ดูนะครับ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <Link 
              href={`/posts/${post.slug || post.id}`} 
              key={post.id}
              data-index={idx}
              className={
                `block aspect-[3/2] group relative rounded-md overflow-hidden border-1 border-gray-600 transition-all duration-300 bg-[#151517]` +
                (selectedIndex === idx ? " ring-2 ring-blue-500/60 z-20 transform -translate-y-1 shadow-[0_10px_40px_rgba(59,130,246,0.18)]" : " hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.25)]")
              }
              onMouseEnter={() => setSelectedIndex(idx)}
              onMouseLeave={() => setSelectedIndex(-1)}
              style={{ transform: "translateZ(0)", willChange: "transform" }}
            >
              <div className="w-full h-full flex flex-col justify-end relative">
                {/* Full Image */}
                {post.thumbnailUrl ? (
                  <img
                    src={getImageUrl(post.thumbnailUrl)}
                    alt={post.title}
                    className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-gray-500">
                    <span className="material-icons text-4xl">image</span>
                  </div>
                )}

                {/* Black Gradient Overlay */}
                <div className="absolute -inset-[2px] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* Content Overlay */}
                <div className="relative px-3 pb-2.5 pt-6 flex flex-col z-10">
                  {/* Category and Date row */}
                  <div className="flex items-center gap-2 mb-1">
                    {post.tags && post.tags.includes("News") && (
                      <span className="text-[9px] bg-blue-600/90 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        News
                      </span>
                    )}
                    {post.tags && post.tags.includes("Solution") && (
                      <span className="text-[9px] bg-indigo-600/90 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Solution
                      </span>
                    )}
                    {post.tags && post.tags.includes("Project") && (
                      <span className="text-[9px] bg-amber-600/90 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Project
                      </span>
                    )}
                    {post.tags && post.tags.includes("Movement") && (
                      <span className="text-[9px] bg-emerald-600/90 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Movement
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-1.5 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between mt-auto">
                    {/* Tags or Client Groups (Compact) */}
                    <div className="flex flex-wrap gap-1 max-w-[calc(100%-40px)]">
                      {post.clients && post.clients.slice(0, 1).map((client) => (
                        <span key={client.clientId} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-2 py-0.5 rounded-full font-medium">
                          {client.name}
                        </span>
                      ))}
                      {post.tags && post.tags.slice(0, 1).map((t) => (
                        <span key={t} className="bg-white/5 text-gray-300 text-[9px] px-2 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Arrow Button */}
                    <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                      <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-0.5 transition-transform duration-300">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Sentinel for Infinite Scroll */}
      <div ref={sentinelRef} className="h-20 w-full flex items-center justify-center mt-8 mb-12">
        {isSearching && page > 1 && (
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      
      <style jsx>{`
        .hero-text-glow {
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.2), 
                       0 0 60px rgba(37, 99, 235, 0.3);
        }
      `}</style>
    </div>
  );
}
// End of PostsSearchUI
