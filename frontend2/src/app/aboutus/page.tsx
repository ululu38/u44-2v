'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CachedImage } from '@/app/components/CachedImage';
import { getImageUrl } from '@/lib/utils/image';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const imgUrl = getImageUrl;

const STATIC_PARTNERS = Array.from({ length: 34 }, (_, i) => {
  const n = (i + 1).toString().padStart(3, '0');
  return `/images/partners/DM_20250114154507_${n}.webp`;
});

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [dbPartners, setDbPartners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    document.title = 'U44 Technology Solutions | About Us';

    fetch(`${API}/partners?page=1&limit=100`)
      .then(res => res.json())
      .then(d => {
        const urls = (d.data || [])
          .map((p: any) => p.logoMedia?.urlMini || p.logoMedia?.urlThumb || p.logoMedia?.urlFull)
          .filter(Boolean)
          .map((url: string) => imgUrl(url));
        if (urls.length > 0) setDbPartners(urls);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const servicesLeft = [
    'เราจำหน่ายสินค้าและบริการติดตั้ง อุปกรณ์ IT Computer และ IT SOLUTION รวมถึงระบบ Digital Signage และระบบ Applications บำรุงรักษา ซ่อมบำรุงเชิงป้องกันแบบครบวงจร',
    'เรามีประสบการณ์ในการจำหน่ายและให้บริการติดตั้ง ดูแลหลังการขายลูกค้าองค์กรขนาดใหญ่ ทั้งภาครัฐและภาคเอกชน',
    'เราพันธมิตรที่แข็งแกร่งด้านผลิตภัณฑ์มากกว่าหลายร้อยราย ที่พร้อมให้คำปรึกษาและนำเสนอโซลูชั่นส์ที่เหมาะสมกับความต้องการของแต่ละองค์กร',
    'เรามีความพร้อมในการให้คำแนะนำและวางระบบตามความต้องการของแต่ละองค์กร ด้วยทีมงานมืออาชีพ และบริการที่คุณวางใจได้',
    'มีทีม Pre-sales และ After-sales ที่พร้อมให้คำปรึกษาแนะนำในสินค้าและบริการของเรา'
  ];

  const servicesRight = [
    'เรามีทีมงานที่ติดตั้งที่มีประสบการณ์และพันธมิตรภายนอกที่เชี่ยวชาญเฉพาะทาง เพื่อให้งานที่ออกมามีคุณภาพ',
    'สินค้าที่จำหน่ายและติดตั้งมีระบบการรับประกันเครื่อง พร้อมจัดส่ง ติดตั้ง และบริการแบบ Onsite Service',
    'มีบริการ MA, PM อุปกรณ์ IT ภายในองค์กร แบบสัญญาจ้าง หรือตามตกลง',
    'มีบริการ IT Help Desk Support และ IT Support Outsource แบบครบวงจร'
  ];

  const whatWeDo = [
    { title: 'IT EQUIPMENT & SOFTWARE', icon: 'smart_toy', desc: 'ซอฟต์แวร์แอปพลิเคชันที่ออกแบบมาเพื่อทำงานเฉพาะ หรือช่วยให้ผู้ใช้บรรลุเป้าหมายที่ต้องการ เพิ่มประสิทธิภาพการดำเนินงาน และตอบโจทย์ธุรกิจ' },
    { title: 'NETWORK & SECURITY',      icon: 'dns',       desc: 'โซลูชัน Network & Security ที่ครบถ้วนเป็นสิ่งสำคัญเพื่อความมั่นคงและปลอดภัย ลงทุนเพื่อเพิ่มประสิทธิภาพและป้องกันปัญหาในอนาคต' },
    { title: 'UNIFIED COMMUNICATION',   icon: 'security',  desc: 'การสื่อสารคือหัวใจของธุรกิจ โซลูชันที่ช่วยให้องค์กรสามารถเชื่อมต่อและทำงานร่วมกันได้อย่างมีประสิทธิภาพในแพลตฟอร์มเดียว' },
    { title: 'DIGITAL SIGNAGE',         icon: 'cloud',     desc: 'เครื่องมือหลักสำหรับสื่อสารในยุคดิจิทัล ครอบคลุมตั้งแต่การแสดงโฆษณาไปจนถึงการสร้างประสบการณ์ที่น่าจดจำแก่ผู้ใช้งาน' },
    { title: 'CCTV & ACCESS CONTROL',   icon: 'lock',      desc: 'ความปลอดภัยระดับสูงสำหรับที่อยู่อาศัยและองค์กร ครอบคลุมการเฝ้าระวัง บันทึกเหตุการณ์ และควบคุมการเข้าออกอย่างแม่นยำ' }
  ];

  const displayPartners = loading ? [] : (dbPartners.length > 0 ? dbPartners : STATIC_PARTNERS);
  let marqueePartners = [...displayPartners];
  while (marqueePartners.length > 0 && marqueePartners.length < 24) {
    marqueePartners = [...marqueePartners, ...displayPartners];
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="space-y-8 z-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/20 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-2">
              Leading the Innovation
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(37,99,235,0.2)] text-white">
              ขับเคลื่อน <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">นวัตกรรม</span><br/>และการเปลี่ยนแปลง
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl font-light">
              บริษัท ยู โฟร์ตี้โฟร์ เทคโนโลยี โซลูชั่นส์ จำกัด มุ่งมั่นสร้างระบบปฏิบัติการที่มีประสิทธิภาพ 
              พร้อมจัดหาอุปกรณ์ฮาร์ดแวร์คุณภาพสูง เพื่อตอบโจทย์ทุกความต้องการขององค์กรอย่างครบวงจร
            </p>
          </div>
          <div className="relative flex justify-center lg:justify-end group z-10">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="relative w-full max-w-[500px] aspect-square transition-transform duration-700 group-hover:scale-105">
              <CachedImage 
                src="/images/AboutUS.png" 
                alt="About U44" 
                className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(37,99,235,0.3)]"
                priority={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quote & Services */}
      <section className="py-24 bg-[#0d0d0d] border-y border-neutral-900 relative">
        <div className="container mx-auto px-6 text-center">
           <div className="max-w-4xl mx-auto mb-24">
             <h2 className="text-3xl md:text-4xl font-extralight italic text-neutral-500 leading-relaxed">
               “เพราะเราเข้าใจว่าเทคโนโลยีมีความสำคัญอย่างมากต่อการดำเนินธุรกิจ ในยุคปัจจุบันและอนาคต”
             </h2>
             <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-12" />
           </div>

           <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-neutral-200 mb-16">Our Services</h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="space-y-6">
                {servicesLeft.map((s, i) => (
                  <div key={i} className="group bg-[#111] p-8 text-left border-l-4 border-blue-900/40 hover:border-blue-500 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-x-2 border border-neutral-800">
                    <p className="text-neutral-400 group-hover:text-neutral-200 transition-colors leading-relaxed m-0">• {s}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                {servicesRight.map((s, i) => (
                  <div key={i} className="group bg-[#111] p-8 text-left border-l-4 border-blue-900/40 hover:border-blue-500 rounded-xl transition-all duration-300 hover:shadow-2xl hover:translate-x-2 border border-neutral-800">
                    <p className="text-neutral-400 group-hover:text-neutral-200 transition-colors leading-relaxed m-0">• {s}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* What We Do Grid */}
      <section className="py-32 relative overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-6 z-10 relative">
           <div className="text-center mb-24">
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-6 text-neutral-100">What We Do</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {whatWeDo.map((item, idx) => (
               <div key={idx} className="group bg-[#111] border border-neutral-800 p-12 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
                <div className="mb-10 relative">
                  <div className="w-20 h-20 rounded-2xl bg-blue-900/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner border border-blue-900/30">
                    <span className="material-icons-outlined text-4xl">{item.icon}</span>
                  </div>
                </div>
                <h3 className="text-xl font-black mb-5 group-hover:text-blue-400 transition-colors uppercase tracking-wide text-neutral-200">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed flex-grow group-hover:text-neutral-300 transition-colors m-0">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Infinite Scroll */}
      <section className="bg-[#0d0d0d] py-24 border-t border-neutral-900">
         <div className="container mx-auto px-6 text-center mb-16 flex items-center justify-center gap-6">
            <h3 className="text-[15px] font-bold tracking-[0.5em] uppercase text-neutral-500 m-0">Our Trusted Partners</h3>
            <Link href="/partner" className="bg-[#1a1a1a] hover:bg-blue-600 text-neutral-300 hover:text-white border border-neutral-700 text-[10px] px-6 py-2.5 rounded-full font-bold uppercase tracking-widest transition-all">
              VIEW ALL
            </Link>
         </div>

         <div className="relative overflow-hidden py-5 bg-white/5 border-y border-[#1a1a1a]">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0d0d0d] to-transparent z-[2] pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0d0d0d] to-transparent z-[2] pointer-events-none" />
          
          <div className="flex items-center gap-16 w-fit animate-[logoSlide_38s_linear_infinite] hover:[animation-play-state:paused]">
            {[...marqueePartners, ...marqueePartners].map((src, i) => (
              <div key={i} className="group shrink-0 w-[120px] h-[60px] flex items-center justify-center relative">
                <CachedImage
                  src={src}
                  alt="Partner"
                  className="max-w-full max-h-full object-contain filter grayscale opacity-40 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                  skeletonClassName="w-[120px] h-[60px] animate-shimmer"
                />
              </div>
            ))}
          </div>
         </div>
         <style dangerouslySetInnerHTML={{ __html: `
            @keyframes logoSlide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
         `}} />
      </section>
    </div>
  );
}
