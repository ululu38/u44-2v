"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Banner {
  id: number;
  name: string;
  mediaId: number | null;
  media?: any;
  linkUrl: string | null;
}

export default function FloatingBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Fetch banners on load
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner/public`);
        if (res.ok) {
          const data = await res.json();
          setBanners(data || []);
          if (data && data.length > 0) {
            setIsVisible(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      }
    };
    fetchBanners();
  }, []);

  // Auto slide logic
  useEffect(() => {
    if (!isVisible || isClosing || banners.length <= 1) return;
    
    // Change image every 4 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000); 
    
    return () => clearInterval(interval);
  }, [isVisible, isClosing, banners.length]);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for the fade-out animation to finish before removing from DOM
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible && !isClosing) return null;
  if (banners.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 pointer-events-auto">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isClosing || !isVisible ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal / Image Container */}
      <div 
        className={`relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center transform transition-all duration-300 ease-out ${
          isClosing || !isVisible ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-0 right-0 z-20 flex p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md transition-colors m-2 sm:-m-4"
          aria-label="Close banner"
        >
          <span className="material-icons-outlined text-2xl sm:text-3xl">close</span>
        </button>

        {/* Carousel Container */}
        <div className="relative w-full h-full rounded-2xl shadow-2xl bg-transparent">
          {banners.map((banner, index) => {
            let imageUrl = banner.media ? (banner.media.urlFull || banner.media.urlThumb) : "";
            if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('/images/')) {
              imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrl}`;
            }
            
            return (
              <Link 
                key={banner.id}
                href={banner.linkUrl || "#"}
                onClick={handleClose}
                className={`absolute inset-0 block transition-opacity duration-1000 ease-in-out group ${
                  index === currentIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt={banner.name || `Promotion Banner ${index + 1}`} 
                    className="w-full h-full object-contain transition-transform duration-[4000ms] ease-linear group-hover:scale-[1.02]"
                  />
                )}
              </Link>
            );
          })}
          
          {/* Indicators (Dots) */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none">
              {banners.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-500 shadow-sm ${
                    index === currentIndex ? 'bg-white scale-125 w-4 sm:w-6' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
