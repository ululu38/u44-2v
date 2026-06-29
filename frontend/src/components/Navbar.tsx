"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";


const menuItems = [
  { id: 'PRODUCT', icon: 'developer_mode', label: 'SOLUTION', link: '/solution' },
  { id: 'PROJECT', icon: 'share', label: 'PROJECT', link: '/project' },
  { id: 'CONTACT', icon: 'email', label: 'CONTACT US', link: '/contactus' },
  { id: 'ARTICLE', icon: 'article', label: 'ARTICLE', link: '/article' },
  { id: 'ABOUT', icon: 'info', label: 'ABOUT US', link: '/aboutus' }
];

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedRec, setSelectedRec] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    console.log("[Search Debug] Query changed:", query);
    if (query.trim().length < 1) {
      console.log("[Search Debug] Query too short, clearing recommendations.");
      setRecommendations([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      const api = process.env.NEXT_PUBLIC_API_URL;
      console.log("[Search Debug] Fetching recommendations from:", `${api}/posts?page=1&limit=5&q=${query}&fields=postId,title,slug,createdAt,thumbnailMedia&thumbSize=mini`);
      fetch(`${api}/posts?page=1&limit=5&q=${encodeURIComponent(query)}&fields=postId,title,slug,createdAt,thumbnailMedia&thumbSize=mini`)
        .then((r) => r.json())
        .then((d) => {
          console.log("[Search Debug] Recommendations loaded successfully:", d.data);
          setRecommendations(d.data || []);
        })
        .catch((err) => {
          console.error("[Search Debug] Fetch recommendations failed:", err);
        });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      console.log("[Search Debug] Click detected on element:", target);
      if (!target.closest(".search-container")) {
        console.log("[Search Debug] Clicked outside .search-container, closing dropdown.");
        setShowRecommendations(false);
      } else {
        console.log("[Search Debug] Clicked inside .search-container, keeping dropdown state.");
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => { setSelectedRec(-1); }, [recommendations]);

  useEffect(() => {
    if (selectedRec >= 0) {
      const el = document.querySelector(`[data-index="${selectedRec}"]`) as HTMLElement | null;
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedRec]);

  return (
    <>
      <nav className={`nav44 d-flex align-items-center justify-content-between px-4 fixed-top ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <Link href="/">
            <Image 
              src="/images/U44-icon-133x123.png" 
              alt="U FORTY FOUR TECHNOLOGY SOLUTIONS CO., LTD." 
              width={70} 
              height={70}
              priority
            />
          </Link>
        </div>
        
        <ul className="nav justify-content-center flex-grow-1 d-none d-lg-flex">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <Link href={item.link} className="nav-link" prefetch={false}>
                <span className="material-icons">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="d-flex align-items-center">
          <div className="search-container me-3 d-none d-lg-block" style={{ position: "relative" }}>
            <input 
              className="form-control" 
              type="text" 
              placeholder="Search..." 
              id="searchInput" 
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowRecommendations(true);
              }}
              ref={inputRef}
              onFocus={() => setShowRecommendations(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedRec((s) => Math.min(s + 1, recommendations.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedRec((s) => Math.max(s - 1, -1));
                } else if (e.key === "Enter") {
                  if (selectedRec >= 0 && recommendations[selectedRec]) {
                    const p = recommendations[selectedRec];
                    setShowRecommendations(false);
                    router.push(`/posts/${p.slug || p.postId}`);
                  } else {
                    setShowRecommendations(false);
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                  }
                }
              }}
            />
            <span 
              className="icon material-icons-outlined"
              onClick={() => {
                setShowRecommendations(false);
                router.push(`/search?q=${encodeURIComponent(query)}`);
              }}
            >
              search
            </span>

            {/* Recommendations Dropdown */}
            {showRecommendations && recommendations.length > 0 && (
              <div 
                className="position-absolute rounded-lg shadow-lg border mt-2 overflow-hidden" 
                style={{
                  top: "100%",
                  right: 0,
                  width: "360px",
                  zIndex: 9999,
                  background: "#1a1b22",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
                    Recommended Posts
                  </div>
                  {recommendations.map((post, idx) => {
                    const thumb = post.thumbnailMedia?.urlThumb || post.thumbnailMedia?.urlFull;
                    const fullThumb = thumb ? (thumb.startsWith("http") ? thumb : `${process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8080'}${thumb}`) : null;
                    return (
                      <Link 
                        key={post.postId} 
                        href={`/posts/${post.slug || post.postId}`}
                        onClick={() => setShowRecommendations(false)}
                        data-index={idx}
                        className={`d-flex align-items-center gap-3 px-3 py-2 text-decoration-none hover-bg-custom ${selectedRec === idx ? 'bg-selected-recommend' : ''}`}
                        style={{ transition: "background 0.2s" }}
                        onMouseEnter={() => setSelectedRec(idx)}
                        onMouseLeave={() => setSelectedRec(-1)}
                      >
                        <div className="flex-shrink-0 rounded overflow-hidden bg-white/5" style={{ width: 44, height: 44 }}>
                          {fullThumb ? (
                            <img src={fullThumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full d-flex align-items-center justify-center text-gray-600">
                              <span className="material-icons text-lg">image</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <div className="text-white text-xs font-bold text-truncate leading-tight mb-1" style={{ maxWidth: "270px" }}>
                            {post.title}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                      </Link>
                    );
                    })}
                </div>
              </div>
            )}
          </div>
          <Link href="/contactus" className="btn btn-gold">Contact us</Link>
        </div>

        <button 
          className="hamburger d-lg-none" 
          id="hamburgerBtn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-icons">menu</span>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu d-lg-none ${isMobileMenuOpen ? 'active' : ''}`} id="mobileMenu">
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <div className="search-container" style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", width: "100%" }}>
                <input 
                  className="form-control" 
                  type="text" 
                  placeholder="Search..." 
                  value={query}
                  style={{ width: "100%", paddingRight: "35px", background: "#f5f5f5", color: "#333", border: "1px solid #ddd", borderRadius: "20px", paddingLeft: "15px", paddingTop: "6px", paddingBottom: "6px" }}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowRecommendations(true);
                  }}
                  onFocus={() => setShowRecommendations(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsMobileMenuOpen(false);
                      setShowRecommendations(false);
                      router.push(`/search?q=${encodeURIComponent(query)}`);
                    }
                  }}
                />
                <span 
                  className="icon material-icons-outlined" 
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowRecommendations(false);
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                  }}
                >
                  search
                </span>
              </div>

              {/* Mobile Recommendations Dropdown */}
              {showRecommendations && recommendations.length > 0 && (
                <div 
                  className="mt-2 rounded-lg shadow-lg border overflow-hidden" 
                  style={{
                    width: "100%",
                    background: "#f9f9f9",
                    borderColor: "#ddd",
                  }}
                >
                  <div className="py-1">
                    {recommendations.map((post) => {
                      const thumb = post.thumbnailMedia?.urlThumb || post.thumbnailMedia?.urlFull;
                      const fullThumb = thumb ? (thumb.startsWith("http") ? thumb : `${process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8080'}${thumb}`) : null;
                      return (
                        <Link 
                          key={post.postId} 
                          href={`/posts/${post.slug || post.postId}`}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setShowRecommendations(false);
                          }}
                          className="d-flex align-items-center gap-3 px-3 py-2 text-decoration-none"
                          style={{ transition: "background 0.2s", borderBottom: "1px solid #eee", backgroundColor: "#fff" }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                        >
                          <div className="flex-shrink-0 rounded overflow-hidden bg-gray-100" style={{ width: 36, height: 36 }}>
                            {fullThumb ? (
                              <img src={fullThumb} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full d-flex align-items-center justify-center text-gray-400">
                                <span className="material-icons text-sm">image</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-grow">
                            <div className="text-dark text-xs font-bold text-truncate leading-tight mb-0.5" style={{ maxWidth: "120px" }}>
                              {post.title}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </li>
          <li className="nav-item">
            <Link href="/contactus" className="btn btn-gold w-100">Contact us</Link>
          </li>
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <Link href={item.link} className="nav-link" prefetch={false}>
                <span className="material-icons">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <style jsx global>{`
        .nav44 {
            position: fixed;
            top: 0;
            background: var(--nav-gradient);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            width: 100%;
            z-index: 1000;
            transition: all 0.4s ease;
        }

        .nav44.scrolled {
            background: var(--nav-scrolled);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .nav44 .logo img {
            height: 70px;
            padding: 5px;
            width: auto;
        }

        .nav44 .nav .nav-item .nav-link {
            color: white;
            display: flex;
            align-items: center;
            font-weight: 600;
            padding: 12px 18px;
            gap: 8px;
        }

        .nav44 .nav .nav-item .nav-link:hover {
            color: var(--accent);
            transform: scale(1.05);
        }

        .search-container {
            display: flex;
            align-items: center;
            position: relative;
        }

        .search-container input {
            padding-right: 35px;
            border-radius: 20px;
            background-color: #2a2a2c;
            border: 1px solid #444;
            color: white;
        }

        .search-container .icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #666;
        }

        .btn-gold {
            background-color: #ffd700 !important;
            color: #ffffff !important;
            font-weight: bold;
            padding: 8px 15px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            text-decoration: none;
            transition: all 0.3s ease;
        }


        .btn-gold:hover {
            background-color: var(--accent-hover);
        }

        .hamburger {
            color: white;
            background: none;
            border: none;
            cursor: pointer;
        }

        .mobile-menu {
            position: fixed;
            top: 80px;
            right: 15px;
            background: #fff;
            width: 200px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 15px;
            border-radius: 8px;
            z-index: 1000;
            transform: translateX(120%);
            transition: all 0.3s ease-in-out;
            visibility: hidden;
            opacity: 0;
        }

        .mobile-menu.active {
            transform: translateX(0);
            visibility: visible;
            opacity: 1;
        }

        .mobile-menu .nav-link {
            color: #0d6efd !important;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 0;
        }
        .hover-bg-custom:hover {
            background-color: rgba(255, 255, 255, 0.06) !important;
        }
        .bg-selected-recommend {
            background: rgba(59,130,246,0.14) !important;
        }
      `}</style>
    </>
  );
}
