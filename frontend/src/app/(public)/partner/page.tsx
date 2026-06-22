"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { clientCachedFetch } from '@/lib/api/client-cache';
import { CachedImage } from "@/components/common/CachedImage";

interface Partner {
  partnerId: number;
  name: string;
  logoMedia?: any;
  description?: string;
  displayOrder?: number;
}

export default function PartnerPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    document.title = "U44 Technology Solutions | Our Partners";

    const fetchPartners = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const url = `${apiUrl}/partners?page=1&limit=100`;

        // Use client-side cached fetch to avoid repeated requests when navigating
        const json = await clientCachedFetch(url, { cacheTTL: 5 * 60 * 1000 });
        setPartners(json.data || []);
      } catch (err) {
        console.error("Error fetching partners:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const staticPartners: Partner[] = [];

  const displayPartners = partners.length > 0 ? partners : staticPartners;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pb-24 pt-0 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[550px] flex items-center justify-center overflow-hidden -mt-[80px]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/10 to-transparent z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        
        <Image
          src="/images/contatcuswallpaper.png"
          alt="Our Partners Background"
          fill
          className="object-cover brightness-[0.25] scale-110 grayscale"
          priority
        />
        
        <div className={`relative z-10 text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <span className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
              Stronger Together
            </span>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter drop-shadow-2xl text-white hero-text-glow uppercase">
              Our<br className="md:hidden" /> Partners.
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-12 rounded-full"></div>
        </div>
      </section>

      {/* Intro Text */}
      <section className="container mx-auto px-4 text-center mt-24 mb-16">
          <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            พันธมิตรที่แข็งแกร่งคือหัวใจสำคัญของความสำเร็จ เราคัดสรรเฉพาะผู้ผลิตเทคโนโลยีระดับโลก 
            เพื่อนำเสนอโซลูชันที่ทันสมัยและมีประสิทธิภาพสูงสุดให้กับลูกค้าของเรา
          </p>
      </section>

      {/* Partner Grid */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {displayPartners.map((p, idx) => {
            const logoUrl = p.logoMedia?.urlMini || p.logoMedia?.urlThumb || p.logoMedia?.urlFull || '';

            // Prefer same-origin proxy when possible to avoid CORS (rewrites in next.config)
            // If backend path is /uploads or /images we keep it relative so browser requests /uploads/... which Next will rewrite.
            let formattedLogoUrl = '';
            if (!logoUrl) {
              formattedLogoUrl = '';
            } else if (logoUrl.startsWith('http')) {
              formattedLogoUrl = logoUrl;
            } else if (logoUrl.startsWith('/uploads') || logoUrl.startsWith('/images')) {
              formattedLogoUrl = logoUrl; // use proxy rewrite
            } else if (logoUrl.startsWith('/')) {
              // If running against local API, keep relative path to avoid cross-origin request
              const isLocal = (process.env.NEXT_PUBLIC_API_URL || '').includes('localhost');
              formattedLogoUrl = isLocal ? logoUrl : `${process.env.NEXT_PUBLIC_API_URL || ''}${logoUrl}`;
            } else {
              // Fallback
              formattedLogoUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/${logoUrl}`;
            }

            return (
              <div 
                key={p.partnerId} 
                className={`group bg-[#151517] backdrop-blur-sm p-8 rounded-2xl flex items-center justify-center border border-white/5 hover:border-blue-500/50 transition-all duration-500 hover:bg-[#1a1a1c] aspect-video relative transition-all transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${idx * 30}ms` }}
                title={p.description || p.name}
              >
                <div className="relative w-full h-full">
                  {formattedLogoUrl && (
                    <CachedImage 
                      src={formattedLogoUrl} 
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-all duration-500"
                      skeletonClassName="absolute inset-0 animate-pulse bg-white/5"
                      fallback={
                        <div className="absolute inset-0 flex items-center justify-center bg-transparent text-gray-500">
                          <span className="material-icons text-2xl">image</span>
                        </div>
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .hero-text-glow {
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.3), 
                       0 0 60px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
