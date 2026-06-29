"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const sidebarItems = [
  { id: "posts", icon: "article", label: "Posts", link: "/admin/posts" },
  { id: "tickets", icon: "mail", label: "กล่องข้อความ", link: "/admin/tickets" },
  { id: "partners", icon: "handshake", label: "Partners", link: "/admin/partners" },
  { id: "clients", icon: "business", label: "ลูกค้า", link: "/admin/clients" },
  { id: "client-groups", icon: "sell", label: "กลุ่มลูกค้า", link: "/admin/client-groups" },
  { id: "banners", icon: "view_carousel", label: "แบนเนอร์", link: "/admin/banner" },
  { id: "users", icon: "person", label: "Users", link: "/admin/users", adminOnly: true },
  { id: "swagger", icon: "api", label: "API Docs", link: `${process.env.NEXT_PUBLIC_API_URL}/api`, adminOnly: true, isExternal: true },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
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

  // Handle responsive sidebar
  useEffect(() => {
    let prevWidth = window.innerWidth;

    const handleResize = () => {
      const width = window.innerWidth;
      
      setIsMobile(width <= 500);

      const wasDesktop = prevWidth > 1024;
      const isDesktop = width > 1024;
      const wasTablet = prevWidth > 500 && prevWidth <= 1024;
      const isTablet = width > 500 && width <= 1024;
      const wasMobile = prevWidth <= 500;
      const isCurrentMobile = width <= 500;

      if (isDesktop && !wasDesktop) {
        setIsSidebarOpen(true);
      } else if (isTablet && !wasTablet) {
        setIsSidebarOpen(false);
      } else if (isCurrentMobile && !wasMobile) {
        setIsSidebarOpen(false);
      }

      prevWidth = width;
    };

    const initialWidth = window.innerWidth;
    setIsMobile(initialWidth <= 500);
    if (initialWidth <= 1024) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Path authorization check
  useEffect(() => {
    if (loading || authError === "UNAUTHORIZED") return;

    if (!user) {
      setAuthError("UNAUTHORIZED");
      return;
    }

    const isAdminOnly = pathname.startsWith("/admin/users");
    
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
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${
            isMobile
              ? `fixed top-0 left-0 h-full z-50 w-64 transform ${
                  isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : `${isSidebarOpen ? "w-64" : "w-20"} relative z-40`
          }
          bg-[#1e293b] transition-all duration-300 flex flex-col h-full shadow-xl shrink-0
        `}
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
              
              if (item.isExternal) {
                return (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-4 mx-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-white`}
                  >
                    <span className={`material-icons text-[20px] text-slate-500 group-hover:text-blue-400`}>
                      {item.icon}
                    </span>
                    {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                    {isSidebarOpen && <span className="material-icons text-[14px] ml-auto opacity-50">open_in_new</span>}
                  </a>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => {
                    if (isMobile) setIsSidebarOpen(false);
                  }}
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-30">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <span className="material-icons">menu_open</span>
            </button>
            <div className="flex items-center gap-0.5 flex-wrap text-xs sm:text-sm font-mono select-all">
              {pathname
                ?.split("/")
                .filter(Boolean)
                .map((seg, idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  return (
                    <React.Fragment key={idx}>
                      <span className="text-slate-300">/</span>
                      <span 
                        className={`${isLast ? "font-bold text-blue-600" : "text-slate-500"} truncate max-w-[120px] sm:max-w-[240px] inline-block align-bottom`}
                        title={seg}
                      >
                        {seg}
                      </span>
                    </React.Fragment>
                  );
                })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-800">{user?.username || 'Account'}</span>
              <span className="text-[10px] text-green-500 font-medium capitalize">{user?.role || 'Online'}</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
               <span className="material-icons text-slate-400 text-sm sm:text-base">person</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow overflow-y-auto px-0 py-4 sm:p-8 custom-scrollbar bg-[#f8fafc]">
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
