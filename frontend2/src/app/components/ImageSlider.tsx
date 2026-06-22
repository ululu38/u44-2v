'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CachedImage } from './CachedImage';
import { getImageUrl } from '@/lib/utils/image';

interface SliderImage {
  id: number;
  urlFull: string;
  urlThumb: string;
  width: number;
  height: number;
  blurHash: string;
}

interface ImageSliderProps {
  images: { media: SliderImage }[];
  title: string;
}

export function ImageSlider({ images, title }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollToImage = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const targetElement = container.children[index] as HTMLElement;
      if (targetElement) {
        const containerWidth = container.offsetWidth;
        const elementWidth = targetElement.offsetWidth;
        const elementLeft = targetElement.offsetLeft;
        
        // Calculate position to center the element
        const scrollTo = elementLeft - (containerWidth / 2) + (elementWidth / 2);
        
        container.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  const nextSlide = useCallback(() => {
    if (!images || images.length === 0) return;
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    scrollToImage(nextIndex);
  }, [currentIndex, images, scrollToImage]);

  const prevSlide = useCallback(() => {
    if (!images || images.length === 0) return;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    scrollToImage(prevIndex);
  }, [currentIndex, images, scrollToImage]);

  // Handle manual scroll to update index
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const children = Array.from(container.children) as HTMLElement[];
      const containerCenter = container.scrollLeft + container.offsetWidth / 2;
      
      let closestIndex = 0;
      let minDistance = Infinity;
      
      children.forEach((child, index) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const distance = Math.abs(containerCenter - childCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      
      if (closestIndex !== currentIndex) {
        setCurrentIndex(closestIndex);
      }
    }
  };


  // Auto-slide logic
  useEffect(() => {
    if (!images || images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [images, isPaused, nextSlide]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative mb-12 group" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      {/* Continuous Strip with Snap-to-Center */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-row overflow-x-auto no-scrollbar snap-x snap-mandatory h-[400px] md:h-[600px] rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl items-center"
      >
        {images.map((img, index) => (
          <div 
            key={`${img.media.id}-${index}`} 
            className="flex-shrink-0 h-full w-auto snap-center relative flex items-center justify-center transition-all duration-500"
            style={{ 
               opacity: currentIndex === index ? 1 : 0.4,
               transform: currentIndex === index ? 'scale(1)' : 'scale(0.9)'
            }}
          >
            {/* 
              User Request: "เอาขนาดไห้รูปไห้พอดีนะไม่ต้อง load รูปไหญ่เกินจำเป็น" 
              Since ImageSlider can be fullscreen on desktop, we use urlFull. 
              But for performance, if they wanted thumb, we could use urlThumb.
              Given it's a dedicated image viewer slider, urlFull is usually expected.
            */}
            <CachedImage
              src={getImageUrl(img.media.urlFull)}
              alt={`${title} - image ${index + 1}`}
              priority={index === 0}
              className="h-full w-auto shadow-2xl object-contain"
            />
          </div>
        ))}
      </div>

      {/* Navigation Areas */}
      <button 
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        suppressHydrationWarning
        className="absolute left-0 top-0 w-1/3 h-full z-30 transition-all duration-500 hover:bg-gradient-to-r hover:from-black/50 hover:to-transparent group/nav cursor-pointer"
        title="Previous"
      >
        <span className="material-icons-outlined text-white/0 group-hover/nav:text-white/60 transition-all duration-500 absolute left-8 top-1/2 -translate-y-1/2 text-5xl drop-shadow-lg">chevron_left</span>
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        suppressHydrationWarning
        className="absolute right-0 top-0 w-1/3 h-full z-30 transition-all duration-500 hover:bg-gradient-to-l hover:from-black/50 hover:to-transparent group/nav cursor-pointer"
        title="Next"
      >
        <span className="material-icons-outlined text-white/0 group-hover/nav:text-white/60 transition-all duration-500 absolute right-8 top-1/2 -translate-y-1/2 text-5xl drop-shadow-lg">chevron_right</span>
      </button>

      {/* Dotted Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIndex(i); scrollToImage(i); }}
            suppressHydrationWarning
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === currentIndex 
                ? 'w-2 h-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                : 'w-1 h-1 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Scroll Hint Gradient */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/80 to-transparent pointer-events-none z-10 opacity-60 rounded-l-2xl" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/80 to-transparent pointer-events-none z-10 opacity-60 rounded-r-2xl" />
    </div>
  );
}
