"use client";

import React, { useState, useEffect } from "react";

interface Category {
  categoryId: number;
  name: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?page=${page}&limit=10`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data);
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
    fetchCategories(currentPage);
  }, [currentPage]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCategory ? 'PATCH' : 'POST';
    const url = editingCategory 
      ? `${process.env.NEXT_PUBLIC_API_URL}/categories/${editingCategory.categoryId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/categories`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
        credentials: 'include'
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingCategory(null);
        setNewName("");
        fetchCategories(currentPage);
      }
    } catch (err) {
      alert('Error saving category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) fetchCategories(currentPage);
    } catch (err) {
      alert('Error deleting category');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && categories.length === 0) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="material-icons text-blue-600 text-4xl">category</span>
            Category Management
          </h2>
          <p className="text-gray-500 mt-1">Organize your content with paginated categories.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingCategory(null); setNewName(""); }}
          className="bg-[#007bff] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0069d9] transition-all shadow-md flex items-center gap-2 active:scale-95"
        >
          <span className="material-icons">add</span>
          New Category
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-gray-400">search</span>
          <input 
            type="text"
            placeholder="Search current page categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase w-24">ID</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase">Category Name</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCategories.map((cat) => (
                <tr key={cat.categoryId} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5 text-sm text-gray-400">#{cat.categoryId}</td>
                  <td className="px-6 py-5">
                    <span className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => { setEditingCategory(cat); setNewName(cat.name); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-all"><span className="material-icons text-2xl">edit</span></button>
                      <button onClick={() => handleDelete(cat.categoryId)} className="p-2 text-red-400 hover:bg-red-100 rounded-full transition-all"><span className="material-icons text-2xl">delete_outline</span></button>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Category Name</label>
                <input autoFocus required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-[2] py-3 bg-[#007bff] text-white rounded-xl font-bold hover:bg-[#0069d9] transition-all shadow-lg active:scale-95">{editingCategory ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
