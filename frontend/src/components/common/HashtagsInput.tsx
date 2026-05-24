'use client';

import React, { useState, useEffect, useRef } from 'react';

interface HashtagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export default function HashtagsInput({ value, onChange }: HashtagsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const query = inputValue.trim().replace(/^#/, '');

    if (!query) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/hashtags/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const hits = await response.json();
          // Filter out already selected tags
          const filtered = hits.filter((hit: any) => !value.includes(hit.name));
          setSuggestions(filtered);
          setHighlightedIndex(-1);
        }
      } catch (error) {
        console.error('Failed to fetch hashtag suggestions:', error);
      }
    }, 200);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputValue, value]);

  const normalizeTag = (tag: string) => {
    return tag
      .toLowerCase()
      .trim()
      .replace(/^#/, '')
      .replace(/[^a-zA-Z0-9ก-๙_]/g, ''); // Keep alphanumeric, Thai characters, and underscores
  };

  const addTag = (tag: string) => {
    const cleanTag = normalizeTag(tag);
    if (cleanTag && !value.includes(cleanTag)) {
      onChange([...value, cleanTag]);
    }
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        addTag(suggestions[highlightedIndex].name);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Tags Display & Input Field */}
      <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-300 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all min-h-[50px] items-center">
        {value.map(tag => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-105"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-400 hover:text-red-500 font-extrabold focus:outline-none ml-1 transition-colors text-sm"
            >
              &times;
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? 'พิมพ์ Hashtag แล้วกด Enter หรือลูกศร...' : 'เพิ่มอีก...'}
          className="flex-grow min-w-[150px] outline-none text-sm text-gray-700 bg-transparent py-1"
        />
      </div>

      {/* Autocomplete Dropdown List */}
      {showSuggestions && (suggestions.length > 0 || (inputValue.trim() && !value.includes(normalizeTag(inputValue)))) && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[90] overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                onClick={() => addTag(suggestion.name)}
                className={`flex justify-between items-center px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                  index === highlightedIndex ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-500 font-semibold font-mono">#</span>
                  <span>{suggestion.name}</span>
                </div>
                {suggestion.usageCount > 0 && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">
                    ใช้แล้ว {suggestion.usageCount} ครั้ง
                  </span>
                )}
              </li>
            ))}
            
            {/* Direct creation option if not in suggestions */}
            {inputValue.trim() && !suggestions.some(s => s.name.toLowerCase() === normalizeTag(inputValue)) && (
              <li
                onClick={() => addTag(inputValue)}
                className="flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm text-blue-600 hover:bg-blue-50/50 border-t border-gray-100 font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>สร้างแท็กใหม่: </span>
                <span className="font-bold font-mono">#{normalizeTag(inputValue)}</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
