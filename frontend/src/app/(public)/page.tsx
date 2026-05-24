"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const SOLUTION_TAG = "Solution";
const PROJECT_TAG  = "Project";
const NEWS_TAG     = "News";
const MOVEMENT_TAG = "Movement";

interface Post {
  postId:          number;
  title:           string;
  slug:            string;
  content:         string;
  tags:            string[] | null;
  thumbnailMedia?: { urlThumb?: string; urlFull?: string; urlMini?: string } | null;
  createdAt:       string;
}

function imgUrl(p?: string | null) {
  if (!p) return null;
  return p.startsWith("http") ? p : `${API}${p}`;
}

function formatDate(s?: string | null) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}

// ─────────────────────────────────────────────────────────────────────
// 1. HERO SWIPER  (rounded bottom, dark gradient — ตรงกับ u44herobg)
// ─────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    image:       "/images/Hero_1.jpg",
    tag:         "SMART KIOSK",
    title:       "นวัตกรรมระบบตู้คีออสก์อัจฉริยะ",
    titleEn:     "Smart Kiosk & Self-Service Solutions",
    description: "ออกแบบ ติดตั้ง และดูแลระบบตู้บริการอัตโนมัติแบบครบวงจร รองรับทุก Platform",
    cta:         "/solution",
    ctaLabel:    "ดูบริการของเรา",
  },
  {
    image:       "/images/Hero_2.png",
    tag:         "DIGITAL SIGNAGE",
    title:       "ระบบป้ายดิจิทัลและ Video Wall",
    titleEn:     "Digital Signage & LED Display",
    description: "จำหน่าย ออกแบบ และติดตั้ง Digital Signage Solutions — จอ LED, Video Wall, ป้ายโฆษณา In/Out door",
    cta:         "/solution",
    ctaLabel:    "เรียนรู้เพิ่มเติม",
  },
  {
    image:       "/images/pexels-cookiecutter-1148820.png",
    tag:         "IT INFRASTRUCTURE",
    title:       "โครงสร้างพื้นฐาน IT ระดับองค์กร",
    titleEn:     "Enterprise IT Infrastructure",
    description: "ออกแบบและวางระบบ Network, Server, CCTV และ Unified Communication สำหรับองค์กรทุกขนาด",
    cta:         "/project",
    ctaLabel:    "ดูผลงานของเรา",
  },
];

function MainHero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden -mt-[80px]"
      style={{ height: "calc(100vh - 0px)", minHeight: 560, maxHeight: 760 }}
    >
      {/* Slides */}
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 10 : 0 }}
        >
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.88) 100%)",
            zIndex: 1,
          }} />
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center" style={{ zIndex: 2, paddingTop: 80 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", width: "100%" }}>
              <span style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#e0e0e0",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.2em",
                padding: "4px 14px",
                borderRadius: 20,
                marginBottom: 20,
              }}>
                {slide.tag}
              </span>
              <h1 style={{
                fontSize: "clamp(2rem, 5vw, 3.8rem)",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.15,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
                maxWidth: 640,
              }}>
                {slide.titleEn}
              </h1>
              <p style={{
                fontSize: "clamp(1rem, 2vw, 1.25rem)",
                color: "#e0e0e0",
                fontWeight: 700,
                marginBottom: 8,
                maxWidth: 600,
              }}>
                {slide.title}
              </p>
              <p style={{
                color: "#999",
                fontSize: 14,
                maxWidth: 520,
                lineHeight: 1.7,
                marginBottom: 36,
              }}>
                {slide.description}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href={slide.cta} style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  background: "#333",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 6,
                  textDecoration: "none",
                  border: "1px solid #555",
                  fontSize: 14,
                  transition: "all .25s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#444"; (e.currentTarget as HTMLElement).style.borderColor = "#888"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#333"; (e.currentTarget as HTMLElement).style.borderColor = "#555"; }}
                >
                  {slide.ctaLabel}
                  <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
                </Link>
                <Link href="/contactus" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  background: "rgba(255,255,255,0.06)",
                  color: "#ccc",
                  fontWeight: 700,
                  borderRadius: 6,
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: 14,
                  transition: "all .25s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
                >
                  ติดต่อเรา
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 20 }}>
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 28 : 8,
            height: 8,
            borderRadius: 4,
            background: i === idx ? "#fff" : "rgba(255,255,255,0.3)",
            border: "none",
            cursor: "pointer",
            transition: "all .3s",
            padding: 0,
          }} />
        ))}
      </div>

      {/* Rounded bottom fade */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: "linear-gradient(to bottom, transparent, #0d0d0d)",
        zIndex: 15,
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 2. SOLUTIONS SWIPER
// ─────────────────────────────────────────────────────────────────────
function SolutionsSwiper() {
  const [posts, setPosts] = useState<Post[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    fetch(`${API}/posts?page=1&limit=8&tag=${SOLUTION_TAG}&status=1`)
      .then(r => r.json()).then(d => setPosts(d.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fn = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 900) setVisibleCount(2);
      else setVisibleCount(3);
    };
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const max = Math.max(0, posts.length - visibleCount);

  useEffect(() => {
    if (max <= 0) return;
    const id = setInterval(() => setIdx(p => p >= max ? 0 : p + 1), 4500);
    return () => clearInterval(id);
  }, [max]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !el.children[0]) return;
    const cardW = (el.children[0] as HTMLElement).getBoundingClientRect().width;
    el.style.transform = `translateX(-${idx * (cardW + 20)}px)`;
  }, [idx, posts]);

  if (!posts.length) return null;

  return (
    <section style={{ padding: "80px 0 80px", background: "#0d0d0d", borderBottom: "1px solid #222", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>Key Offerings</span>
            <h2 style={{ color: "#e0e0e0", fontSize: 36, fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>Our Solutions</h2>
            <div style={{ width: 36, height: 2, background: "#444", marginTop: 12, borderRadius: 2 }} />
          </div>
          <Link href="/solution" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 18px",
            border: "1px solid #2a2a2a",
            borderRadius: 6,
            color: "#888", fontSize: 12, fontWeight: 600, textDecoration: "none",
            background: "#111",
            transition: "all .2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#444"; (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLElement).style.color = "#888"; }}
          >
            View All <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div ref={trackRef} style={{ display: "flex", gap: 24, transition: "transform .7s ease-out", willChange: "transform" }}>
            {posts.map(post => {
              const thumb = imgUrl(post.thumbnailMedia?.urlThumb ?? post.thumbnailMedia?.urlFull);
              return (
                <Link
                  key={post.postId}
                  href={`/posts/${post.slug || post.postId}`}
                  style={{ flexShrink: 0, width: "calc(33.33% - 16px)", display: "block", textDecoration: "none" }}
                >
                  <div style={{ position: "relative", width: "100%", paddingBottom: "62%", borderRadius: 6, overflow: "hidden", background: "#1a1a1a", border: "1px solid #4b5563", transition: "all .35s", transform: "translateZ(0)", willChange: "transform" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px) translateZ(0)"; (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.6)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateZ(0)"; (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                  >
                    <div style={{ position: "absolute", inset: 0 }}>
                      {thumb ? (
                        <img src={thumb} alt={post.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s ease" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.07)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = ""; }}
                        />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a", color: "#444" }}>
                          <span className="material-icons" style={{ fontSize: 56 }}>image</span>
                        </div>
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 18px", zIndex: 2 }}>
                        <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 12px", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", letterSpacing: "-0.01em" }}>
                          {post.title}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#777", fontSize: 11, fontWeight: 500 }}>{formatDate(post.createdAt)}</span>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#ddd" }}>arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        {max > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 28 }}>
            {[...Array(max + 1)].map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 28 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === idx ? "#888" : "rgba(255,255,255,0.15)",
                cursor: "pointer",
                transition: "all .3s",
                padding: 0,
              }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 3. PRODUCT & SOLUTIONS TABS
// ─────────────────────────────────────────────────────────────────────
const PRODUCT_TABS = [
  { icon: "queue_play_next", label: "Smart Kiosk" },
  { icon: "tv",             label: "Digital Signage" },
  { icon: "camera_alt",     label: "CCTV" },
  { icon: "router",         label: "Network & IT" },
];

function ProductSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState(PRODUCT_TABS[0].label);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/posts?page=1&limit=4&tag=${SOLUTION_TAG}&q=${encodeURIComponent(activeTab)}&status=1`)
      .then(r => r.json()).then(d => setPosts(d.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <section style={{ padding: "80px 0", background: "#111", borderBottom: "1px solid #222" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>Tailored Integration</span>
            <h2 style={{ color: "#e0e0e0", fontSize: 36, fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>Product &amp; Solutions</h2>
            <div style={{ width: 36, height: 2, background: "#444", marginTop: 12, borderRadius: 2 }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-start", marginBottom: 36, flexWrap: "wrap" }}>
          {PRODUCT_TABS.map(tab => {
            const active = activeTab === tab.label;
            return (
              <button key={tab.label} onClick={() => setActiveTab(tab.label)} style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                borderRadius: 6,
                border: active ? "1px solid #555" : "1px solid #2a2a2a",
                background: active ? "#2a2a2a" : "#1a1a1a",
                color: active ? "#e0e0e0" : "#666",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
                transition: "all .2s",
              }}>
                <span className="material-icons" style={{ fontSize: 16 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
          <Link href="/solution" style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "9px 18px", borderRadius: 6, border: "1px solid transparent",
            background: "transparent", color: "#666",
            fontWeight: 600, fontSize: 12, textDecoration: "none",
            transition: "color .2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#666"; }}
          >
            View All <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>

        {/* Grid */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse" style={{ paddingBottom: "62%", position: "relative", background: "#1a1a1a", borderRadius: 12 }} />
            ))}
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#444" }}>
            <span className="material-icons" style={{ fontSize: 48, display: "block", marginBottom: 12 }}>search_off</span>
            ไม่พบข้อมูลในหมวดนี้
          </div>
        )}
        {!loading && posts.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {posts.map(post => {
              const thumb = imgUrl(post.thumbnailMedia?.urlThumb ?? post.thumbnailMedia?.urlFull);
              return (
                <Link key={post.postId} href={`/posts/${post.slug || post.postId}`}
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <div style={{ position: "relative", width: "100%", paddingBottom: "62%", borderRadius: 6, overflow: "hidden", background: "#1a1a1a", border: "1px solid #4b5563", transition: "all .35s", transform: "translateZ(0)", willChange: "transform" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px) translateZ(0)"; (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.6)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateZ(0)"; (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                  >
                    {thumb ? (
                      <img src={thumb} alt={post.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s ease" }} loading="lazy"
                        onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.07)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = ""; }}
                      />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#444" }}>
                        <span className="material-icons" style={{ fontSize: 56 }}>image</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 18px", zIndex: 2 }}>
                      <span style={{ display: "inline-block", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#999", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 4, marginBottom: 8 }}>{activeTab}</span>
                      <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 12px", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.title}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#777", fontSize: 11 }}>{formatDate(post.createdAt)}</span>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#ddd" }}>arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 4. RECENT PROJECTS
// ─────────────────────────────────────────────────────────────────────
function RecentProjects() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch(`${API}/posts?page=1&limit=4&tag=${PROJECT_TAG}&status=1`)
      .then(r => r.json()).then(d => setPosts((d.data || []).slice(0, 4))).catch(() => {});
  }, []);

  if (!posts.length) return null;

  return (
    <section style={{ padding: "80px 0", background: "#0d0d0d", borderBottom: "1px solid #222" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Our Work</span>
            <h2 style={{ color: "#e0e0e0", fontSize: 32, fontWeight: 800, margin: 0 }}>Recent Projects</h2>
          </div>
          <Link href="/project" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#888", fontSize: 13, fontWeight: 600, textDecoration: "none",
            transition: "color .2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#888"; }}
          >
            View All Projects <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
          </Link>
        </div>

        {/* Featured layout: 1 big left + 3 stacked right */}
        {posts.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, gridTemplateRows: "auto" }}>
            {/* Featured (first post — tall) */}
            {(() => {
              const post = posts[0];
              const thumb = imgUrl(post.thumbnailMedia?.urlThumb ?? post.thumbnailMedia?.urlFull);
              return (
                <Link key={post.postId} href={`/posts/${post.slug || post.postId}`}
                  style={{ display: "block", textDecoration: "none", gridRow: "1 / 4" }}
                >
                  <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 480, borderRadius: 6, overflow: "hidden", background: "#1a1a1a", border: "1px solid #4b5563", transition: "all .35s", transform: "translateZ(0)", willChange: "transform" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = "0 24px 80px rgba(0,0,0,0.7)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                  >
                    <div style={{ position: "absolute", inset: 0 }}>
                      {thumb ? (
                        <img src={thumb} alt={post.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s" }} loading="lazy"
                          onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = ""; }}
                        />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#444" }}>
                          <span className="material-icons" style={{ fontSize: 64 }}>image</span>
                        </div>
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 24px 24px", zIndex: 2 }}>
                        <span style={{ display: "inline-block", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#aaa", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 4, marginBottom: 12 }}>Featured Project</span>
                        <p style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 14px", lineHeight: 1.35, letterSpacing: "-0.02em" }}>{post.title}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#777", fontSize: 12 }}>{formatDate(post.createdAt)}</span>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#fff" }}>arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}
            {/* Right stack (posts 1–3) */}
            {posts.slice(1).map(post => {
              const thumb = imgUrl(post.thumbnailMedia?.urlThumb ?? post.thumbnailMedia?.urlFull);
              return (
                <Link key={post.postId} href={`/posts/${post.slug || post.postId}`}
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <div style={{ position: "relative", width: "100%", paddingBottom: "52%", borderRadius: 6, overflow: "hidden", background: "#1a1a1a", border: "1px solid #4b5563", transition: "all .3s", transform: "translateZ(0)", willChange: "transform" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                  >
                    <div style={{ position: "absolute", inset: 0 }}>
                      {thumb ? (
                        <img src={thumb} alt={post.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s" }} loading="lazy"
                          onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = ""; }}
                        />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#444" }}>
                          <span className="material-icons" style={{ fontSize: 40 }}>image</span>
                        </div>
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px 14px", zIndex: 2 }}>
                        <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.title}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#777", fontSize: 11 }}>{formatDate(post.createdAt)}</span>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#ddd" }}>arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 5. LATEST NEWS
// ─────────────────────────────────────────────────────────────────────
function LatestNews() {
  const [posts, setPosts] = useState<Post[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch(`${API}/posts?page=1&limit=4&tag=${NEWS_TAG}&status=1`)
      .then(r => r.json()).then(d => setPosts(d.data || [])).catch(() => {});
  }, []);

  const max = Math.max(0, posts.length - 2);
  useEffect(() => {
    if (max <= 0) return;
    const id = setInterval(() => setIdx(p => p >= max ? 0 : p + 1), 5000);
    return () => clearInterval(id);
  }, [max]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !el.children[0]) return;
    const w = (el.children[0] as HTMLElement).getBoundingClientRect().width;
    el.style.transform = `translateX(-${idx * (w + 20)}px)`;
  }, [idx, posts]);

  if (!posts.length) return null;

  return (
    <section style={{ padding: "80px 0", background: "#111", borderBottom: "1px solid #222", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Stay Informed</span>
            <h2 style={{ color: "#e0e0e0", fontSize: 32, fontWeight: 800, margin: 0 }}>Latest News</h2>
          </div>
          <Link href="/article" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#888", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#888"; }}
          >
            View All <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
          </Link>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div ref={trackRef} style={{ display: "flex", gap: 24, transition: "transform .7s ease-out" }}>
            {posts.map(post => {
              const thumb = imgUrl(post.thumbnailMedia?.urlThumb ?? post.thumbnailMedia?.urlFull);
              return (
                <Link key={post.postId} href={`/posts/${post.slug || post.postId}`}
                  style={{ flexShrink: 0, width: "calc(50% - 12px)", display: "block", textDecoration: "none" }}
                >
                  <div style={{ position: "relative", width: "100%", paddingBottom: "58%", borderRadius: 6, overflow: "hidden", background: "#1a1a1a", border: "1px solid #4b5563", transition: "all .35s", transform: "translateZ(0)", willChange: "transform" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.6)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                  >
                    <div style={{ position: "absolute", inset: 0 }}>
                      {thumb ? (
                        <img src={thumb} alt={post.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s" }} loading="lazy"
                          onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.07)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = ""; }}
                        />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#444" }}>
                          <span className="material-icons" style={{ fontSize: 56 }}>image</span>
                        </div>
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 22px 20px", zIndex: 2 }}>
                        <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 14px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", letterSpacing: "-0.01em" }}>
                          {post.title}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#777", fontSize: 12, fontWeight: 500 }}>{formatDate(post.createdAt)}</span>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#fff" }}>arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        {max > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
            {[...Array(max + 1)].map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 24 : 8, height: 8,
                borderRadius: 4, border: "none",
                background: i === idx ? "#888" : "rgba(255,255,255,0.15)",
                cursor: "pointer", transition: "all .3s", padding: 0,
              }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 5.5. COMPANY MOVEMENT
// ─────────────────────────────────────────────────────────────────────
function CompanyMovement() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch(`${API}/posts?page=1&limit=3&tag=${MOVEMENT_TAG}&status=1`)
      .then(r => r.json()).then(d => setPosts(d.data || [])).catch(() => {});
  }, []);

  if (!posts.length) return null;

  return (
    <section style={{ padding: "80px 0", background: "#0d0d0d", borderBottom: "1px solid #222" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ color: "#888", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>U44 Activities</span>
            <h2 style={{ color: "#e0e0e0", fontSize: 32, fontWeight: 800, margin: 0 }}>Company Movement</h2>
          </div>
          <Link href="/movement" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#888", fontSize: 13, fontWeight: 600, textDecoration: "none",
            transition: "color .2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#888"; }}
          >
            View All Movement <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {posts.map(post => {
            const thumb = imgUrl(post.thumbnailMedia?.urlThumb ?? post.thumbnailMedia?.urlFull);
            return (
              <Link key={post.postId} href={`/posts/${post.slug || post.postId}`}
                style={{ display: "block", textDecoration: "none" }}
              >
                <div style={{ position: "relative", width: "100%", paddingBottom: "62%", borderRadius: 6, overflow: "hidden", background: "#1a1a1a", border: "1px solid #4b5563", transition: "all .35s", transform: "translateZ(0)", willChange: "transform" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px) translateZ(0)"; (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.6)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateZ(0)"; (e.currentTarget as HTMLElement).style.borderColor = "#4b5563"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                >
                  <div style={{ position: "absolute", inset: 0 }}>
                    {thumb ? (
                      <img src={thumb} alt={post.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s ease" }} loading="lazy"
                        onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.07)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = ""; }}
                      />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#444" }}>
                        <span className="material-icons" style={{ fontSize: 56 }}>image</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 18px", zIndex: 2 }}>
                      <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 12px", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.title}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#777", fontSize: 11 }}>{formatDate(post.createdAt)}</span>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#ddd" }}>arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 6. STATS BANNER
// ─────────────────────────────────────────────────────────────────────
function StatsBanner() {
  return (
    <section style={{ padding: "72px 24px", background: "#0a0a0a", borderBottom: "1px solid #1f1f1f" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
        {[
          { num: "100+", label: "พันธมิตรผลิตภัณฑ์", sub: "Product Partners" },
          { num: "100+", label: "ลูกค้าองค์กร",      sub: "Enterprise Clients" },
          { num: "10+",  label: "ปีประสบการณ์",      sub: "Years of Experience" },
        ].map((s, i) => (
          <div key={i} style={{
            textAlign: "center",
            padding: "20px 24px",
            borderRight: i < 2 ? "1px solid #222" : "none",
          }}>
            <span style={{ display: "block", fontSize: 52, fontWeight: 900, color: "#e0e0e0", lineHeight: 1, marginBottom: 10 }}>{s.num}</span>
            <span style={{ display: "block", fontSize: 14, color: "#999", fontWeight: 600, marginBottom: 4 }}>{s.label}</span>
            <span style={{ display: "block", fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 7. VERTICAL CTA SLIDES  (ตรงกับ vertical-footer ในต้นฉบับ)
// ─────────────────────────────────────────────────────────────────────
const CTA_SLIDES = [
  {
    bg:     "/images/pexels-cookiecutter-1148820.png",
    title:  "ให้เราดูแลทุก IT Solution ของคุณ",
    desc:   "บริษัท ยูโฟร์ตี้โฟร์ เทคโนโลยี โซลูชั่นส์ จำกัด เชี่ยวชาญด้านการรวมระบบ โซลูชั่น IT และการจัดหาอุปกรณ์เทคโนโลยีขั้นสูง",
    cta:    "/contactus",
    label:  "ติดต่อเรา",
  },
  {
    bg:     "/images/Hero_1.jpg",
    title:  "Smart Kiosk & Digital Signage",
    desc:   "จำหน่าย ออกแบบ และติดตั้ง Digital Signage Solutions — จอ LED, Video Wall, ป้ายโฆษณาสินค้า In/Out door และ Kiosk Solutions",
    cta:    "/solution",
    label:  "ดูบริการทั้งหมด",
  },
  {
    bg:     "/images/Hero_2.png",
    title:  "ผลงานจากลูกค้าชั้นนำทั่วประเทศ",
    desc:   "เราให้บริการและดูแลโครงการให้กับองค์กรชั้นนำมากกว่า 100 แห่งทั่วประเทศไทย",
    cta:    "/project",
    label:  "ดูผลงานของเรา",
  },
];

function VerticalCTA() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % CTA_SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ position: "relative", height: 560, overflow: "hidden" }}>
      {CTA_SLIDES.map((slide, i) => (
        <div key={i} style={{
          position: "absolute",
          inset: 0,
          transition: "opacity 1s ease",
          opacity: i === idx ? 1 : 0,
          zIndex: i === idx ? 1 : 0,
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 1 }} />
          <img src={slide.bg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", inset: 0, zIndex: 2,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: "40px 24px",
          }}>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, color: "#e0e0e0", marginBottom: 16, maxWidth: 720 }}>
              {slide.title}
            </h2>
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", color: "#999", maxWidth: 680, lineHeight: 1.8, marginBottom: 32 }}>
              {slide.desc}
            </p>
            <Link href={slide.cta} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              background: "#2a2a2a",
              color: "#e0e0e0",
              fontWeight: 700,
              borderRadius: 6,
              textDecoration: "none",
              border: "2px solid #555",
              fontSize: 15,
              transition: "all .25s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#3a3a3a"; (e.currentTarget as HTMLElement).style.borderColor = "#888"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#2a2a2a"; (e.currentTarget as HTMLElement).style.borderColor = "#555"; (e.currentTarget as HTMLElement).style.color = "#e0e0e0"; }}
            >
              {slide.label}
              <span className="material-icons">arrow_forward</span>
            </Link>
          </div>
        </div>
      ))}
      {/* Dots */}
      <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
        {CTA_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 28 : 8, height: 8,
            borderRadius: 4, border: "none",
            background: i === idx ? "#e0e0e0" : "rgba(255,255,255,0.25)",
            cursor: "pointer", transition: "all .3s", padding: 0,
          }} />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 8. INFINITE LOGO SLIDER
// ─────────────────────────────────────────────────────────────────────
function InfiniteSlider({ title, items, href, reverse = false }: {
  title: string; items: string[]; href: string; reverse?: boolean;
}) {
  if (items.length === 0) return null;

  // Duplicate items so we have enough content to fill the screen and animate smoothly
  let marqueeItems = [...items];
  while (marqueeItems.length < 24) {
    marqueeItems = [...marqueeItems, ...items];
  }

  return (
    <section style={{ padding: "56px 0", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto 24px", padding: "0 24px", textAlign: "center" }}>
        <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >
          <h3 style={{ color: "#e0e0e0", fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h3>
          <span className="material-icons" style={{ fontSize: 22, color: "#666" }}>arrow_forward</span>
        </Link>
      </div>
      <div style={{ position: "relative", overflow: "hidden", padding: "20px 0", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ position: "absolute", inset: 0, left: 0, width: 80, background: "linear-gradient(to right, #0d0d0d, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, right: 0, left: "auto", width: 80, background: "linear-gradient(to left, #0d0d0d, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div className={reverse ? "logo-slide-rev" : "logo-slide"} style={{ display: "flex", alignItems: "center", gap: 60, width: "fit-content" }}>
          {[...marqueeItems, ...marqueeItems].map((src, i) => (
            <div key={i} style={{ flexShrink: 0, width: 110, height: 55, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={src} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "grayscale(100%)", opacity: 0.4, transition: "all .3s" }}
                loading="lazy"
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.filter = "grayscale(0%)"; (e.currentTarget as HTMLImageElement).style.opacity = "1"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.filter = "grayscale(100%)"; (e.currentTarget as HTMLImageElement).style.opacity = "0.4"; }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes logoSlide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes logoSlideRev { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .logo-slide { animation: logoSlide 38s linear infinite; }
        .logo-slide-rev { animation: logoSlideRev 38s linear infinite; }
        .logo-slide:hover, .logo-slide-rev:hover { animation-play-state: paused; }
      `}} />
    </section>
  );
}

// Data
const CLIENTS = [
  "001_PNG_ครุฑใหม่_กสทช_THA.png","ABAC.jpg","yss.png","สภากาชาด.png",
  "icon1.png","monopy.png","kcmh_logo.png","p2s.png",
  "ANDEN.png","billionaire.png","Hcu_logo.png","jcl.png",
  "kojin.png"," Rama.png","orbit.png","order-me.png",
  "quick.png","sd-scan.png",
].map(n => `/images/client/${n.trim()}`);

const PARTNERS = Array.from({ length: 34 }, (_, i) => {
  const n = (i + 1).toString().padStart(3, "0");
  return `/images/partners/DM_20250114154507_${n}.png`;
});

// ─────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [dbPartners, setDbPartners] = useState<string[]>([]);
  const [dbClients, setDbClients] = useState<string[]>([]);

  useEffect(() => {
    document.title = "U44 Technology Solutions | Home";
    // Fetch partners from database
    fetch(`${API}/partners?page=1&limit=100`)
      .then((r) => r.json())
      .then((d) => {
        const urls = (d.data || [])
          .map((p: any) => p.logoMedia?.urlMini || p.logoMedia?.urlThumb || p.logoMedia?.urlFull)
          .filter(Boolean)
          .map((url: string) => imgUrl(url));
        if (urls.length > 0) {
          setDbPartners(urls);
        }
      })
      .catch((err) => console.error("Error fetching partners:", err));

    // Fetch clients from database
    fetch(`${API}/clients?page=1&limit=100`)
      .then((r) => r.json())
      .then((d) => {
        const urls = (d.data || [])
          .map((c: any) => c.logoMedia?.urlMini || c.logoMedia?.urlThumb || c.logoMedia?.urlFull)
          .filter(Boolean)
          .map((url: string) => imgUrl(url));
        if (urls.length > 0) {
          setDbClients(urls);
        }
      })
      .catch((err) => console.error("Error fetching clients:", err));
  }, []);

  const displayPartners = dbPartners.length > 0 ? dbPartners : PARTNERS;
  const displayClients = dbClients.length > 0 ? dbClients : CLIENTS;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#e0e0e0" }}>
      <MainHero />
      <SolutionsSwiper />
      <ProductSection />
      <RecentProjects />
      <LatestNews />
      <CompanyMovement />
      <StatsBanner />
      <VerticalCTA />
      <InfiniteSlider title="Our Partners" items={displayPartners} href="/partner" />
      <InfiniteSlider title="Our Clients"  items={displayClients}  href="/client"  reverse />
    </div>
  );
}
