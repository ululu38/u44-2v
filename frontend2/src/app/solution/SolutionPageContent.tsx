'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHeroSolutions } from './api';
import { Post } from '../search/api';
import HeroSwiper from './HeroSwiper';
import SolutionExplorer from './SolutionExplorer';

export default function SolutionPageContent() {
  const { data: heroPosts = [] } = useQuery<Post[]>({
    queryKey: ['hero-solutions'],
    queryFn: fetchHeroSolutions,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  return (
    <div className="space-y-12">
      {/* Hero Swiper */}
      {heroPosts.length > 0 && <HeroSwiper posts={heroPosts} />}

      {/* Pill tabs & Posts Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <SolutionExplorer />
      </div>
    </div>
  );
}
