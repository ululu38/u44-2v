"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function AboutUs() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const servicesLeft = [
    "เราจำหน่ายสินค้าและบริการติดตั้ง อุปกรณ์ IT Computer และ IT SOLUTION รวมถึงระบบ Digital Signage และระบบ Applications บำรุงรักษา ซ่อมบำรุงเชิงป้องกันแบบครบวงจร",
    "เรามีประสบการณ์ในการจำหน่ายและให้บริการติดตั้ง ดูแลหลังการขายลูกค้าองค์กรขนาดใหญ่ ทั้งภาครัฐและภาคเอกชน",
    "เราพันธมิตรที่แข็งแกร่งด้านผลิตภัณฑ์มากกว่าหลายร้อยราย ที่พร้อมให้คำปรึกษาและนำเสนอโซลูชั่นส์ที่เหมาะสมกับความต้องการของแต่ละองค์กร",
    "เรามีความพร้อมในการให้คำแนะนำและวางระบบตามความต้องการของแต่ละองค์กร ด้วยทีมงานมืออาชีพ และบริการที่คุณวางใจได้",
    "มีทีม Pre-sales และ After-sales ที่พร้อมให้คำปรึกษาแนะนำในสินค้าและบริการของเรา"
  ];

  const servicesRight = [
    "เรามีทีมงานที่ติดตั้งที่มีประสบการณ์และพันธมิตรภายนอกที่เชี่ยวชาญเฉพาะทาง เพื่อให้งานที่ออกมามีคุณภาพ",
    "สินค้าที่จำหน่ายและติดตั้งมีระบบการรับประกันเครื่อง พร้อมจัดส่ง ติดตั้ง และบริการแบบ Onsite Service",
    "มีบริการ MA, PM อุปกรณ์ IT ภายในองค์กร แบบสัญญาจ้าง หรือตามตกลง",
    "มีบริการ IT Help Desk Support และ IT Support Outsource แบบครบวงจร"
  ];

  const whatWeDo = [
    { title: "IT EQUIPMENT & SOFTWARE", icon: "fa-robot", desc: "ซอฟต์แวร์แอปพลิเคชันที่ออกแบบมาเพื่อทำงานเฉพาะ หรือช่วยให้ผู้ใช้บรรลุเป้าหมายที่ต้องการ เพิ่มประสิทธิภาพการดำเนินงาน และตอบโจทย์ธุรกิจ" },
    { title: "NETWORK & SECURITY", icon: "fa-database", desc: "โซลูชัน Network & Security ที่ครบถ้วนเป็นสิ่งสำคัญเพื่อความมั่นคงและปลอดภัย ลงทุนเพื่อเพิ่มประสิทธิภาพและป้องกันปัญหาในอนาคต" },
    { title: "UNIFIED COMMUNICATION", icon: "fa-shield-alt", desc: "การสื่อสารคือหัวใจของธุรกิจ โซลูชันที่ช่วยให้องค์กรสามารถเชื่อมต่อและทำงานร่วมกันได้อย่างมีประสิทธิภาพในแพลตฟอร์มเดียว" },
    { title: "DIGITAL SIGNAGE", icon: "fa-cloud", desc: "เครื่องมือหลักสำหรับสื่อสารในยุคดิจิทัล ครอบคลุมตั้งแต่การแสดงโฆษณาไปจนถึงการสร้างประสบการณ์ที่น่าจดจำแก่ผู้ใช้งาน" },
    { title: "CCTV & ACCESS CONTROL", icon: "fa-lock", desc: "ความปลอดภัยระดับสูงสำหรับที่อยู่อาศัยและองค์กร ครอบคลุมการเฝ้าระวัง บันทึกเหตุการณ์ และควบคุมการเข้าออกอย่างแม่นยำ" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-0 overflow-x-hidden">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] -z-10"></div>
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold tracking-widest uppercase mb-4">
              Leading the Innovation
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] uppercase tracking-tighter hero-text-glow">
              ขับเคลื่อน <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary/60">นวัตกรรม</span><br/>และการเปลี่ยนแปลง
            </h1>
            <p className="text-foreground/70 text-lg leading-relaxed max-w-2xl font-light">
              บริษัท ยู โฟร์ตี้โฟร์ เทคโนโลยี โซลูชั่นส์ จำกัด มุ่งมั่นสร้างระบบปฏิบัติการที่มีประสิทธิภาพ 
              พร้อมจัดหาอุปกรณ์ฮาร์ดแวร์คุณภาพสูง เพื่อตอบโจทย์ทุกความต้องการขององค์กรอย่างครบวงจร
            </p>
          </div>
          <div className="relative flex justify-center lg:justify-end group">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="relative w-full max-w-[500px] aspect-square transition-transform duration-700 group-hover:scale-105">
              <Image 
                src="/images/AboutUS.png" 
                alt="About U44" 
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(37,99,235,0.3)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quote & Services */}
      <section className="py-24 bg-surface-muted relative">
        <div className="container mx-auto px-4 text-center">
           <div className="max-w-4xl mx-auto mb-20">
             <h2 className="text-3xl md:text-4xl font-extralight italic text-foreground/60 leading-relaxed">
               “เพราะเราเข้าใจว่าเทคโนโลยีมีความสำคัญอย่างมากต่อการดำเนินธุรกิจ ในยุคปัจจุบันและอนาคต”
             </h2>
             <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-12"></div>
           </div>

           <h3 className="text-2xl font-bold uppercase tracking-[0.3em] text-secondary mb-16">Our Services</h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              <div className="space-y-6">
                {servicesLeft.map((s, i) => (
                  <div key={i} className="group bg-surface-card p-8 text-left border-l-[3px] border-secondary/20 hover:border-secondary rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-x-2 border border-border">
                    <p className="text-foreground/60 group-hover:text-foreground transition-colors leading-relaxed">• {s}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                {servicesRight.map((s, i) => (
                  <div key={i} className="group bg-surface-card p-8 text-left border-l-[3px] border-secondary/20 hover:border-secondary rounded-xl transition-all duration-300 hover:shadow-xl hover:translate-x-2 border border-border">
                    <p className="text-foreground/60 group-hover:text-foreground transition-colors leading-relaxed">• {s}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* What We Do Grid */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-4">
           <div className="text-center mb-24">
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">What We Do</h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {whatWeDo.map((item, idx) => (
               <div key={idx} className="group bg-surface-card border border-border p-12 rounded-3xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all"></div>
                <div className="mb-10 relative">
                  <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500">
                    <i className={`fas ${item.icon} fa-2x`}></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-6 group-hover:text-secondary transition-colors uppercase tracking-wide">{item.title}</h3>
                <p className="text-foreground/60 text-sm leading-relaxed flex-grow group-hover:text-foreground transition-colors">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Infinite Scroll */}
      <section className="bg-surface-muted py-24 border-y border-border">
         <div className="container mx-auto px-4 text-center mb-16 flex items-center justify-center gap-8">
            <h3 className="text-xl font-light tracking-[0.5em] uppercase text-foreground/40">Our Trusted Partners</h3>
            <a href="/partner" className="bg-surface-card hover:bg-secondary text-foreground hover:text-white border border-border text-[10px] px-6 py-2 rounded-full font-bold uppercase tracking-widest transition-all">VIEW ALL</a>
         </div>

         <div className="relative flex overflow-hidden">
            <div className="flex gap-20 animate-scroll whitespace-nowrap">
               {[...Array(20)].map((_, i) => {
                 const num = ((i % 34) + 1).toString().padStart(3, '0');
                 return (
                   <div key={i} className="flex-none w-40 h-20 relative opacity-70 hover:opacity-100 transition-opacity">
                     <Image src={`/images/partners/DM_20250114154507_${num}.png`} alt={`Partner ${i+1}`} fill className="object-contain" />
                   </div>
                 );
               })}
               {[...Array(20)].map((_, i) => {
                 const num = ((i % 34) + 1).toString().padStart(3, '0');
                 return (
                   <div key={`dup-${i}`} className="flex-none w-40 h-20 relative opacity-70 hover:opacity-100 transition-opacity">
                     <Image src={`/images/partners/DM_20250114154507_${num}.png`} alt={`Partner ${i+1}`} fill className="object-contain" />
                   </div>
                 );
               })}
            </div>
         </div>
      </section>

      <style jsx>{`
        .hero-text-glow {
          text-shadow: 0 0 20px rgba(37, 99, 235, 0.3), 
                       0 0 40px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </div>
  );
}
