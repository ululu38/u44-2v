"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function PartnerPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const partners = [...Array(34)].map((_, i) => 
    `DM_20250114154507_${(i + 1).toString().padStart(3, '0')}.png`
  );

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
          {partners.map((name, idx) => (
            <div 
              key={idx} 
              className={`group bg-[#151517] backdrop-blur-sm p-8 rounded-2xl flex items-center justify-center border border-white/5 hover:border-blue-500/50 transition-all duration-500 hover:bg-[#1a1a1c] aspect-video relative transition-all transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${idx * 30}ms` }}
            >
                <div className="relative w-full h-full">
                  <Image 
                    src={`/images/partners/${name}`} 
                    alt={`Partner Logo ${idx + 1}`}
                    fill
                    className="object-contain group-hover:scale-110 transition-all duration-500"
                  />
                </div>
            </div>
          ))}
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
