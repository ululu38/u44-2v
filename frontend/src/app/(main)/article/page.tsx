'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CachedImage } from '@/app/components/CachedImage';
import { PostCard } from '@/app/components/PostCard';
import { PostCardSkeleton } from '@/app/components/PostCardSkeleton';
import { getImageUrl } from '@/lib/utils/image';


const API = process.env.NEXT_PUBLIC_API_URL;

const SECTIONS = [
  { label: 'News',           tag: 'News',     icon: 'newspaper',     viewAllHref: '/news' },
  { label: 'Solutions',      tag: 'Solution', icon: 'rocket_launch', viewAllHref: '/solution' },
  { label: 'Projects',       tag: 'Project',  icon: 'build_circle',  viewAllHref: '/project' },
  { label: 'Movement',       tag: 'Movement', icon: 'campaign',      viewAllHref: '/movement' },
];

interface Post {
  postId: number; title: string; slug: string; content: string;
  contentText?: string;
  tags: string[] | null;
  thumbnailMedia?: { urlThumb?: string; urlFull?: string; urlMini?: string } | null;
  createdAt: string;
}

const imgUrl = getImageUrl;

// ── Hot Topic Swiper ────────────────────────────────────────────────────────
function HotTopicSwiper({ posts }: { posts: Post[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % posts.length), 4000);
    return () => clearInterval(id);
  }, [posts.length]);

  if (!posts.length) return null;

  const post = posts[idx];
  // Since Hot Topic is a large hero banner, we use urlFull (or urlThumb if urlFull is missing)
  const thumb = imgUrl(post.thumbnailMedia?.urlFull || post.thumbnailMedia?.urlThumb);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-neutral-800 mb-10 shadow-2xl bg-[#111] h-[400px]">
      <div className="w-full h-full relative">
        <CachedImage
          src={thumb}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        <Link href={`/posts/${post.slug || post.postId}`} className="absolute inset-0 flex flex-col justify-end p-8 group decoration-transparent">
          <span className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Hot Topic</span>
          <h2 className="text-neutral-100 text-2xl md:text-3xl font-black leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors mb-4">
            {post.title}
          </h2>
          <p className="text-neutral-400 text-sm line-clamp-2 max-w-2xl mb-5">
            {post.contentText ? post.contentText.slice(0, 150) : post.content?.replace(/<[^>]*>/g, '').slice(0, 150)}...
          </p>
          <span className="inline-flex items-center gap-2 text-blue-400 text-sm font-bold group-hover:gap-3 transition-all">
            อ่านต่อ <span className="material-icons-outlined text-base">arrow_forward</span>
          </span>
        </Link>

        {posts.length > 1 && (
          <div className="absolute bottom-6 right-8 flex gap-1.5 z-20">
            {posts.map((_, i) => (
              <button key={i} onClick={(e) => { e.preventDefault(); setIdx(i); }} suppressHydrationWarning className={`rounded-full transition-all cursor-pointer ${i === idx ? 'w-6 h-2 bg-blue-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section Row ─────────────────────────────────────────────────────────────
function ArticleSection({ label, icon, viewAllHref, tag }: { label: string; icon: string; viewAllHref: string; tag: string; }) {
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
      <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900/20 border border-blue-900/30 flex items-center justify-center">
            <span className="material-icons-outlined text-blue-400 text-xl">{icon}</span>
          </div>
          <h2 className="text-xl font-black text-neutral-200 uppercase tracking-wide">{label}</h2>
        </div>
        <Link href={viewAllHref} className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1 transition-colors">
          View all <span className="material-icons-outlined text-lg">chevron_right</span>
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12 text-neutral-600 font-medium">ไม่พบบทความ</div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {posts.slice(0, 8).map((post) => (
            <PostCard key={post.postId} post={post as any} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function ArticlePage() {
  const [hotPosts, setHotPosts] = useState<Post[]>([]);

  useEffect(() => {
    document.title = 'U44 Technology Solutions | Articles & News';
    fetch(`${API}/posts?page=1&limit=6&status=1&fields=postId,title,slug,tags,contentText,createdAt,thumbnailMedia&thumbSize=thumb`)
      .then((r) => r.json())
      .then((d) => setHotPosts(d.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <div className="relative overflow-hidden pb-6 pt-12 border-b border-neutral-900 bg-[#0d0d0d]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-6xl relative z-10">

          <div className="mb-2">
            <HotTopicSwiper posts={hotPosts} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl py-16">
        {SECTIONS.map((sec) => (
          <ArticleSection key={sec.tag} {...sec} />
        ))}
      </div>
    </div>
  );
}
