"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface Ticket {
  id: number;
  ticketId: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [mounted, setMounted] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const fetchTickets = useCallback(async (page = 1, reset = false) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets?filter=${filter}&page=${page}&limit=20`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (page === 1 || reset) setTickets(result.data || []);
      else setTickets((prev) => [...prev, ...(result.data || [])]);
      setMeta(result.meta);
      setCurrentPage(result.meta.page);
    } catch {
      console.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTickets(1, true); }, [filter]);

  // Infinite scroll
  useEffect(() => {
    if (!meta || currentPage >= meta.totalPages || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchTickets(currentPage + 1);
    }, { threshold: 0.1 });
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [meta, currentPage, loading]);

  const openTicket = async (ticket: Ticket) => {
    setSelected(ticket);
    // Mark as read if unread
    if (!ticket.isRead) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticket.id}/read`, {
          method: "PUT",
          credentials: "include",
        });
        setTickets((prev) => prev.map((t) => t.id === ticket.id ? { ...t, isRead: true } : t));
        setSelected({ ...ticket, isRead: true });
        if (meta) setMeta({ ...meta, unreadCount: Math.max(0, meta.unreadCount - 1) });
      } catch { /* silent */ }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ลบข้อความนี้ใช่ไหม?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setTickets((prev) => prev.filter((t) => t.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      alert("ลบไม่สำเร็จ");
    }
  };

  const filterTabs = [
    { key: "all",    label: "ทั้งหมด",    count: meta?.total ?? 0 },
    { key: "unread", label: "ยังไม่อ่าน", count: meta?.unreadCount ?? 0 },
    { key: "read",   label: "อ่านแล้ว",   count: null },
  ] as const;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
              <span className="material-icons text-white text-xl">mail</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800">กล่องข้อความ</h1>
              <p className="text-xs text-gray-400">ข้อความที่ส่งมาจากหน้าเว็บ</p>
            </div>
          </div>
          {(meta?.unreadCount ?? 0) > 0 && (
            <div className="flex items-center gap-2 bg-red-50 text-red-500 border border-red-100 px-3 py-1.5 rounded-full text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {meta!.unreadCount} ใหม่
            </div>
          )}
        </div>

        {/* Inbox Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Filter Tabs */}
          <div className="flex gap-1 p-3 border-b border-gray-100 bg-gray-50/60">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === tab.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] text-center ${
                    tab.key === "unread" && filter !== "unread"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="divide-y divide-gray-50">
            {loading && tickets.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span className="text-sm">กำลังโหลด...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-3 text-gray-300">
                <span className="material-icons text-5xl">inbox</span>
                <span className="text-sm font-medium text-gray-400">ไม่มีข้อความ</span>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => openTicket(ticket)}
                  className={`flex items-start gap-4 px-6 py-4 cursor-pointer hover:bg-blue-50/30 transition-colors group ${
                    !ticket.isRead ? "bg-blue-50/20" : ""
                  }`}
                >
                  {/* Unread dot */}
                  <div className="pt-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${!ticket.isRead ? "bg-blue-500" : "bg-transparent"}`} />
                  </div>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                    !ticket.isRead
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {ticket.name[0]?.toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${!ticket.isRead ? "font-black text-gray-900" : "font-semibold text-gray-600"}`}>
                        {ticket.name}
                      </span>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {new Date(ticket.createdAt).toLocaleDateString("th-TH", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${!ticket.isRead ? "font-bold text-gray-700" : "text-gray-500"}`}>
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{ticket.message}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(ticket.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all shrink-0"
                    title="ลบ"
                  >
                    <span className="material-icons text-lg">delete_outline</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Load more sentinel */}
          <div ref={observerTarget} className="py-3 flex justify-center min-h-[44px]">
            {loading && tickets.length > 0 && (
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            )}
            {!loading && meta && currentPage >= meta.totalPages && tickets.length > 0 && (
              <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">
                ทั้งหมด {meta.total} รายการ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selected && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeDetail}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <span className="material-icons text-blue-500 shrink-0">mail</span>
                <span className="font-black text-gray-800 text-sm truncate" title={selected.subject}>
                  {selected.subject.length > 100 ? selected.subject.substring(0, 100) : selected.subject}
                </span>
              </div>
              <button
                onClick={closeDetail}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors shrink-0"
              >
                <span className="material-icons text-lg">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
              {/* Sender Info */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-md shadow-blue-200 shrink-0">
                  {selected.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-gray-800 truncate">{selected.name}</p>
                  <p className="text-sm text-gray-400 truncate">{selected.email}</p>
                  <p className="text-sm text-gray-400 truncate">{selected.phone}</p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words border border-gray-100 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {selected.message}
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-400">
                  {new Date(selected.createdAt).toLocaleString("th-TH")}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    selected.isRead
                      ? "bg-green-50 text-green-600"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                    {selected.isRead ? "อ่านแล้ว" : "ยังไม่อ่าน"}
                  </span>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-bold"
                  >
                    <span className="material-icons text-sm">delete_outline</span>
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );

  function closeDetail() { setSelected(null); }
}
