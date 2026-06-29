'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post, imgUrl } from '../search/api';
import { CachedImage } from '../../components/CachedImage';

interface HeroSwiperProps {
  posts: Post[];
  isLoading?: boolean;
}

export default function HeroSwiper({ posts, isLoading }: HeroSwiperProps) {
  const [solIdx, setSolIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isHovered, setIsHovered] = useState(false);

  // Update visibleCount based on responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 768) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxSolIdx = Math.max(0, posts.length - visibleCount);

  // Auto scroll horizontally card-by-card
  useEffect(() => {
    if (posts.length === 0 || isHovered || maxSolIdx <= 0) return;
    const interval = setInterval(() => {
      setSolIdx((prev) => (prev >= maxSolIdx ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [posts, isHovered, maxSolIdx]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (maxSolIdx <= 0) return;
    if (direction === 'left') {
      setSolIdx((prev) => (prev <= 0 ? maxSolIdx : prev - 1));
    } else {
      setSolIdx((prev) => (prev >= maxSolIdx ? 0 : prev + 1));
    }
  };

  const solutions = posts;
  const getImageUrl = imgUrl;

  if (!isLoading && (!solutions || solutions.length === 0)) return null;

  return (
    (isLoading || solutions.length > 0) && (
      <section 
        className="relative pt-12 pb-16 px-6 overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 20, 40, 0), rgba(10, 20, 40, 0)), url("/images/pexels-cookiecutter-1148820.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">Our Solutions</h2>
            <div className="w-16 h-1 bg-neutral-600 mx-auto mt-4 rounded-full" />
          </div>

          <div className="relative group/slider">
            {/* Prev Button
            <button 
              onClick={() => handleScroll('left')}
              className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 border border-neutral-800 text-white opacity-0 group-hover/slider:opacity-100 hover:bg-neutral-800 hover:border-neutral-700 transition-all focus:outline-none shadow-lg cursor-pointer"
              aria-label="Previous solution"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button> */}

            <div 
              className="overflow-hidden w-full"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div 
                className="flex gap-6 transition-transform duration-500 ease-out"
                style={{ 
                  transform: `translateX(calc(-${solIdx} * (100% + 24px) / ${visibleCount}))`,
                  willChange: 'transform'
                }}
              >
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div 
                      key={`skeleton-${i}`}
                      className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full w-full sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)] shrink-0 animate-pulse"
                    >
                      <div className="relative w-full aspect-[4/3] bg-neutral-800" />
                      <div className="p-6 flex flex-col flex-grow text-center">
                        <div className="h-5 bg-neutral-700 rounded w-3/4 mx-auto mb-4" />
                        <div className="h-3 bg-neutral-800 rounded w-full mb-2" />
                        <div className="h-3 bg-neutral-800 rounded w-5/6 mx-auto mt-auto" />
                      </div>
                    </div>
                  ))
                ) : (
                  solutions.map((item) => {
                    const imageUrl = item.thumbnailMedia?.urlThumb 
                      ? getImageUrl(item.thumbnailMedia.urlThumb) 
                      : null;
                    
                    return (
                      <Link 
                        key={item.postId}
                        href={`/posts/${item.slug || item.postId}`}
                        className="group bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all duration-350 flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)] shrink-0"
                      >
                        <div className="relative w-full aspect-[4/3] bg-neutral-950 overflow-hidden">
                          <CachedImage 
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-6 flex flex-col flex-grow text-center">
                          <h3 className="text-base font-bold text-white mb-2 group-hover:text-neutral-300 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mt-auto">
                            {item.contentText}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Next Button
            <button 
              onClick={() => handleScroll('right')}
              className="absolute right-0 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 border border-neutral-800 text-white opacity-0 group-hover/slider:opacity-100 hover:bg-neutral-800 hover:border-neutral-700 transition-all focus:outline-none shadow-lg cursor-pointer"
              aria-label="Next solution"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button> */}
          </div>

          {/* Pagination Dots */}
          {maxSolIdx > 0 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(maxSolIdx + 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSolIdx(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === solIdx ? 'w-8 bg-neutral-400' : 'w-2.5 bg-neutral-800 hover:bg-neutral-700'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    )
  );
}
