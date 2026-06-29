'use client';

import React from 'react';
import Link from 'next/link';
import { Post, imgUrl, formatDate } from '../(main)/search/api';
import { CachedImage } from './CachedImage';

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const thumb = imgUrl(post.thumbnailMedia?.urlThumb || post.thumbnailMedia?.urlFull);

  return (
    <Link 
      href={`/posts/${post.slug || post.postId}`} 
      className="block aspect-[3/2] group relative rounded-md overflow-hidden border border-neutral-700 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(255,255,255,0.05)] bg-neutral-900"
    >
      <div className="w-full h-full flex flex-col justify-end relative">
        {/* Full Image — wrapper stays in same DOM slot to prevent CLS */}
        <CachedImage
          src={thumb}
          alt={post.title}
          className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] group-hover:scale-105 transition-transform duration-500"
          skeletonClassName="absolute inset-0 w-full h-full animate-pulse bg-white/5"
          priority={priority}
          fallback={
            <div className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-400">
              <span className="material-icons-outlined text-5xl opacity-50">image</span>
            </div>
          }
        />

        {/* Black Gradient Overlay */}
        <div className="absolute -inset-[2px] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content overlaid at the bottom */}
        <div className="relative px-3 pb-2.5 pt-6 flex flex-col z-10">
          {/* Title */}
          <h5 className="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug group-hover:text-neutral-200 transition-colors mb-2">
            {post.title}
          </h5>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] text-gray-400 font-medium">
              {formatDate(post.createdAt)}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-neutral-600 text-white flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              <span className="material-icons-outlined text-[18px] transform group-hover:translate-x-0.5 transition-transform duration-300">
                arrow_forward
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
