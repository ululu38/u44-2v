'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';


export interface MediaItem {
  id: number;
  urlFull: string;
  urlThumb: string;
  urlMini?: string;
  width: number;
  height: number;
  blurHash: string;
}

interface MediaGalleryProps {
  onSelect?: (media: MediaItem) => void;
  onSelectMultiple?: (media: MediaItem[]) => void;
  onClose?: () => void;
  isModal?: boolean;
  allowMultiple?: boolean;
}

const LIMIT = 30;

const MediaGallery: React.FC<MediaGalleryProps> = ({
  onSelect,
  onSelectMultiple,
  onClose,
  isModal = false,
  allowMultiple = false
}) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);

  // Body scroll lock
  useEffect(() => {
    if (isModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModal]);

  const fetchMedia = useCallback(async (p: number, reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/media?page=${p}&limit=${LIMIT}`,
        { credentials: 'include' }
      );
      const result = await res.json();
      const newItems: MediaItem[] = result.data || [];

      setMediaList(prev => reset ? newItems : [...prev, ...newItems]);
      setTotalItems(result.meta?.total ?? 0);
      setHasMore(p < (result.meta?.totalPages ?? 1));
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMedia(1, true);
  }, [fetchMedia]);

  // IntersectionObserver for infinite scroll using callback ref
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          setPage(prev => {
            const next = prev + 1;
            fetchMedia(next);
            return next;
          });
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const results: MediaItem[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        if (res.ok) results.push(await res.json());
      }
      if (results.length > 0) {
        // Prepend new uploads and reset
        setPage(1);
        setHasMore(true);
        setMediaList([]);
        fetchMedia(1, true);
        if (allowMultiple) {
          setSelectedMedia(prev => [...results, ...prev]);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleSelect = (item: MediaItem) => {
    if (allowMultiple) {
      const isSelected = selectedMedia.find(m => m.id === item.id);
      setSelectedMedia(isSelected
        ? selectedMedia.filter(m => m.id !== item.id)
        : [...selectedMedia, item]
      );
    } else {
      if (onSelect) onSelect(item);
    }
  };

  const handleConfirm = () => {
    if (onSelectMultiple && selectedMedia.length > 0) {
      onSelectMultiple(selectedMedia);
    } else if (onSelect && selectedMedia.length === 1) {
      onSelect(selectedMedia[0]);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบรูปภาพ?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setMediaList(prev => prev.filter(m => m.id !== id));
        setTotalItems(prev => prev - 1);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    alert(msg);
  };

  const content = (
    <div className={`flex flex-col h-full ${isModal ? 'text-foreground' : 'bg-background !text-foreground p-6 rounded-xl shadow-sm border border-border'}`}>

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-5 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">คลังสื่อ (Media Gallery)</h2>
          <p className="text-sm text-gray-500 mt-0.5">{totalItems} รูปภาพทั้งหมด</p>
        </div>
        <div className="flex gap-3 items-center">
          <label className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl cursor-pointer flex items-center gap-2 transition-all font-bold shadow-md text-sm active:scale-95 ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
            <span className={`material-symbols-outlined text-sm ${uploading ? 'animate-spin' : ''}`}>
              {uploading ? 'sync' : 'upload'}
            </span>
            {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปภาพ'}
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*" multiple />
          </label>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Image Grid ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0 pr-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {mediaList.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <span className="material-symbols-outlined text-6xl mb-3 opacity-20">photo_library</span>
            <p className="text-sm">ยังไม่มีรูปภาพในคลัง</p>
          </div>
        ) : (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
          >
            {mediaList.map((item) => {
              const isSelected = selectedMedia.some(m => m.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item)}
                  className={`group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer shadow-sm
                    ${isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-blue-100'
                      : 'border-transparent hover:border-blue-300 hover:shadow-md'
                    }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.urlMini || item.urlThumb}`}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500
                      ${isSelected ? 'scale-105' : 'group-hover:scale-110'}`}
                    loading="lazy"
                  />

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10 animate-in zoom-in duration-200">
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                  )}

                  {/* ID tag */}
                  {!isSelected && (
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/50 rounded text-[9px] text-white/70 font-mono backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      #{item.id}
                    </div>
                  )}

                  {/* Delete / Copy overlay (non-modal) */}
                  {!isModal && !isSelected && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.urlFull}`, 'URL Copied!'); }}
                        className="bg-white/90 p-1.5 rounded-lg text-blue-600 hover:bg-white transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">link</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="bg-red-500/90 p-1.5 rounded-lg text-white hover:bg-red-600 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Sentinel */}
            {hasMore && <div ref={sentinelRef} className="col-span-full h-10 w-full" />}
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              กำลังโหลด...
            </div>
          </div>
        )}

        {/* End of list */}
        {!loading && !hasMore && mediaList.length > 0 && (
          <p className="text-center text-xs text-gray-300 py-6 font-mono">
            — โหลดครบทุกรูปแล้ว ({totalItems} รูป) —
          </p>
        )}
      </div>

      {/* ── Footer (multi-select confirm) ── */}
      {isModal && allowMultiple && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-500">
            เลือกแล้ว <span className="text-blue-600 font-bold">{selectedMedia.length}</span> รูป
          </span>
          <button
            onClick={handleConfirm}
            disabled={selectedMedia.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            ตกลง (Confirm)
          </button>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 w-full max-w-6xl h-[90vh] flex flex-col relative">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default MediaGallery;

