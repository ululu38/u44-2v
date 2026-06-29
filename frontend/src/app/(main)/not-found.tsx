'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-neutral-950 px-6 py-24 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center relative z-10 max-w-xl mx-auto">
        {/* Animated Tech Icon/Number */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[120px] sm:text-[150px] font-black leading-none">
            404
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl opacity-20 -z-10 scale-95" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mb-4">
          PAGE NOT FOUND
        </h2>
        
        {/* Description */}
        <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed mb-10 max-w-md mx-auto">
          ขออภัย ไม่พบหน้าเว็บที่คุณต้องการ อาจเป็นไปได้ว่าหน้านี้ถูกย้าย ถูกลบ หรือพิมพ์ URL ผิดพลาด
        </p>

      </div>
    </div>
  );
}
