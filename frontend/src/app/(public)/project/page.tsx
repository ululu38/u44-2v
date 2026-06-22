"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { CachedImage } from "@/components/common/CachedImage";
import { clientCachedFetch } from "@/lib/api/client-cache";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const PROJECT_TAG = "Project";

const PROJECT_TABS = [
  { icon: "apps",            label: "" },
  { icon: "queue_play_next", label: "KIOSK" },
  { icon: "camera_alt",      label: "CCTV" },
  { icon: "smart_display",   label: "Queue Display" },
  { icon: "support_agent",   label: "IT SERVICE" },
  { icon: "tv",              label: "SIGNAGE" },
  { icon: "dns",             label: "SERVER" },
  { icon: "router",          label: "NETWORK" },
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

function imgUrl(p?: string | null) {
  if (!p) return null;
  return p.startsWith("http") ? p : `${API}${p}`;
}

// ── Horizontal scrolling card row ─────────────────────────────────────────
function ProjectCardRow({ post }: { post: Post }) {
  const thumbUrl = imgUrl(post.thumbnailMedia?.urlThumb ?? post.thumbnailMedia?.urlFull);
  const clientTag = post.clients?.[0]?.name ?? null;

  return (
    <Link
      href={`/posts/${post.slug || post.postId}`}
      className="w-full block group relative rounded-xl transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-blue-900/30 bg-[#1a1b22]"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      <div 
        className="rounded-[inherit] overflow-hidden border border-white/5 group-hover:border-blue-500/30 relative"
      >
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#111] rounded-t-[inherit]">
          <CachedImage
            src={thumbUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-[inherit]"
            skeletonClassName="animate-pulse bg-white/5 w-full h-full"
            fallback={
              <div className="w-full h-full flex items-center justify-center text-blue-300/30 rounded-t-[inherit]">
                <span className="material-icons text-5xl">image</span>
              </div>
            }
          />
          {/* Client tag badge */}
          {clientTag && (
            <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-[10px] text-gray-100 px-2 py-0.5 rounded-full border border-white/10">
              {clientTag}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2.5 flex items-center justify-between gap-2">
          <p className="text-[12px] text-gray-200 font-medium line-clamp-2 leading-snug flex-1 group-hover:text-blue-300 transition-colors">
            {post.title}
          </p>
          <div className="flex-none w-8 h-8 rounded-full bg-white/8 group-hover:bg-blue-600 flex items-center justify-center transition-all duration-300 border border-white/10 group-hover:border-blue-500">
            <span className="material-symbols-outlined text-[16px] text-white group-hover:translate-x-0.5 transition-transform">
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

  // cache: { "tabName:pageNum": { posts, meta } }
  const cacheRef = useRef<Record<string, { posts: Post[]; meta: Meta | null }>>({});
  // store page number per tab
  const tabPageRef = useRef<Record<string, number>>({});

  // ── Build sidebar from posts ─────────────────────────────────────────
  useEffect(() => {
    document.title = "U44 Technology Solutions | Projects";
    // fetch ALL posts once to build sidebar counters (limit=200 should be enough)
    const url = `${API}/posts?page=1&limit=200&tag=${PROJECT_TAG}&status=1&fields=postId,title,slug,tags,createdAt,thumbnailMedia,clients&thumbSize=thumb`;
    clientCachedFetch(url, { cacheTTL: 5 * 60 * 1000 })
      .then(d => {
        const data: Post[] = d.data || [];
        const groupMap = new Map<number, { name: string; count: number }>();
        const companyMap = new Map<number, { name: string; count: number }>();
        const cgMap = new Map<number, Set<number>>();
        
        data.forEach(p => {
          (p.clients || []).forEach(c => {
            // Count for client company
            if (!companyMap.has(c.clientId)) {
              companyMap.set(c.clientId, { name: c.name, count: 0 });
            }
            companyMap.get(c.clientId)!.count++;

            // Count for client groups
            (c.groups || []).forEach(g => {
              if (!groupMap.has(g.groupId)) {
                groupMap.set(g.groupId, { name: g.name, count: 0 });
              }
              groupMap.get(g.groupId)!.count++;
              // record mapping client -> group
              if (!cgMap.has(c.clientId)) cgMap.set(c.clientId, new Set());
              cgMap.get(c.clientId)!.add(g.groupId);
            });
          });
        });

        const groups = [...groupMap.entries()].map(([id, v]) => ({ id, ...v }));
        const companies = [...companyMap.entries()].map(([id, v]) => ({ id, ...v }));
        
        setAllClients(groups);
        setAllCompanies(companies);
        // convert cgMap to plain object
        const cgObj: Record<number, number[]> = {};
        cgMap.forEach((s, id) => { cgObj[id] = [...s]; });
        setCompanyGroups(cgObj);
      })
      .catch(() => {});
  }, []);

  // derive companies to display based on selected client groups
  const displayedCompanies = useMemo(() => {
    if (selClients.size === 0) return allCompanies;
    const sel = Array.from(selClients);
    return allCompanies.filter(c => {
      const groups = companyGroups[c.id] || [];
      return groups.some(gid => sel.includes(gid));
    });
  }, [allCompanies, selClients, companyGroups]);

  // ── Fetch filtered posts ─────────────────────────────────────────────
  const fetchPosts = useCallback(async (tab: string, pageNum: number) => {
    const cacheKey = `${tab}:${pageNum}`;
    
    // check if we have cached data for this tab+page
    if (cacheRef.current[cacheKey]) {
      const { posts: cachedPosts, meta: cachedMeta } = cacheRef.current[cacheKey];
      setPosts(cachedPosts);
      setMeta(cachedMeta);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = `${API}/posts?page=${pageNum}&limit=20&tag=${PROJECT_TAG}${tab ? `&q=${encodeURIComponent(tab)}` : ""}&status=1&fields=postId,title,slug,tags,createdAt,thumbnailMedia,clients&thumbSize=thumb`;
      const d = await clientCachedFetch(url, { cacheTTL: 5 * 60 * 1000 });
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
    // when tab changes, restore its page
    const restoredPage = tabPageRef.current[activeTab] || 1;
    if (restoredPage !== page) {
      setPage(restoredPage);
    } else {
      // fetch only if page doesn't change (avoid double fetch)
      const cacheKey = `${activeTab}:${restoredPage}`;
      if (!cacheRef.current[cacheKey]) {
        fetchPosts(activeTab, restoredPage);
      } else {
        // restore from cache immediately
        const { posts: cachedPosts, meta: cachedMeta } = cacheRef.current[cacheKey];
        setPosts(cachedPosts);
        setMeta(cachedMeta);
      }
    }
  }, [activeTab]);

  useEffect(() => { 
    // when page changes, fetch
    const cacheKey = `${activeTab}:${page}`;
    if (!cacheRef.current[cacheKey]) {
      fetchPosts(activeTab, page);
    } else {
      // restore from cache
      const { posts: cachedPosts, meta: cachedMeta } = cacheRef.current[cacheKey];
      setPosts(cachedPosts);
      setMeta(cachedMeta);
      setLoading(false);
    }
  }, [page]);

  // ── Image caching is now handled by CachedImage + useImageCache (TanStack Query) ──

  const handleTabClick = (label: string) => {
    if (label === activeTab) return;
    
    // save current page for active tab
    tabPageRef.current[activeTab] = page;
    
    // restore page for new tab, default to 1
    const restoredPage = tabPageRef.current[label] || 1;
    
    setActiveTab(label);
    setPage(restoredPage);
  };

  // sidebar filter logic (client-side filter on already-fetched posts)
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
      const postGroupIds = new Set(
        (p.clients || []).flatMap(c => (c.groups || []).map(g => g.groupId))
      );
      if (![...selClients].some(id => postGroupIds.has(id))) return false;
    }
    if (selCompanies.size > 0) {
      const postClientIds = new Set((p.clients || []).map(c => c.clientId));
      if (![...selCompanies].some(id => postClientIds.has(id))) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen text-white" style={{ background: "#0f1117", paddingTop: "80px" }}>

      {/* ── Body: sidebar + content ──────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 0, alignItems: "flex-start", padding: "0 0" }}>

        {/* Sidebar */}
        <aside style={{
          width: 240,
          flexShrink: 0,
          padding: "32px 20px",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          minHeight: "calc(100vh - 100px)",
          position: "sticky",
          top: 80,
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
        }} className="no-scrollbar">
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', color: '#fff', marginBottom: 8, lineHeight: 1.1 }}>Project</div>

          </div>

          {/* Clients group */}
          {allClients.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Client Groups</span>
                <span className="material-icons" style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>expand_less</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {allClients.map(c => (
                  <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 6px", borderRadius: 6, transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <input
                      type="checkbox"
                      checked={selClients.has(c.id)}
                      onChange={() => toggleClient(c.id)}
                      style={{ accentColor: "#3b82f6", width: 14, height: 14, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 12, color: selClients.has(c.id) ? "#60a5fa" : "rgba(255,255,255,0.65)", flex: 1, lineHeight: 1.3 }}>{c.name}</span>
                    <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)", borderRadius: 10, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>{c.count}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Company group */}
          {displayedCompanies.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Company</span>
                <span className="material-icons" style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>expand_less</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {displayedCompanies.map(c => (
                  <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 6px", borderRadius: 6, transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <input
                      type="checkbox"
                      checked={selCompanies.has(c.id)}
                      onChange={() => toggleCompany(c.id)}
                      style={{ accentColor: "#3b82f6", width: 14, height: 14, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 12, color: selCompanies.has(c.id) ? "#60a5fa" : "rgba(255,255,255,0.65)", flex: 1, lineHeight: 1.3 }}>{c.name}</span>
                    <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)", borderRadius: 10, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>{c.count}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "28px 28px 60px", minWidth: 0 }}>
          <div style={{ marginBottom: 26, paddingBottom: 14, position: 'sticky', top: 80, zIndex: 25 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', overflowX: 'auto', padding: '16px 0' }} className="no-scrollbar">
              {PROJECT_TABS.map(tab => {
                const isActive = activeTab === tab.label;
                return (
                  <button
                    key={tab.label || "all"}
                    onClick={() => handleTabClick(tab.label)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 16px",
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      border: "none",
                      background: isActive ? "#111" : "rgb(48, 48, 48)",
                      color: isActive ? "#fff" : "rgba(255,255,255,0.78)",
                      transition: "all .18s ease",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
                  >
                    <span className="material-icons" style={{ fontSize: 16 }}>{tab.icon}</span>
                    {tab.label || "All"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, paddingBottom: 16 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ width: "100%" }}>
                  <div className="animate-pulse" style={{ background: "#1a1b22", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ aspectRatio: "4/3", background: "rgba(255,255,255,0.05)" }} />
                    <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ height: 12, background: "rgba(255,255,255,0.05)", borderRadius: 6, width: "75%" }} />
                      <div style={{ height: 12, background: "rgba(255,255,255,0.05)", borderRadius: 6, width: "50%" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredPosts.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.2)" }}>
              <span className="material-icons" style={{ fontSize: 48, display: "block", marginBottom: 12 }}>search_off</span>
              ไม่พบโครงการในหมวดนี้
            </div>
          )}

          {/* Grid Layout */}
          {!loading && filteredPosts.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, paddingBottom: 16 }}>
              {filteredPosts.map(post => (
                <ProjectCardRow key={post.postId} post={post} />
              ))}
            </div>
          )}

          {/* Load more button */}
          {!loading && meta && page < meta.totalPages && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <button
                onClick={() => setPage(p => p + 1)}
                style={{
                  padding: "10px 28px",
                  background: "rgba(59,130,246,0.15)",
                  color: "#60a5fa",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.15)"; }}
              >
                โหลดเพิ่มเติม
              </button>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
// End of file
