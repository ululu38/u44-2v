"use client";

import React, { useState, useEffect, useRef } from "react";
import { CachedImage } from "@/app/components/CachedImage";
import Link from "next/link";


const CATEGORIES = [
  { id: 1, name: 'News' },
  { id: 2, name: 'Solution' },
  { id: 3, name: 'Project' },
  { id: 4, name: 'Product' },
  { id: 5, name: 'Services' },
  { id: 6, name: 'Movement' },
  { id: 7, name: 'Solution News' }
];

interface Client {
  clientId: number;
  name: string;
}

interface Post {
  postId: number;
  title: string;
  content: string;
  tags: any;
  status: number;
  views: number;
  slug?: string;
  thumbnailMediaId?: number | null;
  thumbnailMedia?: any;
  sliderImages?: any[];
  clientIds?: number[];
  clients?: Client[];
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState<number | null>(null);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients?limit=100`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setClients(result.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);



  // Filters State
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClient, setFilterClient] = useState("all");

  const fetchPosts = async (page = 1, reset = false) => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/posts?page=${page}&limit=10&fields=postId,title,slug,tags,status,views,createdAt,updatedAt,thumbnailMedia,clients&thumbSize=mini`;
      if (filterKeyword) url += `&q=${encodeURIComponent(filterKeyword)}`;
      if (filterTag && filterTag !== "all") url += `&tag=${encodeURIComponent(filterTag)}`;
      if (filterStatus && filterStatus !== "all") url += `&status=${filterStatus}`;
      if (filterClient && filterClient !== "all") url += `&clientId=${filterClient}`;

      const response = await fetch(url, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        if (page === 1 || reset) {
          setPosts(result.data || []);
        } else {
          setPosts(prev => [...prev, ...(result.data || [])]);
        }
        setMeta(result.meta);
        setCurrentPage(result.meta.page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced effect to trigger reset fetch on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1, true);
    }, 150);
    return () => clearTimeout(timer);
  }, [filterKeyword, filterTag, filterStatus, filterClient]);

  // Observer effect to trigger next page load
  useEffect(() => {
    if (!meta || currentPage >= meta.totalPages || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          fetchPosts(currentPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [meta, currentPage, loading]);

  const handleFilterChange = (type: string, value: string) => {
    setCurrentPage(1);
    if (type === 'keyword') setFilterKeyword(value);
    if (type === 'tag') setFilterTag(value);
    if (type === 'status') setFilterStatus(value);
    if (type === 'client') setFilterClient(value);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) fetchPosts(1, true);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (loading && posts.length === 0) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="material-icons text-blue-600 text-4xl">article</span>
            Post Management
          </h2>
        
        </div>
        <button 
          onClick={() => window.location.href = '/admin/post/edit/new'} 
          className="bg-[#007bff] text-white w-10 h-10 min-[500px]:w-auto min-[500px]:h-auto min-[500px]:px-8 min-[500px]:py-3 rounded-lg font-bold hover:bg-[#0069d9] transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
          title="New Post"
        >
          <span className="material-icons">add</span>
          <span className="hidden min-[500px]:inline">New Post</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Search Keyword */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Keyword</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search title, content..."
              value={filterKeyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm text-gray-700 bg-white"
            />
            {filterKeyword && (
              <button
                type="button"
                onClick={() => handleFilterChange('keyword', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category (Tag) Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category (Tag)</label>
          <select
            value={filterTag}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm text-gray-700 bg-white"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm text-gray-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="1">Published</option>
            <option value="0">Draft</option>
          </select>
        </div>

        {/* Client Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Client</label>
          <select
            value={filterClient}
            onChange={(e) => handleFilterChange('client', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm text-gray-700 bg-white"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.clientId} value={c.clientId.toString()}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="w-1.5 p-0"></th>
              <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase">Content</th>
              <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.postId} className="hover:bg-blue-50/30 transition-colors group">
                <td className={`w-1.5 p-0 ${post.status === 1 ? 'bg-green-500' : 'bg-yellow-500'}`} title={post.status === 1 ? 'Published' : 'Draft'} />
                <td className="px-6 py-5">
                  <div className="flex flex-col items-start gap-2.5 max-w-xl">
                    <div className="flex items-center gap-3">
                      {post.thumbnailMedia ? (
                        <CachedImage 
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${post.thumbnailMedia.urlMini || post.thumbnailMedia.urlThumb || post.thumbnailMedia.urlFull}`} 
                          alt="" 
                          className="w-12 h-12 rounded object-cover border border-gray-200 shrink-0" 
                          skeletonClassName="w-12 h-12 rounded animate-pulse bg-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                          <span className="material-symbols-outlined">image_not_supported</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 items-center">
                        {post.clients && post.clients.map(client => (
                          <span key={client.clientId} className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-icons text-[10px]">business</span>
                            {client.name}
                          </span>
                        ))}
                        {post.tags && (post.tags as string[]).map((tagName: string) => {
                          const cat = CATEGORIES.find(c => c.name.toLowerCase() === tagName.toLowerCase());
                          return cat ? (
                            <span key={tagName} className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                              {cat.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <span 
                      className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2" 
                      title={post.title}
                    >
                      {post.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  {/* Desktop view actions */}
                  <div className="hidden min-[500px]:flex justify-center gap-3">
                    <a href={`/admin/post/preview/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-green-500 hover:bg-green-100 rounded-full transition-all" title="Preview Post">
                      <span className="material-icons text-2xl">visibility</span>
                    </a>
                    <a href={`/admin/post/edit/${post.slug}`} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-all" title="Edit Post">
                      <span className="material-icons text-2xl">edit</span>
                    </a>
                    <button onClick={() => handleDelete(post.postId)} className="p-2 text-red-400 hover:bg-red-100 rounded-full transition-all" title="Delete Post">
                      <span className="material-icons text-2xl">delete_outline</span>
                    </button>
                  </div>

                  {/* Mobile 3-dots dropdown menu */}
                  <div className="relative min-[500px]:hidden flex justify-center">
                    <button 
                      onClick={() => setActiveMenuPostId(activeMenuPostId === post.postId ? null : post.postId)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500"
                      title="More Actions"
                    >
                      <span className="material-icons">more_vert</span>
                    </button>
                    
                    {activeMenuPostId === post.postId && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveMenuPostId(null)}
                        />
                        <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20 w-36 text-left animate-in fade-in slide-in-from-bottom-1 duration-100">
                          <a 
                            href={`/admin/post/preview/${post.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={() => setActiveMenuPostId(null)}
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-green-600 transition-colors"
                          >
                            <span className="material-icons text-sm">visibility</span>
                            Preview Post
                          </a>
                          <a 
                            href={`/admin/post/edit/${post.slug}`}
                            onClick={() => setActiveMenuPostId(null)}
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-blue-600 transition-colors"
                          >
                            <span className="material-icons text-sm">edit</span>
                            Edit Post
                          </a>
                          <button 
                            onClick={() => {
                              handleDelete(post.postId);
                              setActiveMenuPostId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-red-500 transition-colors text-left"
                          >
                            <span className="material-icons text-sm">delete_outline</span>
                            Delete Post
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

         {/* Infinite Scroll Loader & Sentinel */}
         <div ref={observerTarget} className="p-6 flex flex-col items-center justify-center border-t border-gray-50 bg-gray-50/50">
           {loading && (
             <div className="flex items-center gap-2 text-gray-500 text-sm">
               <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
               <span>Loading more...</span>
             </div>
           )}
           {!loading && meta && currentPage < meta.totalPages && (
             <button 
               onClick={() => fetchPosts(currentPage + 1)}
               className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider py-1 px-4 hover:bg-blue-50 rounded-lg"
             >
               Load More
             </button>
           )}
           {!loading && meta && currentPage >= meta.totalPages && (
             <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
               No more posts
             </span>
           )}
         </div>
      </div>
    </div>
  );
}
