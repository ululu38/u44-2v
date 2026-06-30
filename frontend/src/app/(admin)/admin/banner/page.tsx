"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import MediaGallery from "@/components/common/MediaGallery";
import { CachedImage } from "@/app/components/CachedImage";

interface Banner {
  id: number;
  name: string;
  mediaId: number | null;
  media?: any;
  linkUrl: string | null;
  status: number;
  createdAt: string;
}

export default function BannerAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  
  const [modalLogoMediaId, setModalLogoMediaId] = useState<number | null>(null);
  const [modalLogoUrl, setModalLogoUrl] = useState("");

  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    setMounted(true);
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setBanners(result.data || result || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (banner: Banner | null) => {
    setEditingBanner(banner);
    setModalLogoMediaId(banner ? banner.mediaId : null);
    setModalLogoUrl(banner && banner.media ? (banner.media.urlThumb || banner.media.urlFull) : "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const saveBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const linkUrl = (form.elements.namedItem('linkUrl') as HTMLInputElement).value;
    const status = (form.elements.namedItem('status') as HTMLSelectElement).value;

    const payload = {
      name,
      linkUrl,
      status: parseInt(status),
      mediaId: modalLogoMediaId,
    };

    try {
      const url = editingBanner 
        ? `${process.env.NEXT_PUBLIC_API_URL}/banner/${editingBanner.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/banner`;
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (response.ok) {
        closeModal();
        fetchBanners();
      } else {
        alert("Failed to save banner");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving banner");
    }
  };

  const deleteBanner = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (banner: Banner) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: banner.status === 1 ? 0 : 1 }),
        credentials: 'include'
      });
      if (response.ok) {
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMediaSelect = (media: any) => {
    setModalLogoMediaId(media.id);
    setModalLogoUrl(media.urlThumb || media.urlFull);
    setShowGallery(false);
  };

  if (!mounted) return null;

  const filteredBanners = banners.filter((banner) => {
    let match = true;
    if (filterStatus !== 'all') {
      if (banner.status.toString() !== filterStatus) match = false;
    }
    if (filterKeyword) {
      if (!banner.name.toLowerCase().includes(filterKeyword.toLowerCase())) match = false;
    }
    return match;
  });

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="material-icons text-blue-600 text-4xl">view_carousel</span>
              Floating Banners
            </h2>
          </div>
          <button 
            onClick={() => openModal(null)}
            className="bg-[#007bff] text-white w-10 h-10 min-[500px]:w-auto min-[500px]:h-auto min-[500px]:px-8 min-[500px]:py-3 rounded-lg font-bold hover:bg-[#0069d9] transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
            title="New Banner"
          >
            <span className="material-icons">add</span>
            <span className="hidden min-[500px]:inline">New Banner</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Search Keyword */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search banner name..."
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm text-gray-700 bg-white"
              />
              {filterKeyword && (
                <button
                  type="button"
                  onClick={() => setFilterKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm text-gray-700 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="1">Public</option>
              <option value="0">Draft</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="w-1.5 p-0"></th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase">Content</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-medium">Loading banners...</td>
                  </tr>
                ) : filteredBanners.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-medium">No banners found matching your filters.</td>
                  </tr>
                ) : (
                  filteredBanners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className={`w-1.5 p-0 ${banner.status === 1 ? 'bg-green-500' : 'bg-yellow-500'}`} title={banner.status === 1 ? 'Public' : 'Draft'} />
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-start gap-2.5 max-w-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white p-1 shrink-0">
                              {banner.media ? (
                                <img 
                                  src={(banner.media.urlThumb || banner.media.urlFull).startsWith('/') && !(banner.media.urlThumb || banner.media.urlFull).startsWith('/images/') ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${banner.media.urlThumb || banner.media.urlFull}` : (banner.media.urlThumb || banner.media.urlFull)} 
                                  alt={banner.name} 
                                  className="w-full h-full object-cover rounded" 
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Image</div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base font-bold text-gray-800">{banner.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <span className="material-icons-outlined text-[12px]">link</span>
                                  {banner.linkUrl || 'No Link'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openModal(banner)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <span className="material-icons-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => deleteBanner(banner.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <span className="material-icons-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                <span className="material-icons-outlined text-xl">close</span>
              </button>
            </div>
            <form onSubmit={saveBanner} className="p-6">
              
              {/* Image Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Image</label>
                <div 
                  onClick={() => setShowGallery(true)}
                  className="w-full aspect-[21/9] border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:bg-blue-50/50 transition-colors"
                >
                  {modalLogoUrl ? (
                    <img 
                      src={modalLogoUrl.startsWith('/') && !modalLogoUrl.startsWith('/images/') ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${modalLogoUrl}` : modalLogoUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <>
                      <span className="material-icons-outlined text-4xl text-gray-400 mb-2">add_photo_alternate</span>
                      <span className="text-gray-500 text-sm font-medium">Click to select image</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={editingBanner?.name || ""} 
                    required 
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    placeholder="e.g. Summer Promotion"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Link URL</label>
                  <input 
                    type="text" 
                    name="linkUrl" 
                    defaultValue={editingBanner?.linkUrl || ""} 
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    placeholder="/services/network"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingBanner ? editingBanner.status : 1}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                  >
                    <option value={1}>Public</option>
                    <option value={0}>Draft</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">Save Banner</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showGallery && mounted && createPortal(
        <MediaGallery 
          isModal={true} 
          onSelect={(media: any) => {
            setModalLogoUrl(media.urlThumb || media.urlFull);
            setModalLogoMediaId(media.id);
            setShowGallery(false);
          }} 
          onClose={() => setShowGallery(false)} 
        />,
        document.body
      )}
      </div>
    </>
  );
}
