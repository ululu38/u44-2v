'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { fetchSearchRecommendations, imgUrl, formatDate, Post } from '../search/api';

const POPULAR_SEARCHES = ['NestJS', 'Google', 'Design', 'Solution', 'Article'];

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSearch?: (value: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({
  initialValue = '',
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
  onSearch,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with initialValue if it changes externally (e.g. browser back/forward navigation)
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Debounce input value changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 250);
    return () => clearTimeout(handler);
  }, [inputValue]);

  // Reset highlighted index whenever suggestions or search term changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [debouncedValue]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // TanStack Query for recommendation suggestions
  const isSearchEmpty = !debouncedValue.trim();
  const { data: recommendations = [], isLoading } = useQuery<Post[]>({
    queryKey: ['searchRecommendations', debouncedValue],
    queryFn: () => fetchSearchRecommendations(debouncedValue),
    enabled: showDropdown && !isSearchEmpty,
    staleTime: 5 * 60 * 1000, // cache suggestions for 5 mins
    gcTime: 10 * 60 * 1000,
  });

  const showPopular = isSearchEmpty;
  const items = showPopular ? POPULAR_SEARCHES : recommendations;
  const itemsLength = items.length;

  const handleSearchSubmit = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    setShowDropdown(false);
    inputRef.current?.blur();
    
    if (onSearch) {
      onSearch(trimmed);
    } else {
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(`/search`);
      }
    }
  };

  const handlePostClick = (post: Post) => {
    setShowDropdown(false);
    inputRef.current?.blur();
    router.push(`/posts/${post.slug || post.postId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowDropdown(true);
      setHighlightedIndex((prev) => (prev < itemsLength - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < itemsLength) {
        const selected = items[highlightedIndex];
        if (typeof selected === 'string') {
          setInputValue(selected);
          handleSearchSubmit(selected);
        } else {
          handlePostClick(selected);
        }
      } else {
        handleSearchSubmit(inputValue);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ transform: 'translateZ(0)' }}>
      {/* ── Search Input ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit(inputValue);
        }}
        className="relative w-full flex items-center"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className={`w-full pl-4 pr-10 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-400 text-sm rounded-full focus:outline-none focus:border-neutral-400 transition-colors ${inputClassName}`}
          suppressHydrationWarning
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-400 hover:text-white transition-colors"
          title="Search"
          suppressHydrationWarning
        >
          {isLoading && !showPopular ? (
            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* ── Recommendations Dropdown ── */}
      {showDropdown && !isSearchEmpty && (
        <div className="absolute top-full right-0 mt-2 w-full min-w-[290px] sm:min-w-[340px] md:min-w-[380px] bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.5)] overflow-hidden z-[999] transition-all duration-200">
          
          <div className="py-2">
            <div className="px-4 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-800/40 flex justify-between items-center">
              <span>บทความแนะนำ</span>
              {recommendations.length > 0 && (
                <span className="text-[9px] text-neutral-600 font-normal">
                  {recommendations.length} รายการ
                </span>
              )}
            </div>

            {/* Suggestions List */}
            {recommendations.length > 0 ? (
              <div className="max-h-[320px] overflow-y-auto py-1">
                {recommendations.map((post, idx) => {
                  const isHighlighted = highlightedIndex === idx;
                  const thumb = imgUrl(post.thumbnailMedia?.urlMini || post.thumbnailMedia?.urlThumb);
                  return (
                    <div
                      key={post.postId}
                      onClick={() => handlePostClick(post)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-200 ${
                        isHighlighted
                          ? 'bg-neutral-800/80 border-l-4 border-neutral-400 pl-3'
                          : 'hover:bg-neutral-800/40 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Tiny Thumbnail */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700/50 shrink-0 flex items-center justify-center">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600">
                            <span className="material-icons-outlined text-sm">image</span>
                          </div>
                        )}
                      </div>

                      {/* Title & Metadata */}
                      <div className="min-w-0 flex-grow">
                        <h6 className="text-xs font-bold text-neutral-100 line-clamp-1 leading-snug">
                          {post.title}
                        </h6>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-neutral-500 text-xs">
                {!isLoading ? 'ไม่พบข้อเสนอแนะสำหรับการค้นหานี้' : 'กำลังหาคำแนะนำ...'}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
