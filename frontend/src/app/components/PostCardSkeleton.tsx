'use client';

import React from 'react';

/**
 * YouTube-style Skeleton Loading for PostCard
 */
export function PostCardSkeleton() {
  return (
    <div className="block aspect-[3/2] relative rounded-md overflow-hidden border border-neutral-800 bg-neutral-900 shadow-[0_8px_12px_rgba(0,0,0,0.3)]">
      {/* Main Image Shimmer */}
      <div className="absolute inset-0 animate-shimmer" />

      {/* Black Gradient Overlay (matches real PostCard) */}
      <div className="absolute -inset-[2px] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Content Skeleton overlaid at the bottom */}
      <div className="relative h-full px-3 pb-2.5 pt-6 flex flex-col justify-end z-10">
        
        {/* Title Lines */}
        <div className="mb-3 space-y-2">
          <div className="h-4 w-11/12 rounded-sm animate-shimmer" />
          <div className="h-4 w-3/4 rounded-sm animate-shimmer" />
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-auto">
          {/* Date */}
          <div className="h-3 w-16 rounded-sm animate-shimmer" />
          
          {/* Arrow Button */}
          <div className="w-8 h-8 rounded-full animate-shimmer shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />
        </div>
      </div>
    </div>
  );
}
