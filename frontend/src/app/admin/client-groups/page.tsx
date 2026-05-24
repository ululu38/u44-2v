"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ClientGroup {
  groupId: number;
  name: string;
  displayOrder: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ClientGroupsPage() {
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ClientGroup | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = (group: ClientGroup | null) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const fetchGroups = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client-groups?page=${page}&limit=20`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setGroups(result.data);
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
    fetchGroups(currentPage);
  }, [currentPage]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    if (data.displayOrder) data.displayOrder = parseInt(data.displayOrder as string);

    const method = editingGroup ? 'PATCH' : 'POST';
    const url = editingGroup 
      ? `${process.env.NEXT_PUBLIC_API_URL}/client-groups/${editingGroup.groupId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/client-groups`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingGroup(null);
        fetchGroups(currentPage);
      }
    } catch (err) {
      alert('Error saving client group');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client-groups/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) fetchGroups(currentPage);
    } catch (err) {
      alert('Error deleting client group');
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && groups.length === 0) return <div className="p-8 text-center text-gray-500">Loading client groups...</div>;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="material-icons text-blue-600 text-4xl">sell</span>
              Client Group Management
            </h2>
            <p className="text-gray-500 mt-1">Manage tag groups for grouping clients.</p>
          </div>
          <button 
            onClick={() => openModal(null)}
            className="bg-[#007bff] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0069d9] transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <span className="material-icons">add</span>
            New Group
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-gray-400">search</span>
            <input 
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase">Group Name</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase text-center">Display Order</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredGroups.map((g) => (
                  <tr key={g.groupId} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
                        {g.name}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded">{g.displayOrder}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openModal(g)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-all"><span className="material-icons text-2xl">edit</span></button>
                        <button onClick={() => handleDelete(g.groupId)} className="p-2 text-red-400 hover:bg-red-100 rounded-full transition-all"><span className="material-icons text-2xl">delete_outline</span></button>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 my-auto animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{editingGroup ? 'Edit Client Group' : 'New Client Group'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Group Name</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editingGroup?.name} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                  placeholder="e.g. VIP, Corporate"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Display Order</label>
                <input 
                  name="displayOrder" 
                  type="number" 
                  defaultValue={editingGroup?.displayOrder || 0} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                />
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-[2] py-3 bg-[#007bff] text-white rounded-xl font-bold hover:bg-[#0069d9] transition-all shadow-lg active:scale-95">Save Group</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
