"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./admin.css";

const sidebarItems = [
  { id: "posts", icon: "article", label: "Posts", link: "/admin/posts" },
  { id: "tickets", icon: "mail", label: "กล่องข้อความ", link: "/admin/tickets", adminOnly: true },
  { id: "partners", icon: "handshake", label: "Partners", link: "/admin/partners" },
  { id: "clients", icon: "business", label: "ลูกค้า", link: "/admin/clients" },
  { id: "client-groups", icon: "sell", label: "กลุ่มลูกค้า", link: "/admin/client-groups" },
  { id: "users", icon: "person", label: "Users", link: "/admin/users", adminOnly: true },
  { id: "settings", icon: "settings", label: "Settings", link: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [authError, setAuthError] = useState<"UNAUTHORIZED" | "FORBIDDEN" | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const localUser = localStorage.getItem("user");
      if (!localUser) {
        setAuthError("UNAUTHORIZED");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        const profile = await response.json();
        setUser(profile);
      } catch (err) {
        localStorage.removeItem("user");
        setAuthError("UNAUTHORIZED");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Path authorization check
  useEffect(() => {
    if (loading || authError === "UNAUTHORIZED") return;

    if (!user) {
      setAuthError("UNAUTHORIZED");
      return;
    }

    const isAdminOnly = pathname.startsWith("/admin/users") || pathname.startsWith("/admin/tickets");
    
    if (isAdminOnly && user.role !== "admin") {
      setAuthError("FORBIDDEN");
    } else {
      setAuthError(null);
    }
  }, [pathname, user, loading]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: 'include'
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-slate-500 font-medium">Checking authentication...</div>
      </div>
    );
  }

  if (authError === "UNAUTHORIZED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 text-center">
        <div className="max-w-md w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-icons text-3xl">lock</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            You must be logged in to access the admin panel. Please sign in with your administrator or employee credentials.
          </p>
          <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-98 text-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (authError === "FORBIDDEN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 text-center">
        <div className="max-w-md w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-icons text-3xl">gpp_maybe</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Permission Denied</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Your account ({user?.username}) does not have permission to access this section. This page is reserved for system administrators only.
          </p>
          <Link href="/admin/posts" className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all active:scale-98 text-center">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
          {sidebarItems
            .filter(item => !item.adminOnly || (user && user.role === "admin"))
            .map((item) => {
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-left"
          >
            <span className="material-icons text-[20px]">logout</span>
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
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
              <span className="text-xs font-bold text-slate-800">{user?.username || 'Account'}</span>
              <span className="text-[10px] text-green-500 font-medium capitalize">{user?.role || 'Online'}</span>
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
