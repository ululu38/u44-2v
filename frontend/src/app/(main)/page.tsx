'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CachedImage } from '../components/CachedImage';
import { getImageUrl } from '@/lib/utils/image';
import SolutionExplorer from './solution/SolutionExplorer';
import HeroSwiper from './solution/HeroSwiper';
import LogoMarquee from '../components/LogoMarquee';


const API = process.env.NEXT_PUBLIC_API_URL;

const VERTICAL_SLIDES = [
  {
    bg: '/images/aboutusHero.webp',
    tag: 'ABOUT US',
    title: 'Providing IT Services and Solutions',
    desc: 'บริษัท ยู โฟร์ตี้โฟร์ เทคโนโลยี โซลูชั่นส์ จำกัด ผู้ให้บริการครบวงจรด้าน คอมพิวเตอร์ ฮาร์ดแวร์ ซอฟต์แวร์ และอุปกรณ์ต่อพ่วง พร้อมออกแบบ ติดตั้ง ดูแลรักษาเชิงป้องกัน และ System Integration (SI) โดยทีมผู้เชี่ยวชาญ เราคัดสรรอุปกรณ์คุณภาพจากผู้ผลิตชั้นนำระดับโลก และพัฒนาระบบเทคโนโลยีสารสนเทศที่มีประสิทธิภาพ เพื่อตอบโจทย์องค์กรทั้งภาครัฐและเอกชน',
    cta: '/aboutus',
    label: 'More About Us',
  },
  {
    bg: '/images/services.webp',
    tag: 'OUR SERVICES',
    title: 'Innovative IT Solutions',
    desc: 'บริการ IT Solution ครบวงจร จำหน่าย-ติดตั้งอุปกรณ์คอมพิวเตอร์ ระบบเครือข่าย Digital Signage พร้อม MA, PM, IT Support และ Onsite Service โดยทีมงานมืออาชีพ',
    cta: '/solution',
    label: 'View Services',
  },
  {
    bg: '/images/contactus.webp',
    tag: 'CONTACT US',
    title: 'Get in Touch Today',
    desc: 'ต้องการการสนับสนุนด้านไอทีใช่ไหม? ติดต่อทีมผู้เชี่ยวชาญของเราวันนี้ แล้วมาร่วมกันสร้างสรรค์โซลูชันนวัตกรรมไปด้วยกัน',
    cta: '/contactus',
    label: 'Contact Us',
  },
];

let cachedSolutions: any[] | null = null;
let cachedMovement: any[] | null = null;
let cachedNewsPosts: any[] | null = null;
let cachedPartners: string[] | null = null;
let cachedClients: string[] | null = null;

export default function LandingPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [solutions, setSolutions] = useState<any[]>(cachedSolutions || []);
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(!cachedSolutions);
  const [movementPosts, setMovementPosts] = useState<any[]>(cachedMovement || []);
  const [newsPosts, setNewsPosts] = useState<any[]>(cachedNewsPosts || []);
  const [isLoadingNews, setIsLoadingNews] = useState({ movement: !cachedMovement, news: !cachedNewsPosts });
  const [partners, setPartners] = useState<string[]>(cachedPartners || []);
  const [isLoadingPartners, setIsLoadingPartners] = useState(!cachedPartners);
  const [clients, setClients] = useState<string[]>(cachedClients || []);
  const [isLoadingClients, setIsLoadingClients] = useState(!cachedClients);
  const solContainerRef = useRef<HTMLDivElement>(null);

  const formatNewsDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const formattedDate = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const formattedTime = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${formattedDate} at ${formattedTime}`;
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    document.title = 'U FORTY FOUR Technology Solutions | Home';

    // Auto play slides every 6 seconds
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % VERTICAL_SLIDES.length);
    }, 6000);

    // Fetch Solutions
    if (!cachedSolutions) {
      console.log("Fetching solutions from:", `${API}/search?q=solution&fields=title,thumbnailMedia:thumb,contentText,slug&limit=8`);
      fetch(`${API}/posts?q=solution&fields=title,thumbnailMedia:thumb,contentText,slug&limit=8`)
        .then(res => {
          console.log("Response status:", res.status);
          return res.json();
        })
        .then(data => {
          console.log("Solutions fetched:", data);
          if (data && data.data) {
            cachedSolutions = data.data;
            setSolutions(data.data);
          }
        })
        .catch(err => console.error("Error fetching solutions:", err))
        .finally(() => setIsLoadingSolutions(false));
    }

    // Fetch Latest News (Movement for top row, News for bottom row)
    if (!cachedMovement) {
      fetch(`${API}/posts?q=movement&fields=postId,title,thumbnailMedia:thumb,createdAt,slug&limit=3`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            cachedMovement = data.data;
            setMovementPosts(data.data);
          }
        })
        .catch(err => console.error("Error fetching movement:", err))
        .finally(() => setIsLoadingNews(prev => ({ ...prev, movement: false })));
    }

    if (!cachedNewsPosts) {
      fetch(`${API}/posts?q=news&fields=postId,title,thumbnailMedia:thumb,createdAt,slug&limit=4`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            cachedNewsPosts = data.data;
            setNewsPosts(data.data);
          }
        })
        .catch(err => console.error("Error fetching news:", err))
        .finally(() => setIsLoadingNews(prev => ({ ...prev, news: false })));
    }

    // Fetch Partners
    if (!cachedPartners) {
      fetch(`${API}/partners?page=1&limit=100`)
        .then(res => res.json())
        .then(d => {
          const urls = (d.data || [])
            .map((p: any) => p.logoMedia?.urlMini || p.logoMedia?.urlThumb || p.logoMedia?.urlFull)
            .filter(Boolean)
            .map((url: string) => getImageUrl(url));
          cachedPartners = urls;
          setPartners(urls);
        })
        .catch(err => console.error("Error fetching partners:", err))
        .finally(() => setIsLoadingPartners(false));
    }

    // Fetch Clients
    if (!cachedClients) {
      fetch(`${API}/clients?page=1&limit=100`)
        .then(res => res.json())
        .then(d => {
          const urls = (d.data || [])
            .map((p: any) => p.logoMedia?.urlMini || p.logoMedia?.urlThumb || p.logoMedia?.urlFull)
            .filter(Boolean)
            .map((url: string) => getImageUrl(url));
          cachedClients = urls;
          setClients(urls);
        })
        .catch(err => console.error("Error fetching clients:", err))
        .finally(() => setIsLoadingClients(false));
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-neutral-950">
      {/* Hero Swiper Section */}
      <div className="relative w-full h-[100vh] overflow-hidden bg-neutral-950 select-none -mt-[80px]">
        {/* Slides Container */}
        <div 
          className="w-full h-full transition-transform duration-700 ease-out"
          style={{ transform: `translate3d(0, -${activeIdx * 100}%, 0)` }}
        >
          {VERTICAL_SLIDES.map((slide, i) => (
            <div 
              key={i} 
              className="w-full h-full relative flex items-center justify-center text-center px-6"
            >
              {/* Background Image with Dark Overlay */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/75 z-10" />
                <CachedImage 
                  src={slide.bg} 
                  alt={slide.title || slide.tag} 
                  className="w-full h-full object-cover brightness-90"
                  priority={i === 0}
                />
              </div>

              {/* Slide Content */}
              <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center justify-center pt-20">
                {/* Tag / Category */}
                <p className={`text-blue-500 font-extrabold uppercase tracking-[0.25em] text-xs sm:text-sm md:text-base mb-4 transition-all duration-1000 transform ${i === activeIdx ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                  {slide.tag}
                </p>
                
                {/* Title */}
                <h2 className={`text-white text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-black leading-tight tracking-tight mb-6 transition-all duration-1000 delay-100 transform ${i === activeIdx ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                  {slide.title}
                </h2>
                
                {/* Description */}
                <p className={`text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mb-8 font-light transition-all duration-1000 delay-200 transform ${i === activeIdx ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                  {slide.desc}
                </p>
                
                {/* CTA Button */}
                <div className={`transition-all duration-1000 delay-300 transform ${i === activeIdx ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                  <Link 
                    href={slide.cta} 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-800 text-white font-bold rounded-md border border-neutral-600 hover:bg-neutral-700 hover:border-neutral-500 hover:text-white transition-all text-sm md:text-base"
                  >
                    {slide.label}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Solutions Section */}
      <HeroSwiper posts={solutions} isLoading={isLoadingSolutions} />

      {/* Latest News Section */}
      {(isLoadingNews.movement || isLoadingNews.news || movementPosts.length > 0 || newsPosts.length > 0) && (
        <section className="bg-neutral-950 py-24 border-t border-neutral-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white tracking-tight uppercase">Latest News</h2>
              <div className="w-16 h-1 bg-blue-600 mx-auto mt-4 rounded-full" />
            </div>

            <div className="space-y-6">
              {isLoadingNews.movement || isLoadingNews.news ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={`news-skel-top-${i}`} className="bg-neutral-900/30 border border-neutral-800/80 rounded-2xl overflow-hidden flex flex-col h-full animate-pulse">
                        <div className="relative w-full aspect-[16/10] bg-neutral-800" />
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="h-5 bg-neutral-700 rounded w-full mb-3" />
                          <div className="h-5 bg-neutral-700 rounded w-2/3 mb-4" />
                          <div className="h-3 bg-neutral-800 rounded w-1/3 mt-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={`news-skel-bot-${i}`} className="bg-neutral-900/30 border border-neutral-800/80 rounded-2xl overflow-hidden flex flex-col h-full animate-pulse">
                        <div className="relative w-full aspect-[16/10] bg-neutral-800" />
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="h-4 bg-neutral-700 rounded w-full mb-2" />
                          <div className="h-4 bg-neutral-700 rounded w-3/4 mb-3" />
                          <div className="h-2.5 bg-neutral-800 rounded w-1/2 mt-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Top Row: 3 large cards (Movement) */}
                  {movementPosts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {movementPosts.map((item) => {
                        const imageUrl = item.thumbnailMedia?.urlThumb 
                          ? getImageUrl(item.thumbnailMedia.urlThumb) 
                          : null;
                        
                        return (
                          <Link 
                            key={item.postId}
                            href={`/posts/${item.slug || item.postId}`}
                            className="group bg-neutral-900/30 border border-neutral-800/80 rounded-2xl overflow-hidden hover:border-neutral-700/80 hover:bg-neutral-900/40 transition-all duration-350 flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                          >
                            <div className="relative w-full aspect-[16/10] bg-neutral-950 overflow-hidden">
                              <CachedImage 
                                src={imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                              <h3 className="text-base font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                {item.title}
                              </h3>
                              <p className="text-neutral-500 text-xs mt-auto font-medium">
                                {formatNewsDate(item.createdAt)}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Bottom Row: 4 smaller cards (News) */}
                  {newsPosts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {newsPosts.map((item) => {
                        const imageUrl = item.thumbnailMedia?.urlThumb 
                          ? getImageUrl(item.thumbnailMedia.urlThumb) 
                          : null;
                        
                        return (
                          <Link 
                            key={item.postId}
                            href={`/posts/${item.slug || item.postId}`}
                            className="group bg-neutral-900/30 border border-neutral-800/80 rounded-2xl overflow-hidden hover:border-neutral-700/80 hover:bg-neutral-900/40 transition-all duration-350 flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                          >
                            <div className="relative w-full aspect-[16/10] bg-neutral-950 overflow-hidden">
                              <CachedImage 
                                src={imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                              <h3 className="text-xs font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                {item.title}
                              </h3>
                              <p className="text-neutral-500 text-[10px] mt-auto font-medium">
                                {formatNewsDate(item.createdAt)}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Solutions Exploration Section */}
      <section className="bg-neutral-950 py-24 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <SolutionExplorer mode="pagination" />
        </div>
      </section>

      {/* Stats, Partners and Clients Section */}
      <section className="bg-neutral-950 py-24 border-t border-neutral-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 mb-20">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-white">100+</div>
              <div className="text-neutral-400 text-xs sm:text-sm font-medium">พันธมิตรผลิตภัณฑ์</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-white">100+</div>
              <div className="text-neutral-400 text-xs sm:text-sm font-medium">ลูกค้าองค์กร</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-white">10+</div>
              <div className="text-neutral-400 text-xs sm:text-sm font-medium">ปีประสบการณ์</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-white">24/7</div>
              <div className="text-neutral-400 text-xs sm:text-sm font-medium">การสนับสนุน</div>
            </div>
          </div>
        </div>

        {/* Partners Marquee */}
        <LogoMarquee 
          title="Our Partner" 
          items={partners} 
          isLoading={isLoadingPartners} 
          moreLink="/partner" 
          className="mb-16"
        />

        {/* Clients Marquee */}
        <LogoMarquee 
          title="Our Client" 
          items={clients} 
          isLoading={isLoadingClients} 
          moreLink="/client" 
        />
      </section>
    </div>
  );
}
