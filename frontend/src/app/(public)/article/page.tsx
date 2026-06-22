"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CachedImage } from "@/components/common/CachedImage";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Category IDs based on the backend DB
// The article page shows multiple section types:
const SECTIONS = [
  { label: "News",           tag: "News",     icon: "newspaper",     viewAllHref: "/news" },
  { label: "Solutions",      tag: "Solution", icon: "rocket_launch", viewAllHref: "/solution" },
  { label: "Projects",       tag: "Project",  icon: "build_circle",  viewAllHref: "/project" },
  { label: "Movement",       tag: "Movement", icon: "campaign",      viewAllHref: "/movement" },
];

interface Post {
  postId: number; title: string; slug: string; content: string;
  contentText?: string;
  tags: string[] | null;
  thumbnailMedia?: { urlThumb?: string; urlFull?: string; urlMini?: string } | null;
  createdAt: string;
}

function imgUrl(p?: string | null) {
  if (!p) return null;
  return p.startsWith("http") ? p : `${API}${p}`;
}

function formatDate(s: string) {
  try { return new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return ""; }
}

// ── Hot Topic Swiper (top banner carousel) ────────────────────────────────
function HotTopicSwiper({ posts }: { posts: Post[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % posts.length), 4000);
    return () => clearInterval(id);
  }, [posts.length]);

  if (!posts.length) return null;

  const post = posts[idx];
  const thumb = imgUrl(post.thumbnailMedia?.urlFull || post.thumbnailMedia?.urlThumb);

  return (
    <div className="relative w-full rounded-md overflow-hidden border-1 border-gray-600 mb-10 shadow-2xl bg-[#151517]" style={{ height: 400, transform: "translateZ(0)", willChange: "transform" }}>
      <div className="w-full h-full relative">
        {/* Background image */}
        <CachedImage
          src={thumb}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
          skeletonClassName="absolute inset-0 w-full h-full animate-pulse bg-white/5"
          fallback={<div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-indigo-900" />}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Content */}
        <Link href={`/posts/${post.slug || post.postId}`}
          className="absolute inset-0 flex flex-col justify-end p-8 group">
          <span className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Hot Topic</span>
          <h2 className="text-white text-2xl md:text-3xl font-black leading-tight line-clamp-2
            group-hover:text-blue-300 transition-colors mb-3">
            {post.title}
          </h2>
          <p className="text-white/60 text-sm line-clamp-2 max-w-2xl mb-4">
            {post.contentText ? post.contentText.slice(0, 150) : post.content?.replace(/<[^>]*>/g, "").slice(0, 150)}...
          </p>
          <span className="inline-flex items-center gap-2 text-blue-400 text-sm font-bold
            group-hover:gap-3 transition-all">
            อ่านต่อ <span className="material-icons text-sm">arrow_forward</span>
          </span>
        </Link>

        {/* Dots */}
        {posts.length > 1 && (
          <div className="absolute bottom-4 right-8 flex gap-1.5 z-20">
            {posts.map((_, i) => (
              <button key={i} onClick={(e) => { e.preventDefault(); setIdx(i); }}
                className={`rounded-full transition-all ${i === idx ? "w-5 h-2 bg-blue-400" : "w-2 h-2 bg-white/30"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Horizontal Card (small) ────────────────────────────────────────────────
function SmallCard({ post }: { post: Post }) {
  const thumb = imgUrl(post.thumbnailMedia?.urlThumb || post.thumbnailMedia?.urlFull);
  return (
    <Link href={`/posts/${post.slug || post.postId}`} className="block group">
      <div className="flex gap-3 bg-[#1b1c21]/95 rounded-lg p-3
        hover:shadow-[0_8px_30px_rgba(59,130,246,0.25)] transition-all h-full shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      >
        <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-blue-900/20">
          <CachedImage
            src={thumb}
            alt={post.title}
            className="w-full h-full object-cover rounded-[inherit]"
            skeletonClassName="w-full h-full animate-pulse bg-white/5 rounded-[inherit]"
            fallback={
              <div className="w-full h-full flex items-center justify-center rounded-[inherit]">
                <span className="material-icons text-blue-300 text-2xl">image</span>
              </div>
            }
          />
        </div>
        <div className="flex flex-col flex-grow min-w-0">
          <h6 className="text-white/90 text-xs font-bold line-clamp-2 group-hover:text-blue-400
            transition-colors leading-snug mb-1">
            {post.title}
          </h6>
          <span className="text-white/35 text-[10px] mt-auto">{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Big Card ────────────────────────────────────────────────────────────────
function BigCard({ post }: { post: Post }) {
  const thumb = imgUrl(post.thumbnailMedia?.urlThumb || post.thumbnailMedia?.urlFull);
  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];
  const displayTag = tags[0] || "Article";
  return (
    <Link 
      href={`/posts/${post.slug || post.postId}`} 
      className="block aspect-[3/2] group relative rounded-md overflow-hidden border-1 border-gray-600 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.25)] bg-[#151517]"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      <div className="w-full h-full flex flex-col justify-end relative">
        {/* Full Image */}
        <CachedImage
          src={thumb}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-[inherit]"
          skeletonClassName="absolute inset-0 w-full h-full animate-pulse bg-white/5"
          fallback={
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-blue-400 rounded-[inherit]">
              <span className="material-icons text-5xl">image</span>
            </div>
          }
        />

        {/* Black Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-[inherit]" />

        {/* Content overlaid at the bottom */}
        <div className="relative px-3 pb-2.5 pt-6 flex flex-col z-10">
          {/* Title */}
          <h5 className="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors mb-2">
            {post.title}
          </h5>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {displayTag}
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

// ── Section Row ─────────────────────────────────────────────────────────────
function ArticleSection({
  label, icon, viewAllHref, tag,
}: {
  label: string; icon: string; viewAllHref: string; tag: string;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/posts?page=1&limit=8&tag=${tag}&status=1&fields=postId,title,slug,tags,createdAt,thumbnailMedia&thumbSize=thumb`)
      .then((r) => r.json())
      .then((d) => setPosts(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tag]);

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
            <span className="material-icons text-blue-400 text-xl">{icon}</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wide">{label}</h2>
        </div>
        <Link href={viewAllHref}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors">
          View all <span className="material-icons text-sm">chevron_right</span>
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-surface-card rounded-2xl">
              <div className="h-44 bg-white/5 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-white/5 rounded" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12 text-white/25 text-sm">ไม่พบบทความ</div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.slice(0, 8).map((post) => (
            <BigCard key={post.postId} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ArticlePage() {
  const [hotPosts, setHotPosts] = useState<Post[]>([]);

  // Fetch recent posts across all categories for hot topic swiper
  useEffect(() => {
    document.title = "U44 Technology Solutions | Articles & News";
    fetch(`${API}/posts?page=1&limit=6&status=1&fields=postId,title,slug,tags,contentText,createdAt,thumbnailMedia&thumbSize=thumb`)
      .then((r) => r.json())
      .then((d) => setHotPosts(d.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero gradient */}
      <div className="relative overflow-hidden pb-6 pt-8"
        style={{ background: "linear-gradient(135deg,#0a192f,#0f2744)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
          bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold
              tracking-widest uppercase mb-4">
              <span className="material-icons text-[14px]">article</span>
              Articles &amp; News
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              บทความ &amp; ข่าวสาร
            </h1>
          </div>

          {/* Hot Topics Swiper */}
          <div className="mb-2">
            <h2 className="text-lg font-bold text-white/60 uppercase tracking-widest mb-4">
              Hot Topics
            </h2>
            <HotTopicSwiper posts={hotPosts} />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        {SECTIONS.map((sec) => (
          <ArticleSection key={sec.tag} {...sec} />
        ))}
      </div>
    </div>
  );
}
