"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import PostEditor from "@/components/common/PostEditor";
import MediaGallery from "@/components/common/MediaGallery";
import HashtagsInput from "@/components/common/HashtagsInput";
import { CachedImage } from "@/app/components/CachedImage";
import Link from "next/link";
import Sqids from 'sqids';

const sqids = new Sqids({ minLength: 5 });

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
  slug?: string;
  thumbnailMediaId?: number | null;
  thumbnailMedia?: any;
  sliderImages?: any[];
  clients?: Client[];
}

export default function PostEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [postTitle, setPostTitle] = useState("");
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [thumbnailMediaId, setThumbnailMediaId] = useState<number | null>(null);
  const [sliderImages, setSliderImages] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showThumbGallery, setShowThumbGallery] = useState(false);
  const [showSliderGallery, setShowSliderGallery] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchClients();
    if (slug && slug !== 'new') {
      loadPost(slug);
    } else {
      // Create mode
      setPost({ postId: 0, title: '', content: '', tags: [], status: 1 });
      setLoading(false);
    }
  }, [slug]);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients?limit=100`, { credentials: "include" });
      if (res.ok) {
        const result = await res.json();
        setClients(result.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPost = async (slug: string) => {
    setLoading(true);
    try {
      const parts = slug.split('-');
      const encodedId = parts.pop();
      if (!encodedId) throw new Error("Invalid slug");

      const ids = sqids.decode(encodedId);
      if (ids.length === 0) throw new Error("Invalid slug");
      
      const postId = ids[0];

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, { 
        credentials: "include",
        cache: "no-store"
      });
      if (!res.ok) throw new Error("Failed to load");
      const fullPost = await res.json();

      setPost(fullPost);
      setPostTitle(fullPost.title || "");
      if (fullPost.thumbnailMedia) setThumbPreview(fullPost.thumbnailMedia.urlFull);
      if (fullPost.thumbnailMediaId) setThumbnailMediaId(fullPost.thumbnailMediaId);
      if (fullPost.sliderImages) setSliderImages(fullPost.sliderImages.map((si: any) => si.media));
      if (fullPost.tags) setSelectedTags(fullPost.tags);
      if (fullPost.clients) setSelectedClientIds(fullPost.clients.map((c: any) => c.clientId));
    } catch (err) {
      console.error(err);
      alert("Failed to load post");
      router.push("/admin/posts");
    } finally {
      setLoading(false);
    }
  };

  const autoSetThumbnail = () => {
    if (sliderImages.length > 0) {
      setThumbPreview(sliderImages[0].urlFull);
      setThumbnailMediaId(sliderImages[0].id);
    }
  };

  const removeSliderImage = (id: number) =>
    setSliderImages((p) => p.filter((img) => img.id !== id));

  const handleSliderSelectMultiple = (mediaItems: any[]) => {
    setSliderImages((prev) => {
      const next = [...prev];
      mediaItems.forEach((item) => {
        if (!next.find((img) => img.id === item.id)) next.push(item);
      });
      return next;
    });
    setShowSliderGallery(false);
  };

  const handleThumbSelect = (media: any) => {
    setThumbnailMediaId(media.id);
    setThumbPreview(media.urlFull);
    setShowThumbGallery(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    data.thumbnailMediaId = thumbnailMediaId ?? null;
    data.status = parseInt(data.status);
    data.sliderImageIds = sliderImages.map((img) => img.id);
    data.clientIds = selectedClientIds;
    data.tags = selectedTags;

    const isNew = slug === 'new';
    const method = isNew ? 'POST' : 'PATCH';
    const url = isNew
      ? `${process.env.NEXT_PUBLIC_API_URL}/posts`
      : `${process.env.NEXT_PUBLIC_API_URL}/posts/${post.postId}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (res.ok) {
        router.push("/admin/posts");
      } else {
        alert("Failed to save post");
      }
    } catch {
      alert("Error saving post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading post…</span>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8 px-4 sm:px-0">
        <Link
          href="/admin/posts"
          className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition-colors text-sm font-semibold shrink-0"
        >
          <span className="material-icons text-base">arrow_back</span>
          <span className="hidden sm:inline">Back to Posts</span>
        </Link>
        <div className="h-5 w-px bg-gray-200 shrink-0" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 truncate">
          <span className="material-icons text-blue-600 shrink-0">edit_note</span>
          <span className="truncate">{slug === 'new' ? 'Create New Post' : 'Edit Post'}</span>
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Title</label>
          <input
            name="title"
            defaultValue={post.title}
            onChange={(e) => setPostTitle(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none transition-all text-gray-800 text-lg font-semibold"
            placeholder="Post title…"
          />
        </div>

        {/* Thumbnail */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <label className="block text-sm font-semibold text-gray-600 mb-4">Thumbnail</label>
          <div className="flex items-center gap-6">
            {thumbPreview ? (
              <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-gray-200 group shadow-sm flex-shrink-0">
                <CachedImage
                  src={thumbPreview.startsWith("/") ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${thumbPreview}` : thumbPreview}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                  skeletonClassName="w-full h-full animate-pulse bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => { setThumbPreview(null); setThumbnailMediaId(null); }}
                  className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="w-36 h-24 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
                <span className="material-icons text-3xl">image</span>
                <span className="text-[10px] mt-1 uppercase font-bold">No Image</span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                title="Browse Gallery"
                onClick={() => setShowThumbGallery(true)}
                className="bg-blue-600 w-9 h-9 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 rounded-lg text-white hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm font-bold shrink-0"
              >
                <span className="material-icons text-sm">add_photo_alternate</span>
                <span className="hidden sm:inline">Browse Gallery</span>
              </button>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Recommended: 1200×630px
              </span>
            </div>
          </div>
          <input type="hidden" name="thumbnailMediaId" value={thumbnailMediaId ?? ""} readOnly />
        </div>

        {/* Slider Images */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 gap-2">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700">Slider Images</label>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">
                These images appear in the top slider
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {sliderImages.length > 0 && (
                <button
                  type="button"
                  onClick={autoSetThumbnail}
                  title="Auto Thumbnail"
                  className="bg-amber-500 hover:bg-amber-600 text-white w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="material-icons text-sm">auto_awesome</span>
                  <span className="hidden sm:inline">Auto Thumbnail</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSliderGallery(true)}
                title="Add to Slider"
                className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span className="material-icons text-sm">add_photo_alternate</span>
                <span className="hidden sm:inline">Add to Slider</span>
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden custom-scrollbar p-1 pb-4 snap-x">
            {sliderImages.map((img) => (
              <div
                key={img.id}
                className="group relative w-40 h-40 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all snap-start"
              >
                <CachedImage
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${img.urlThumb}`}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 duration-500 transition-transform"
                  skeletonClassName="w-full h-full animate-pulse bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => removeSliderImage(img.id)}
                  className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <button
                    type="button"
                    onClick={() => { setThumbPreview(img.urlFull); setThumbnailMediaId(img.id); }}
                    className="w-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white py-2 rounded-lg text-[10px] font-extrabold transition-all border border-white/30 tracking-wider"
                  >
                    USE AS THUMBNAIL
                  </button>
                </div>
              </div>
            ))}
            {sliderImages.length === 0 && (
              <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs italic">
                No images in slider yet.
              </div>
            )}
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white sm:rounded-xl border-y sm:border-x border-gray-200 shadow-sm">
          <div className="p-4 sm:p-6 pb-2 sm:pb-4">
            <label className="block text-sm font-semibold text-gray-600">Content</label>
          </div>
          <div className="sm:px-6 sm:pb-6">
            <PostEditor
              content={post.content}
              postTitle={postTitle}
              onChange={(newContent) => {
                const el = document.getElementById("content-input") as HTMLInputElement;
                if (el) el.value = newContent;
              }}
            />
          </div>
          <input type="hidden" id="content-input" name="content" defaultValue={post.content} />
        </div>

        {/* Hashtags */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">Hashtags</label>
          <HashtagsInput value={selectedTags} onChange={setSelectedTags} />
        </div>

        {/* Clients + Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-600 mb-3">ลูกค้า (Clients)</label>
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="ค้นหาลูกค้าเพื่อเลือก..."
                value={clientSearchQuery}
                onChange={(e) => { setClientSearchQuery(e.target.value); setShowClientDropdown(true); }}
                onFocus={() => setShowClientDropdown(true)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none bg-white text-gray-700 text-sm"
              />
              {showClientDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowClientDropdown(false)} />
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto z-20">
                    {clients
                      .filter((c) => c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()))
                      .filter((c) => !selectedClientIds.includes(c.clientId))
                      .map((c) => (
                        <button
                          key={c.clientId}
                          type="button"
                          onClick={() => {
                            setSelectedClientIds((prev) => [...prev, c.clientId]);
                            setClientSearchQuery("");
                            setShowClientDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm text-gray-700 transition-colors border-b last:border-b-0 border-gray-100 flex items-center gap-2"
                        >
                          <span className="material-icons text-gray-400 text-sm">business</span>
                          {c.name}
                        </button>
                      ))}
                    {clients
                      .filter((c) => c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()))
                      .filter((c) => !selectedClientIds.includes(c.clientId)).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-400 italic">ไม่พบรายชื่อลูกค้า</div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 min-h-[28px]">
              {selectedClientIds.map((cId) => {
                const client = clients.find((c) => c.clientId === cId);
                if (!client) return null;
                return (
                  <span
                    key={cId}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    <span className="material-icons text-xs">business</span>
                    {client.name}
                    <button
                      type="button"
                      onClick={() => setSelectedClientIds((prev) => prev.filter((id) => id !== cId))}
                      className="text-amber-500 hover:text-amber-700 font-extrabold ml-1 text-xs"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
              {selectedClientIds.length === 0 && (
                <span className="text-xs text-gray-400 italic">ไม่ได้เลือกลูกค้า</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-600 mb-3">Status</label>
            <select
              name="status"
              defaultValue={post.status}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none bg-white text-gray-700"
            >
              <option value={1}>Published</option>
              <option value={0}>Draft</option>
            </select>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 pb-[500px] sm:pb-10 px-4 sm:px-0">
          <Link
            href="/admin/posts"
            title="Cancel"
            className="flex-1 text-center py-4 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons sm:hidden">close</span>
            <span className="hidden sm:inline">Cancel</span>
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-[3] bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Saving…</span>
              </>
            ) : (
              <>
                <span className="material-icons">save</span>
                <span className="hidden sm:inline">{slug === 'new' ? 'Create Post' : 'Update Post'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {showThumbGallery && mounted &&
        createPortal(
          <MediaGallery isModal onSelect={handleThumbSelect} onClose={() => setShowThumbGallery(false)} />,
          document.body
        )}
      {showSliderGallery && mounted &&
        createPortal(
          <MediaGallery
            isModal
            allowMultiple
            onSelectMultiple={handleSliderSelectMultiple}
            onClose={() => setShowSliderGallery(false)}
          />,
          document.body
        )}
    </div>
  );
}