'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CachedImage } from './components/CachedImage';
import { getImageUrl } from '@/lib/utils/image';
import SolutionExplorer from './solution/SolutionExplorer';
import HeroSwiper from './solution/HeroSwiper';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

export default function LandingPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
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
    console.log("Fetching solutions from:", `${API}/search?q=solution&fields=title,thumbnailMedia:thumb,contentText,slug&limit=8`);
    fetch(`${API}/search?q=solution&fields=title,thumbnailMedia:thumb,contentText,slug&limit=8`)
      .then(res => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("Solutions fetched:", data);
        if (data && data.data) {
          setSolutions(data.data);
        }
      })
      .catch(err => console.error("Error fetching solutions:", err));

    // Fetch Latest News using search
    fetch(`${API}/search?q=movement&fields=postId,title,thumbnailMedia:thumb,createdAt,slug&limit=7`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setNews(data.data);
        }
      })
      .catch(err => console.error("Error fetching news:", err));

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
                  alt={slide.tag} 
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
      {solutions.length > 0 && <HeroSwiper posts={solutions} />}

      {/* Latest News Section */}
      {news.length > 0 && (
        <section className="bg-neutral-950 py-24 border-t border-neutral-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white tracking-tight uppercase">Latest News</h2>
              <div className="w-16 h-1 bg-blue-600 mx-auto mt-4 rounded-full" />
            </div>

            {/* Grid Layout matching the design */}
            <div className="space-y-6">
              {/* Top Row: 3 large cards */}
              {news.slice(0, 3).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {news.slice(0, 3).map((item) => {
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

              {/* Bottom Row: 4 smaller cards */}
              {news.slice(3, 7).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {news.slice(3, 7).map((item) => {
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
            </div>
          </div>
        </section>
      )}

      {/* Solutions Exploration Section */}
      <section className="bg-neutral-950 py-24 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <SolutionExplorer />
        </div>
      </section>
    </div>
  );
}
