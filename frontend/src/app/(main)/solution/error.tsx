'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SolutionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[SolutionPage] Error:', error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto pt-20 text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-100">เกิดข้อผิดพลาด</h2>
        <p className="text-neutral-400 text-sm">
          {error.message || 'ไม่สามารถโหลดหน้าโซลูชันได้ กรุณาลองใหม่อีกครั้ง'}
        </p>
      </div>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
        suppressHydrationWarning
      >
        ลองใหม่
      </button>
    </div>
  );
}
