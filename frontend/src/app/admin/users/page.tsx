"use client";

import React, { useState, useEffect } from "react";

interface User {
  uid: number;
  username: string;
  email: string;
  role: string;
}

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    uid: 0,
    username: "",
    email: "",
    password: "",
    role: "employee",
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (uid: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${uid}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setUsers(users.filter(u => u.uid !== uid));
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setFormData({
        uid: user.uid,
        username: user.username,
        email: user.email,
        password: "",
        role: user.role,
      });
      setIsEditing(true);
    } else {
      setFormData({
        uid: 0,
        username: "",
        email: "",
        password: "",
        role: "employee",
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing 
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/${formData.uid}`
      : `${process.env.NEXT_PUBLIC_API_URL}/users`;
    
    const method = isEditing ? 'PUT' : 'POST';
    
    // For editing, only send changed fields or password if provided
    const body = isEditing 
      ? { email: formData.email, role: formData.role, password: formData.password || undefined }
      : { username: formData.username, email: formData.email, password: formData.password, role: formData.role };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });
      if (response.ok) {
        fetchUsers();
        setIsModalOpen(false);
      } else {
        const err = await response.json();
        alert(err.message || 'Operation failed');
      }
    } catch (err) {
      alert('Something went wrong');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading users...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
        >
          <span className="material-icons text-lg">arrow_back</span>
          Back
        </button>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#1b8a53] hover:bg-[#156d41] text-white px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-green-900/20 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="material-icons text-lg">person_add</span>
          Create User
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="material-icons text-[#1b8a53]">group</span>
          Users Management
        </h2>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fefaf0] border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">UID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Information</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-40">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-64">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user, index) => (
                <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">#{user.uid}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700">{user.username}</span>
                      <span className="text-xs text-gray-400">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openModal(user)}
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors group" title="Edit User">
                        <span className="material-icons text-xl">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(user.uid)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                        <span className="material-icons text-xl">delete_outline</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Beautiful Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#1b8a53] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-icons">{isEditing ? 'edit' : 'person_add'}</span>
                {isEditing ? 'Edit User' : 'Create New User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {!isEditing && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-300 text-lg">person</span>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1b8a53] focus:bg-white outline-none transition-all text-gray-700"
                      placeholder="e.g. jdoe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-300 text-lg">mail</span>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1b8a53] focus:bg-white outline-none transition-all text-gray-700"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {isEditing ? 'New Password (Optional)' : 'Password'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-300 text-lg">lock</span>
                  <input
                    type="password"
                    required={!isEditing}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1b8a53] focus:bg-white outline-none transition-all text-gray-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">User Role</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-300 text-lg">verified_user</span>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1b8a53] focus:bg-white outline-none transition-all text-gray-700 appearance-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-[#1b8a53] text-white font-bold py-3 rounded-xl hover:bg-[#156d41] transition-all shadow-lg shadow-green-900/10"
                >
                  {isEditing ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
