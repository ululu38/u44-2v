'use client';

import React, { useEffect, useState } from 'react';
import { CachedImage } from '@/app/components/CachedImage';
import { getImageUrl } from '@/lib/utils/image';


const API = process.env.NEXT_PUBLIC_API_URL;

interface Client {
  clientId: number;
  name: string;
  logoMedia?: any;
  description?: string;
  displayOrder?: number;
}

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    document.title = "U44 Technology Solutions | Our Clients";

    fetch(`${API}/clients?page=1&limit=100`)
      .then(res => res.json())
      .then(d => {
        setClients(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24 pt-0 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/contatcuswallpaper.webp" 
            alt="Our Clients Background" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-transparent to-[#0a0a0a]"></div>
        </div>
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse z-0"></div>
        
        <div className={`relative z-10 text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] text-white uppercase">
              Our Clients.
            </h1>
            <div className="w-24 h-1.5 bg-blue-600 mx-auto mt-8 rounded-full"></div>
        </div>
      </section>

      {/* Intro Text */}
      <section className="container mx-auto px-6 text-center mt-12 mb-20">
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            ความสำเร็จของลูกค้าคือความภาคภูมิใจของเรา เรามุ่งมั่นส่งมอบเทคโนโลยีและโซลูชันที่ดีที่สุด
            เพื่อช่วยขับเคลื่อนธุรกิจของลูกค้าให้เติบโตอย่างยั่งยืนในยุคดิจิทัล
          </p>
      </section>

      {/* Client Grid */}
      <div className="container mx-auto px-6 max-w-7xl">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="bg-neutral-900 animate-pulse aspect-[3/2] rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {clients.map((c, idx) => {
              const rawUrl = c.logoMedia?.urlMini || c.logoMedia?.urlThumb || c.logoMedia?.urlFull || '';
              const logoUrl = getImageUrl(rawUrl);

              return (
                <div 
                  key={c.clientId || idx} 
                  className={`group bg-white p-6 rounded-2xl flex items-center justify-center shadow-md hover:shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all duration-500 hover:-translate-y-1 aspect-[3/2] relative transform overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${Math.min(idx * 30, 500)}ms` }}
                  title={c.description || c.name}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    {logoUrl ? (
                      <CachedImage 
                        src={logoUrl} 
                        alt={c.name}
                        className="!w-full !h-full object-contain group-hover:scale-105 transition-all duration-500"
                        style={{ aspectRatio: '3/2' }}
                      />
                    ) : (
                      <span className="text-neutral-800 font-bold text-sm text-center">{c.name}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
