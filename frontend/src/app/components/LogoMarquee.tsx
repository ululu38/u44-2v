'use client';

import React from 'react';
import Link from 'next/link';

interface LogoMarqueeProps {
  title: string;
  items: string[];
  isLoading?: boolean;
  moreLink?: string;
  className?: string;
}

export default function LogoMarquee({ title, items, isLoading, moreLink, className = '' }: LogoMarqueeProps) {
  let marqueeItems = [...items];
  if (!isLoading && items.length > 0) {
    while (marqueeItems.length > 0 && marqueeItems.length < 24) {
      marqueeItems = [...marqueeItems, ...items];
    }
  }

  if (!isLoading && items.length === 0) return null;

  return (
    <div className={className}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <h3 className="text-[15px] md:text-lg font-black tracking-[0.5em] md:tracking-widest uppercase text-white m-0">
            {title}
          </h3>
          {moreLink && (
            <Link 
              href={moreLink} 
              className="bg-neutral-900 hover:bg-blue-600 hover:border-blue-500 text-neutral-400 hover:text-white border border-neutral-800 text-[10px] px-4 py-1.5 md:px-6 md:py-2.5 rounded-full font-bold uppercase tracking-widest transition-all"
            >
              MORE...
            </Link>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden py-5 bg-white/5 border-y border-[#1a1a1a]">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-neutral-950 to-transparent z-[2] pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-neutral-950 to-transparent z-[2] pointer-events-none" />
        
        {isLoading ? (
          <div className="flex items-center gap-16 w-fit animate-[logoSlideLeftToRight_40s_linear_infinite] hover:[animation-play-state:paused]">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="shrink-0 w-[120px] h-[60px] flex items-center justify-center relative bg-neutral-900/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-16 w-fit animate-[logoSlideLeftToRight_40s_linear_infinite] hover:[animation-play-state:paused]">
            {[...marqueeItems, ...marqueeItems].map((src, i) => (
              <div key={i} className="group shrink-0 w-[120px] h-[60px] flex items-center justify-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${title} Logo`}
                  className="w-full h-full max-w-full max-h-full object-contain filter grayscale opacity-40 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes logoSlideLeftToRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
