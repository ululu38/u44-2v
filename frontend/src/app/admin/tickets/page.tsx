"use client";

import React, { useState, useEffect } from "react";

interface Ticket {
  id: number;
  ticketId: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  jobTitle: string;
  status: string;
  createdAt: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (response.ok) {
        fetchTickets();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setTickets(tickets.filter(t => t.id !== id));
      }
    } catch (err) {
      alert('Failed to delete ticket');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading tickets...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
        >
          <span className="material-icons text-lg">arrow_back</span>
          Back
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="material-icons text-[#1b8a53]">assignment</span>
          Ticket Management
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fefaf0] border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID / Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Job Interest</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700">#{ticket.ticketId}</span>
                      <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700">{ticket.firstname} {ticket.lastname}</span>
                      <span className="text-xs text-gray-400">{ticket.email}</span>
                      <span className="text-xs text-gray-400">{ticket.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{ticket.jobTitle}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ticket.status === 'completed' ? 'bg-green-50 text-green-600' : 
                      ticket.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => updateStatus(ticket.id, 'completed')}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Mark as Completed">
                        <span className="material-icons text-xl">check_circle</span>
                      </button>
                      <button 
                        onClick={() => updateStatus(ticket.id, 'pending')}
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Set to Pending">
                        <span className="material-icons text-xl">history</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(ticket.id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete Ticket">
                        <span className="material-icons text-xl">delete_outline</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">No tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
