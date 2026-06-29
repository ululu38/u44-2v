'use client';

import React from 'react';
import Link from 'next/link';
import { Post, imgUrl, formatDate } from '../search/api';
import { CachedImage } from '../../components/CachedImage';

interface SolutionCardProps {
  post: Post;
  priority?: boolean;
}

export default function SolutionCard({ post, priority = false }: SolutionCardProps) {
  const thumb = imgUrl(post.thumbnailMedia?.urlThumb || post.thumbnailMedia?.urlFull);

  return (
    <Link
      href={`/posts/${post.slug || post.postId}`}
      className="block aspect-[3/2] group relative rounded-2xl overflow-hidden border border-neutral-800 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.15)] bg-neutral-900"
    >
      <div className="w-full h-full flex flex-col justify-end relative">
        <CachedImage
          src={thumb}
          alt={post.title}
          className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)]"
          priority={priority}
          fallback={
            <div className="absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-850 text-blue-400">
              <span className="material-icons-outlined text-5xl">image</span>
            </div>
          }
        />

        {/* Black Gradient Overlay */}
        <div className="absolute -inset-[2px] bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

        {/* Content overlaid at the bottom */}
        <div className="relative px-4 pb-3.5 pt-8 flex flex-col z-10">
          {/* Title */}
          <h5 className="font-bold text-sm sm:text-base text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors mb-2">
            {post.title}
          </h5>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[11px] text-neutral-400 font-medium">
              {formatDate(post.createdAt)}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
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
