'use client';

import React from 'react';
import MediaGallery from '@/components/common/MediaGallery';

export default function GalleryPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <MediaGallery isModal={false} />
    </div>
  );
}
