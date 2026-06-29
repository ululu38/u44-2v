'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-neutral-950 px-6 py-24 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center relative z-10 max-w-xl mx-auto">
        {/* Animated Warning Icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-neutral-900 border border-red-500/30 flex items-center justify-center text-red-500 shadow-xl shadow-red-950/20">
            <span className="material-icons text-5xl sm:text-6xl animate-pulse">warning</span>
          </div>
          <div className="absolute inset-0 bg-red-500 blur-2xl opacity-10 -z-10 scale-95" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mb-4">
          SOMETHING WENT WRONG
        </h2>
        
        {/* Description */}
        <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed mb-10 max-w-md mx-auto">
          เกิดข้อผิดพลาดในการโหลดหน้าเว็บนี้ ทีมพัฒนาได้รับการแจ้งเตือนแล้ว คุณสามารถลองกดใหม่อีกครั้ง หรือกลับไปที่หน้าหลัก
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-sm sm:text-base cursor-pointer"
          >
            <span className="material-icons-outlined text-lg">refresh</span>
            ลองใหม่อีกครั้ง
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-bold rounded-xl border border-neutral-800 transition-all active:scale-95 text-sm sm:text-base"
          >
            <span className="material-icons-outlined text-lg">home</span>
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
