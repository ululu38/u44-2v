"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import MediaGallery from "@/components/common/MediaGallery";

interface Partner {
  partnerId: number;
  name: string;
  logoMediaId: number | null;
  logoMedia?: any;
  description: string;
  displayOrder: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [modalLogoUrl, setModalLogoUrl] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [modalLogoMediaId, setModalLogoMediaId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = (partner: Partner | null) => {
    setEditingPartner(partner);
    setModalLogoMediaId(partner ? partner.logoMediaId : null);
    setModalLogoUrl(partner && partner.logoMedia ? (partner.logoMedia.urlThumb || partner.logoMedia.urlFull) : "");
    setIsModalOpen(true);
  };

  const fetchPartners = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners?page=${page}&limit=10`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setPartners(result.data);
        setMeta(result.meta);
        setCurrentPage(result.meta.page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners(currentPage);
  }, [currentPage]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    if (data.displayOrder) data.displayOrder = parseInt(data.displayOrder as string);
    if (data.logoMediaId) data.logoMediaId = parseInt(data.logoMediaId as string);
    else delete data.logoMediaId;

    const method = editingPartner ? 'PATCH' : 'POST';
    const url = editingPartner 
      ? `${process.env.NEXT_PUBLIC_API_URL}/partners/${editingPartner.partnerId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/partners`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingPartner(null);
        fetchPartners(currentPage);
      }
    } catch (err) {
      alert('Error saving partner');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) fetchPartners(currentPage);
    } catch (err) {
      alert('Error deleting partner');
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && partners.length === 0) return <div className="p-8 text-center text-gray-500">Loading partners...</div>;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="material-icons text-blue-600 text-4xl">handshake</span>
            Partner Management
          </h2>
          <p className="text-gray-500 mt-1">Manage partners with pagination and image uploads.</p>
        </div>
        <button 
          onClick={() => openModal(null)}
          className="bg-[#007bff] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0069d9] transition-all shadow-md flex items-center gap-2 active:scale-95"
        >
          <span className="material-icons">add</span>
          New Partner
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-gray-400">search</span>
          <input 
            type="text"
            placeholder="Search current page partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase">Partner</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase text-center">Order</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPartners.map((p) => (
                <tr key={p.partnerId} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white p-1">
                        {p.logoMedia ? (
                          <img 
                            src={(p.logoMedia.urlMini || p.logoMedia.urlThumb || p.logoMedia.urlFull).startsWith('/') && !(p.logoMedia.urlMini || p.logoMedia.urlThumb || p.logoMedia.urlFull).startsWith('/images/') ? `${process.env.NEXT_PUBLIC_API_URL}${p.logoMedia.urlMini || p.logoMedia.urlThumb || p.logoMedia.urlFull}` : (p.logoMedia.urlMini || p.logoMedia.urlThumb || p.logoMedia.urlFull)} 
                            alt="" 
                            className="w-full h-full object-contain" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Image</div>
                        )}
                      </div>
                      <span className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">{p.displayOrder}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => openModal(p)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-all"><span className="material-icons text-2xl">edit</span></button>
                      <button onClick={() => handleDelete(p.partnerId)} className="p-2 text-red-400 hover:bg-red-100 rounded-full transition-all"><span className="material-icons text-2xl">delete_outline</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-100">
              <span className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</span>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">Prev</button>
                <button disabled={currentPage === meta.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start md:items-center z-50 p-4 overflow-y-auto py-10 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 my-auto animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{editingPartner ? 'Edit Partner' : 'New Partner'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Partner Name</label>
                  <input name="name" required defaultValue={editingPartner?.name} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Partner Logo</label>
                  <div className="flex items-center gap-4 mb-3">
                    {modalLogoUrl ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white p-1 group flex items-center justify-center">
                        <img 
                          src={modalLogoUrl.startsWith('/') && !modalLogoUrl.startsWith('/images/') ? `${process.env.NEXT_PUBLIC_API_URL}${modalLogoUrl}` : modalLogoUrl} 
                          alt="Logo Preview" 
                          className="w-full h-full object-contain" 
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setModalLogoUrl("");
                            setModalLogoMediaId(null);
                          }}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                        <span className="material-icons text-2xl">image</span>
                        <span className="text-[9px] mt-1 uppercase font-bold">No Logo</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowGallery(true)}
                        className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 text-xs font-bold active:scale-95"
                      >
                          <span className="material-icons text-sm">collections</span>
                          Browse Gallery
                      </button>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Supports Uploading inside gallery</span>
                    </div>
                  </div>
                  <input 
                    type="hidden"
                    name="logoMediaId" 
                    required 
                    value={modalLogoMediaId || ''} 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                  <textarea name="description" defaultValue={editingPartner?.description} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-sm" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Display Order</label>
                  <input name="displayOrder" type="number" defaultValue={editingPartner?.displayOrder || 0} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-[2] py-3 bg-[#007bff] text-white rounded-xl font-bold hover:bg-[#0069d9] transition-all shadow-lg active:scale-95">Save Partner</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      </div>

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
    </>
  );
}
