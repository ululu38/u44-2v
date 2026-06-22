"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import MediaGallery from "@/components/common/MediaGallery";
import { CachedImage } from "@/components/common/CachedImage";

interface ClientGroup {
  groupId: number;
  name: string;
  displayOrder: number;
}

interface Client {
  clientId: number;
  name: string;
  logoMediaId: number | null;
  logoMedia?: any;
  displayOrder: number;
  groups?: {
    group: ClientGroup;
  }[];
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalLogoUrl, setModalLogoUrl] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [modalLogoMediaId, setModalLogoMediaId] = useState<number | null>(null);

  // Tag Input States
  const [allGroups, setAllGroups] = useState<ClientGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [groupSearch, setGroupSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAllGroups();
  }, []);

  const fetchAllGroups = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client-groups?limit=100`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setAllGroups(result.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (client: Client | null) => {
    setEditingClient(client);
    setModalLogoMediaId(client ? client.logoMediaId : null);
    setModalLogoUrl(client && client.logoMedia ? (client.logoMedia.urlThumb || client.logoMedia.urlFull) : "");
    setSelectedGroupIds(client && client.groups ? client.groups.map(g => g.group.groupId) : []);
    setGroupSearch("");
    setShowDropdown(false);
    setIsModalOpen(true);
  };

  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients?page=${page}&limit=10`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setClients(result.data);
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
    fetchClients(currentPage);
  }, [currentPage]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    if (data.displayOrder) data.displayOrder = parseInt(data.displayOrder as string);
    data.logoMediaId = data.logoMediaId ? parseInt(data.logoMediaId as string) : null;

    // Add selected groupIds to the request payload
    data.groupIds = selectedGroupIds;

    const method = editingClient ? 'PATCH' : 'POST';
    const url = editingClient 
      ? `${process.env.NEXT_PUBLIC_API_URL}/clients/${editingClient.clientId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/clients`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingClient(null);
        fetchClients(currentPage);
      }
    } catch (err) {
      alert('Error saving client');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) fetchClients(currentPage);
    } catch (err) {
      alert('Error deleting client');
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && clients.length === 0) return <div className="p-8 text-center text-gray-500">Loading clients...</div>;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="material-icons text-blue-600 text-4xl">business</span>
              Client Management
            </h2>
            <p className="text-gray-500 mt-1">Manage clients list, logos, and tag groups.</p>
          </div>
          <button 
            onClick={() => openModal(null)}
            className="bg-[#007bff] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0069d9] transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <span className="material-icons">add</span>
            New Client
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-gray-400">search</span>
            <input 
              type="text"
              placeholder="Search current page clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase">Client</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase">Groups</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase text-center">Order</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClients.map((c) => (
                  <tr key={c.clientId} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white p-1">
                          {c.logoMedia ? (
                            <CachedImage
                              src={(c.logoMedia.urlMini || c.logoMedia.urlThumb || c.logoMedia.urlFull).startsWith('/') && !(c.logoMedia.urlMini || c.logoMedia.urlThumb || c.logoMedia.urlFull).startsWith('/images/') ? `${process.env.NEXT_PUBLIC_API_URL}${c.logoMedia.urlMini || c.logoMedia.urlThumb || c.logoMedia.urlFull}` : (c.logoMedia.urlMini || c.logoMedia.urlThumb || c.logoMedia.urlFull)}
                              alt=""
                              className="w-full h-full object-contain"
                              skeletonClassName="w-full h-full animate-pulse bg-gray-100"
                              fallback={<div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Logo</div>}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Logo</div>
                          )}
                        </div>
                        <span className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {c.groups && c.groups.map(({ group }) => (
                          <span key={group.groupId} className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                            {group.name}
                          </span>
                        ))}
                        {(!c.groups || c.groups.length === 0) && (
                          <span className="text-xs text-gray-400 italic">No groups</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded">{c.displayOrder}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openModal(c)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-all"><span className="material-icons text-2xl">edit</span></button>
                        <button onClick={() => handleDelete(c.clientId)} className="p-2 text-red-400 hover:bg-red-100 rounded-full transition-all"><span className="material-icons text-2xl">delete_outline</span></button>
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
      </div>

      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start md:items-center z-50 p-4 overflow-y-auto py-10 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 my-auto animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{editingClient ? 'Edit Client' : 'New Client'}</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Client Name</label>
                  <input name="name" required defaultValue={editingClient?.name} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" placeholder="Google" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Client Logo</label>
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
                    value={modalLogoMediaId || ''} 
                  />
                </div>

                {/* Group Selector System */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">กลุ่มลูกค้า (Client Groups)</label>
                  
                  {/* Selected Group Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedGroupIds.map(id => {
                      const group = allGroups.find(g => g.groupId === id);
                      if (!group) return null;
                      return (
                        <span key={id} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                          {group.name}
                          <button 
                            type="button" 
                            onClick={() => setSelectedGroupIds(prev => prev.filter(gid => gid !== id))}
                            className="hover:text-blue-900 focus:outline-none flex items-center justify-center ml-1"
                          >
                            <span className="material-icons text-sm">close</span>
                          </button>
                        </span>
                      );
                    })}
                    {selectedGroupIds.length === 0 && (
                      <span className="text-xs text-gray-400 italic py-1">ยังไม่ได้เลือกกลุ่มลูกค้า</span>
                    )}
                  </div>

                  {/* Input search and suggestions dropdown */}
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="ค้นหาหรือพิมพ์ชื่อกลุ่มเพื่อเลือก..."
                      value={groupSearch}
                      onChange={(e) => {
                        setGroupSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    />
                    {showDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                          {allGroups
                            .filter(g => !selectedGroupIds.includes(g.groupId) && g.name.toLowerCase().includes(groupSearch.toLowerCase()))
                            .map(g => (
                              <button
                                key={g.groupId}
                                type="button"
                                onClick={() => {
                                  setSelectedGroupIds(prev => [...prev, g.groupId]);
                                  setGroupSearch("");
                                  setShowDropdown(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm text-gray-700 transition-colors border-b border-gray-50 last:border-0"
                              >
                                {g.name}
                              </button>
                            ))}
                          {allGroups.filter(g => !selectedGroupIds.includes(g.groupId) && g.name.toLowerCase().includes(groupSearch.toLowerCase())).length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-400 italic">ไม่พบกลุ่มที่สามารถเลือกได้</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Display Order</label>
                  <input name="displayOrder" type="number" defaultValue={editingClient?.displayOrder || 0} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-[2] py-3 bg-[#007bff] text-white rounded-xl font-bold hover:bg-[#0069d9] transition-all shadow-lg active:scale-95">Save Client</button>
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
    </>
  );
}
