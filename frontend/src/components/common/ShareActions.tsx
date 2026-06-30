'use client';

import React, { useState, useEffect } from 'react';


interface ShareActionsProps {
  postId: number;
  postTitle: string;
  views: number;
}

const ShareActions: React.FC<ShareActionsProps> = ({ postId, postTitle, views }) => {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const [localViews] = useState(views + 1);

  useEffect(() => {
    setUrl(window.location.href);

    // Call background view increment endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${apiUrl}/posts/${postId}/view`, {
      method: 'POST'
    }).catch(() => {});
  }, [postId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // Fallback
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = {
    facebook: `${process.env.NEXT_PUBLIC_SHARE_FACEBOOK || 'https://www.facebook.com/sharer/sharer.php'}?u=${encodeURIComponent(url)}`,
    twitter: `${process.env.NEXT_PUBLIC_SHARE_TWITTER || 'https://twitter.com/intent/tweet'}?url=${encodeURIComponent(url)}&text=${encodeURIComponent(postTitle)}`,
    line: `${process.env.NEXT_PUBLIC_SHARE_LINE || 'https://social-plugins.line.me/lineit/share'}?url=${encodeURIComponent(url)}`
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 my-6 border-y border-border/40">
      {/* Left: Views Count */}
      <div className="flex items-center gap-4 text-foreground/60 text-sm font-medium">
        <span className="flex items-center gap-1.5 bg-foreground/5 px-3 py-1.5 rounded-full">
          <span className="material-symbols-outlined text-base text-secondary">visibility</span>
          <span>{localViews.toLocaleString()} views</span>
        </span>
      </div>

      {/* Right: Sharing Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground/50 font-bold uppercase tracking-wider mr-1">Share:</span>
        
        {/* Facebook */}
        <a 
          href={shareLinks.facebook} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-600/20"
          title="Share on Facebook"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
          </svg>
        </a>

        {/* X (Twitter) */}
        <a 
          href={shareLinks.twitter} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shadow-slate-900/20 border border-slate-800"
          title="Share on X"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        {/* Line */}
        <a 
          href={shareLinks.line} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-9 h-9 rounded-full bg-[#06C755] hover:bg-[#05b04b] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#06C755]/20"
          title="Share on Line"
        >
          <span className="font-black text-[9px] tracking-tighter">LINE</span>
        </a>

        {/* Copy Link */}
        <button 
          type="button" 
          onClick={handleCopy} 
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md relative ${copied ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-slate-200/20'}`}
          title="Copy post link"
        >
          <span className="material-symbols-outlined text-base">{copied ? 'done' : 'link'}</span>
          {copied && (
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-md animate-bounce">
              คัดลอกแล้ว!
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShareActions;
