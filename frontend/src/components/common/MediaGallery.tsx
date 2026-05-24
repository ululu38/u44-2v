'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  onSelect, 
  onSelectMultiple,
  onClose, 
  isModal = false,
  allowMultiple = false 
}) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchMedia = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media?page=${p}&limit=24`, {
        credentials: 'include',
      });

      const result = await res.json();
      setMediaList(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(page);
  }, [page]);

  // Body scroll lock
  useEffect(() => {
    if (isModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModal]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const results: MediaItem[] = [];

    try {
      // Upload files sequentially or in parallel - let's do sequential to avoid server overload but faster feedback
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (res.ok) {
          const newMedia = await res.json();
          results.push(newMedia);
        }
      }
      
      // Update list with all successful uploads
      if (results.length > 0) {
        setMediaList([...results, ...mediaList]);
        if (allowMultiple) {
          setSelectedMedia(prev => [...results, ...prev]);
        }
      }

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const toggleSelect = (item: MediaItem) => {
    if (allowMultiple) {
      const isSelected = selectedMedia.find(m => m.id === item.id);
      if (isSelected) {
        setSelectedMedia(selectedMedia.filter(m => m.id !== item.id));
      } else {
        setSelectedMedia([...selectedMedia, item]);
      }
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

      if (res.ok) fetchMedia(page);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    alert(msg);
  };

  const content = (
    <div className={`flex flex-col h-full ${isModal ? 'text-foreground' : 'bg-background !text-foreground p-6 rounded-xl shadow-sm border border-border'}`}>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">คลังสื่อ (Media Gallery)</h2>
          <p className="text-sm text-gray-500">จัดการและเลือกรูปภาพสำหรับบทความ</p>
        </div>
        <div className="flex gap-3">
          <label className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all font-bold shadow-md">

            <span className="material-symbols-outlined text-sm">{uploading ? 'sync' : 'upload'}</span>
            {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปภาพ'}
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*" multiple />
          </label>
          {isModal && onClose && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      <div className={`flex-grow overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pr-2 min-h-[400px] mb-6`}>
        {loading ? (
          <div className="col-span-full py-32 text-center text-gray-400 flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            กำลังโหลดคลังรูปภาพ...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="col-span-full py-32 text-center text-gray-400">
            <span className="material-symbols-outlined text-6xl mb-2 opacity-20">photo_library</span>
            <p>ยังไม่มีรูปภาพในคลัง</p>
          </div>
        ) : (
          mediaList.map((item) => {
            const isSelected = selectedMedia.some(m => m.id === item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item)}
                className={`group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 transition-all shadow-sm ${isSelected ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-gray-200 hover:border-blue-400'}`}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${item.urlMini || item.urlThumb}`}
                  alt=""
                  fill
                  className={`object-cover transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-110'}`}
                  placeholder="blur"
                  blurDataURL={item.blurHash}
                />
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-lg z-10 animate-in zoom-in duration-200">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                )}

                {/* ID Tag */}
                {!isSelected && (
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/50 rounded text-[9px] text-white/70 font-mono backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    ID: {item.id}
                  </div>
                )}

                {/* Individual Delete/Copy (Only when NOT in select mode or if not selected) */}
                {!isModal && !isSelected && (
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(`${process.env.NEXT_PUBLIC_API_URL}${item.urlFull}`, 'URL Copied!'); }}
                        className="bg-white/90 p-1.5 rounded-lg text-blue-600 hover:bg-white"
                      >
                        <span className="material-symbols-outlined text-sm">link</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="bg-red-500/90 p-1.5 rounded-lg text-white hover:bg-red-600"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                   </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6 border-gray-100">
        <div className="flex items-center gap-6">
           {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                หน้า {page} / {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-gray-600"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-gray-600"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {totalItems} รูปภาพทั้งหมด
          </span>
        </div>

        {isModal && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-foreground/70">
              เลือกแล้ว {selectedMedia.length} รูป
            </span>
            <button
              onClick={handleConfirm}
              disabled={selectedMedia.length === 0}
              className="bg-primary hover:bg-primary/90 disabled:bg-surface-muted disabled:text-foreground/30 text-primary-foreground px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              ตกลง (Confirm)
            </button>
          </div>

        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed top-0 left-0 w-full h-full z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col relative">
          {content}
        </div>
      </div>
    );
  }



  return content;
};

export default MediaGallery;
