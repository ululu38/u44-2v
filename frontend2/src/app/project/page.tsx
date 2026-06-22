'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { CachedImage } from '@/app/components/CachedImage';
import { getImageUrl } from '@/lib/utils/image';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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
  const [allClients,   setAllClients]   = useState<{ id: number; name: string; count: number }[]>([]);
  const [allCompanies, setAllCompanies] = useState<{ id: number; name: string; count: number }[]>([]);
  const [companyGroups, setCompanyGroups] = useState<Record<number, number[]>>({});
  const [selClients,   setSelClients]   = useState<Set<number>>(new Set());
  const [selCompanies, setSelCompanies] = useState<Set<number>>(new Set());

  const cacheRef = useRef<Record<string, { posts: Post[]; meta: Meta | null }>>({});
  const tabPageRef = useRef<Record<string, number>>({});

  useEffect(() => {
    document.title = 'U44 Technology Solutions | Projects';
    const url = `${API}/posts?page=1&limit=200&tag=${PROJECT_TAG}&status=1&fields=postId,title,slug,tags,createdAt,thumbnailMedia,clients&thumbSize=thumb`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        const data: Post[] = d.data || [];
        const groupMap = new Map<number, { name: string; count: number }>();
        const companyMap = new Map<number, { name: string; count: number }>();
        const cgMap = new Map<number, Set<number>>();
        
        data.forEach(p => {
          (p.clients || []).forEach(c => {
            if (!companyMap.has(c.clientId)) companyMap.set(c.clientId, { name: c.name, count: 0 });
            companyMap.get(c.clientId)!.count++;

            (c.groups || []).forEach(g => {
              if (!groupMap.has(g.groupId)) groupMap.set(g.groupId, { name: g.name, count: 0 });
              groupMap.get(g.groupId)!.count++;
              if (!cgMap.has(c.clientId)) cgMap.set(c.clientId, new Set());
              cgMap.get(c.clientId)!.add(g.groupId);
            });
          });
        });

        setAllClients([...groupMap.entries()].map(([id, v]) => ({ id, ...v })));
        setAllCompanies([...companyMap.entries()].map(([id, v]) => ({ id, ...v })));
        
        const cgObj: Record<number, number[]> = {};
        cgMap.forEach((s, id) => { cgObj[id] = [...s]; });
        setCompanyGroups(cgObj);
      })
      .catch(() => {});
  }, []);

  const displayedCompanies = useMemo(() => {
    if (selClients.size === 0) return allCompanies;
    const sel = Array.from(selClients);
    return allCompanies.filter(c => {
      const groups = companyGroups[c.id] || [];
      return groups.some(gid => sel.includes(gid));
    });
  }, [allCompanies, selClients, companyGroups]);

  const fetchPosts = useCallback(async (tab: string, pageNum: number) => {
    const cacheKey = `${tab}:${pageNum}`;
    if (cacheRef.current[cacheKey]) {
      setPosts(cacheRef.current[cacheKey].posts);
      setMeta(cacheRef.current[cacheKey].meta);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = `${API}/posts?page=${pageNum}&limit=20&tag=${PROJECT_TAG}${tab ? `&q=${encodeURIComponent(tab)}` : ''}&status=1&fields=postId,title,slug,tags,createdAt,thumbnailMedia,clients&thumbSize=thumb`;
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

  useEffect(() => { 
    const restoredPage = tabPageRef.current[activeTab] || 1;
    if (restoredPage !== page) {
      setPage(restoredPage);
    } else {
      const cacheKey = `${activeTab}:${restoredPage}`;
      if (!cacheRef.current[cacheKey]) {
        fetchPosts(activeTab, restoredPage);
      } else {
        setPosts(cacheRef.current[cacheKey].posts);
        setMeta(cacheRef.current[cacheKey].meta);
      }
    }
  }, [activeTab]);

  useEffect(() => { 
    const cacheKey = `${activeTab}:${page}`;
    if (!cacheRef.current[cacheKey]) {
      fetchPosts(activeTab, page);
    } else {
      setPosts(cacheRef.current[cacheKey].posts);
      setMeta(cacheRef.current[cacheKey].meta);
      setLoading(false);
    }
  }, [page]);

  const handleTabClick = (label: string) => {
    if (label === activeTab) return;
    tabPageRef.current[activeTab] = page;
    const restoredPage = tabPageRef.current[label] || 1;
    setActiveTab(label);
    setPage(restoredPage);
  };

  const toggleClient = (id: number) => {
    setSelClients(prev => {
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

  const filteredPosts = posts.filter(p => {
    if (selClients.size > 0) {
      const postGroupIds = new Set((p.clients || []).flatMap(c => (c.groups || []).map(g => g.groupId)));
      if (![...selClients].some(id => postGroupIds.has(id))) return false;
    }
    if (selCompanies.size > 0) {
      const postClientIds = new Set((p.clients || []).map(c => c.clientId));
      if (![...selCompanies].some(id => postClientIds.has(id))) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-start">
        
        {/* Sidebar */}
        <aside className="w-full md:w-[240px] shrink-0 p-6 md:py-8 border-b md:border-b-0 md:border-r border-neutral-800 md:min-h-[calc(100vh-80px)] md:sticky top-0 md:max-h-screen overflow-y-auto no-scrollbar">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-neutral-100 m-0 leading-none">Projects</h1>
          </div>

          {/* Clients group */}
          {allClients.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-neutral-500 tracking-[0.1em] uppercase">Client Groups</span>
                <span className="material-icons-outlined text-sm text-neutral-600">expand_more</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {allClients.map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md transition-colors hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={selClients.has(c.id)}
                      onChange={() => toggleClient(c.id)}
                      className="accent-blue-500 w-3.5 h-3.5 cursor-pointer rounded-sm"
                    />
                    <span className={`text-[13px] flex-1 leading-snug ${selClients.has(c.id) ? 'text-blue-400 font-semibold' : 'text-neutral-400'}`}>
                      {c.name}
                    </span>
                    <span className="text-[10px] bg-white/10 text-neutral-400 rounded-full px-2 min-w-[20px] text-center font-bold">
                      {c.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Company group */}
          {displayedCompanies.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-neutral-500 tracking-[0.1em] uppercase">Company</span>
                <span className="material-icons-outlined text-sm text-neutral-600">expand_more</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {displayedCompanies.map(c => (
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
                    <span className="text-[10px] bg-white/10 text-neutral-400 rounded-full px-2 min-w-[20px] text-center font-bold">
                      {c.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 min-w-0">
          <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md pb-4 mb-6 -mx-2 px-2 border-b border-neutral-900">
            <div className="flex flex-wrap gap-2 items-center overflow-x-auto py-2 no-scrollbar">
              {PROJECT_TABS.map(tab => {
                const isActive = activeTab === tab.label;
                return (
                  <button
                    key={tab.label || 'all'}
                    onClick={() => handleTabClick(tab.label)}
                    suppressHydrationWarning
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all border border-transparent ${
                      isActive 
                        ? 'bg-neutral-800 text-white border-neutral-600 shadow-md' 
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-neutral-300'
                    }`}
                  >
                    <span className="material-icons-outlined text-base">{tab.icon}</span>
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
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-24 text-neutral-600">
              <span className="material-icons-outlined text-5xl block mb-4">search_off</span>
              <p className="font-medium">ไม่พบโครงการในหมวดนี้</p>
            </div>
          )}

          {/* Grid Layout */}
          {!loading && filteredPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {filteredPosts.map(post => (
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
