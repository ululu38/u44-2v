"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./admin.css";

const sidebarItems = [
  { id: "posts", icon: "article", label: "Posts", link: "/admin/posts" },
  { id: "tickets", icon: "mail", label: "กล่องข้อความ", link: "/admin/tickets" },
  { id: "partners", icon: "handshake", label: "Partners", link: "/admin/partners" },
  { id: "users", icon: "person", label: "Users", link: "/admin/users" },
  { id: "settings", icon: "settings", label: "Settings", link: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-[#1e293b] transition-all duration-300 flex flex-col h-full z-40 shadow-xl`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="material-icons text-white text-sm">shield</span>
            </div>
            {isSidebarOpen && (
              <span className="text-white font-bold tracking-tight text-lg">U44 ADMIN</span>
            )}
          </div>
        </div>

        <nav className="flex-grow py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="px-4 mb-4">
             {isSidebarOpen && <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2 mb-2">Main Menu</p>}
          </div>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.link;
            return (
              <Link
                key={item.id}
                href={item.link}
                className={`flex items-center gap-4 mx-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className={`material-icons text-[20px] ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <Link
            href="/admin/login"
            className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <span className="material-icons text-[20px]">logout</span>
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <span className="material-icons">menu_open</span>
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Pages</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold capitalize">
                {pathname?.split('/').pop() || 'Dashboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-800">Admin Account</span>
              <span className="text-[10px] text-green-500 font-medium">Online</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
               <span className="material-icons text-slate-400">person</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-[#f8fafc]">
          <div className="animate-fade-in max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>


      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #34495e;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4e6a8e;
        }
      `}</style>
    </div>
  );
}
