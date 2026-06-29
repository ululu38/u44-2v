'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { CachedImage } from '@/app/components/CachedImage';
import { getImageUrl } from '@/lib/utils/image';


const API = process.env.NEXT_PUBLIC_API_URL;
const PROJECT_TAG = 'Project';

const PROJECT_TABS = [
  { icon: 'apps',            label: '' },
  { icon: 'queue_play_next', label: 'KIOSK' },
  { icon: 'camera_alt',      label: 'CCTV' },
  { icon: 'smart_display',   label: 'Queue Display' },
  { icon: 'support_agent',   label: 'IT SERVICE' },
  { icon: 'tv',              label: 'SIGNAGE' },
  { icon: 'dns',             label: 'SERVER' },
  { icon: 'router',          label: 'NETWORK' },
];

interface ClientGroup { groupId: number; name: string }
interface Client  { clientId: number; name: string; groups?: ClientGroup[] }
interface Post {
  postId:          number;
  title:           string;
  slug:            string;
  content:         string;
  tags:            string[] | null;
  thumbnailMedia?: { urlThumb?: string; urlFull?: string; urlMini?: string } | null;
  clients?:        Client[];
  createdAt:       string;
}
interface Meta { total: number; page: number; limit: number; totalPages: number }

const imgUrl = getImageUrl;

// ── Horizontal scrolling card row ─────────────────────────────────────────
function ProjectCardRow({ post }: { post: Post }) {
  const thumbUrl = imgUrl(post.thumbnailMedia?.urlThumb ?? post.thumbnailMedia?.urlFull);
  const clientTag = post.clients?.[0]?.name ?? null;

  return (
    <Link
      href={`/posts/${post.slug || post.postId}`}
      className="w-full block group relative rounded-xl transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-blue-900/30 bg-[#1a1b22] decoration-transparent"
    >
      <div className="rounded-[inherit] overflow-hidden border border-white/5 group-hover:border-blue-500/30 relative flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#111] rounded-t-[inherit]">
          <CachedImage
            src={thumbUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-[inherit]"
            skeletonClassName="animate-shimmer w-full h-full absolute inset-0"
          />
          {/* Client tag badge */}
          {clientTag && (
            <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-[10px] text-neutral-200 px-2.5 py-0.5 rounded-full border border-white/10 font-bold uppercase tracking-wider">
              {clientTag}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 py-3 flex items-center justify-between gap-2 flex-grow">
          <p className="text-[13px] text-neutral-200 font-bold line-clamp-2 leading-snug flex-1 group-hover:text-blue-400 transition-colors m-0">
            {post.title}
          </p>
          <div className="flex-none w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 flex items-center justify-center transition-all duration-300 border border-white/10 group-hover:border-blue-500">
            <span className="material-icons-outlined text-[16px] text-white group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ProjectPage() {
  const [posts,     setPosts]     = useState<Post[]>([]);
  const [meta,      setMeta]      = useState<Meta | null>(null);
  const [activeTab, setActiveTab] = useState(PROJECT_TABS[0].label);
  const [page,      setPage]      = useState(1);
  const [loading,   setLoading]   = useState(true);

  // sidebar state
  const [allGroups,    setAllGroups]    = useState<{ id: number; name: string }[]>([]);
  const [allCompanies, setAllCompanies] = useState<{ id: number; name: string }[]>([]);
  const [clientPage,   setClientPage]   = useState(1);
  const [clientMeta,   setClientMeta]   = useState<Meta | null>(null);

  const [selGroups,    setSelGroups]    = useState<Set<number>>(new Set());
  const [selCompanies, setSelCompanies] = useState<Set<number>>(new Set());

  const cacheRef = useRef<Record<string, { posts: Post[]; meta: Meta | null }>>({});

  useEffect(() => {
    document.title = 'U44 Technology Solutions | Projects';
    // Fetch all Client Groups once
    fetch(`${API}/client-groups?page=1&limit=100`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setAllGroups(d.data.map((g: any) => ({ id: g.groupId, name: g.name })));
        }
      })
      .catch(console.error);
  }, []);

  // Fetch Companies when selGroups or clientPage changes
  useEffect(() => {
    const groupQuery = selGroups.size > 0 ? `&groupId=${Array.from(selGroups).join(',')}` : '';
    fetch(`${API}/clients?page=${clientPage}&limit=10&fields=clientId,name${groupQuery}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          const newCompanies = d.data.map((c: any) => ({ id: c.clientId, name: c.name }));
          if (clientPage === 1) {
            setAllCompanies(newCompanies);
          } else {
            setAllCompanies(prev => [...prev, ...newCompanies]);
          }
          setClientMeta(d.meta);
        }
      })
      .catch(console.error);
  }, [selGroups, clientPage]);

  // Reset client page when groups change
  useEffect(() => {
    setClientPage(1);
    // Clearing selected companies might be desired when changing groups, 
    // but preserving them is also okay. We'll preserve them.
  }, [selGroups]);

  const fetchPosts = useCallback(async (tab: string, pageNum: number, groups: Set<number>, clients: Set<number>) => {
    const cacheKey = `${tab}:${pageNum}:${Array.from(groups).sort().join(',')}:${Array.from(clients).sort().join(',')}`;
    if (cacheRef.current[cacheKey]) {
      setPosts(cacheRef.current[cacheKey].posts);
      setMeta(cacheRef.current[cacheKey].meta);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let url = `${API}/posts/projects/filter?page=${pageNum}&limit=20&fields=postId,title,slug,tags,createdAt,thumbnailMedia,clients`;
      if (tab) url += `&q=${encodeURIComponent(tab)}`;
      if (groups.size > 0) url += `&groupIds=${Array.from(groups).join(',')}`;
      if (clients.size > 0) url += `&clientIds=${Array.from(clients).join(',')}`;

      const res = await fetch(url);
      const d = await res.json();
      const newPosts: Post[] = d.data || [];
      const newMeta: Meta | null = d.meta || null;

      if (pageNum === 1) {
        setPosts(newPosts);
        cacheRef.current[cacheKey] = { posts: newPosts, meta: newMeta };
      } else {
        setPosts(prev => {
          const ids = new Set(prev.map(p => p.postId));
          const allPosts = [...prev, ...newPosts.filter(p => !ids.has(p.postId))];
          cacheRef.current[cacheKey] = { posts: allPosts, meta: newMeta };
          return allPosts;
        });
      }
      setMeta(newMeta);
    } catch {
      if (pageNum === 1) setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // When filters or page changes, fetch projects
  useEffect(() => { 
    fetchPosts(activeTab, page, selGroups, selCompanies);
  }, [activeTab, page, selGroups, selCompanies, fetchPosts]);

  // Reset project page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, selGroups, selCompanies]);

  const toggleGroup = (id: number) => {
    setSelGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCompany = (id: number) => {
    setSelCompanies(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-start">
        
        {/* Sidebar */}
        <aside className="w-full md:w-[240px] shrink-0 p-6 md:py-8 border-b md:border-b-0 md:border-r border-neutral-800 md:min-h-[calc(100vh-80px)] md:sticky top-[80px] md:max-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-neutral-100 m-0 leading-none">Projects</h1>
          </div>

          {/* Client Groups */}
          {allGroups.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-neutral-500 tracking-[0.1em] uppercase">Client Groups</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {allGroups.map(g => (
                  <label key={g.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md transition-colors hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={selGroups.has(g.id)}
                      onChange={() => toggleGroup(g.id)}
                      className="accent-blue-500 w-3.5 h-3.5 cursor-pointer rounded-sm"
                    />
                    <span className={`text-[13px] flex-1 leading-snug ${selGroups.has(g.id) ? 'text-blue-400 font-semibold' : 'text-neutral-400'}`}>
                      {g.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Companies */}
          {allCompanies.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-neutral-500 tracking-[0.1em] uppercase">Clients</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {allCompanies.map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md transition-colors hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={selCompanies.has(c.id)}
                      onChange={() => toggleCompany(c.id)}
                      className="accent-blue-500 w-3.5 h-3.5 cursor-pointer rounded-sm"
                    />
                    <span className={`text-[13px] flex-1 leading-snug ${selCompanies.has(c.id) ? 'text-blue-400 font-semibold' : 'text-neutral-400'}`}>
                      {c.name}
                    </span>
                  </label>
                ))}
              </div>
              
              {/* Load More Clients Button */}
              {clientMeta && clientPage < clientMeta.totalPages && (
                <button
                  onClick={() => setClientPage(p => p + 1)}
                  className="mt-3 w-full py-1.5 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs rounded transition-colors"
                >
                  โหลดบริษัทเพิ่มเติม
                </button>
              )}
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 min-w-0">
          <div className="sticky top-[80px] z-20 bg-[#0a0a0a]/90 backdrop-blur-md pb-4 mb-6 -mx-2 px-2 border-b border-neutral-900">
            <div className="flex flex-wrap gap-2 items-center overflow-x-auto py-2 no-scrollbar">
              {PROJECT_TABS.map(tab => {
                const isActive = activeTab === tab.label;
                return (
                  <button
                    key={tab.label || 'all'}
                    onClick={() => setActiveTab(tab.label)}
                    suppressHydrationWarning
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-all border ${
                      isActive 
                        ? 'text-white border-neutral-600' 
                        : 'text-neutral-500 border-transparent hover:text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span className="material-icons-outlined text-sm">{tab.icon}</span>
                    {tab.label || 'All'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#1a1b22] rounded-xl overflow-hidden border border-neutral-800">
                  <div className="aspect-[4/3] bg-neutral-900 animate-shimmer relative" />
                  <div className="p-3.5 space-y-2.5">
                    <div className="h-3 bg-neutral-800 rounded-sm w-3/4 animate-shimmer" />
                    <div className="h-3 bg-neutral-800 rounded-sm w-1/2 animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && posts.length === 0 && (
            <div className="text-center py-24 text-neutral-600">
              <span className="material-icons-outlined text-5xl block mb-4">search_off</span>
              <p className="font-medium">ไม่พบโครงการที่ตรงกับเงื่อนไข</p>
            </div>
          )}

          {/* Grid Layout */}
          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {posts.map(post => (
                <ProjectCardRow key={post.postId} post={post} />
              ))}
            </div>
          )}

          {/* Load more button */}
          {!loading && meta && page < meta.totalPages && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setPage(p => p + 1)}
                suppressHydrationWarning
                className="px-6 py-2.5 bg-blue-600/10 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-bold cursor-pointer transition-all hover:bg-blue-600/20 hover:border-blue-500/50"
              >
                โหลดเพิ่มเติม
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
