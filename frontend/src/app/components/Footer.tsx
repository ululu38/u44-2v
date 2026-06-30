"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const [loadIframes, setLoadIframes] = useState(false);

  useEffect(() => {
    // Delay loading the heavy iframes by 2.5 seconds to let the main page finish loading first
    const timer = setTimeout(() => {
      setLoadIframes(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <footer className="w-full text-neutral-100 mt-auto">
      {/* Footer Top */}
      <div className="bg-neutral-900 border-t border-neutral-800 py-12">
        <div className="container mx-auto px-4 max-w-[1600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Column 1: About Us */}
            <div className="flex flex-col gap-4">
              <h5 className="text-lg font-bold text-neutral-100 border-b border-neutral-400 pb-2 w-fit">About Us</h5>
              <div className="flex flex-col gap-2">
                <h6 className="text-xs font-bold text-neutral-400 tracking-wider uppercase">COMPANY DESCRIPTION</h6>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  บริษัท ยู โฟร์ตี้โฟร์ เทคโนโลยี โซลูชั่นส์ จำกัด ให้บริการจัดจำหน่าย ออกแบบ ติดตั้ง และดูแลระบบเทคโนโลยี IT ทั้งฮาร์ดแวร์และซอฟต์แวร์ พร้อมทีมผู้เชี่ยวชาญด้าน System Integration ครบวงจรสำหรับองค์กรทุกขนาด
                </p>
              </div>
              <div className="mt-4">
                <h6 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-2">SOLUTION</h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-neutral-400">
                  <Link href="/solution" className="hover:text-neutral-200 transition-colors">IOT Solutions</Link>
                  <Link href="/solution" className="hover:text-neutral-200 transition-colors">IT Service</Link>
                  <Link href="/solution" className="hover:text-neutral-200 transition-colors">Data Center Solutions</Link>
                  <Link href="/solution" className="hover:text-neutral-200 transition-colors">Digital Signage</Link>
                  <Link href="/solution" className="hover:text-neutral-200 transition-colors">Network Systems</Link>
                  <Link href="/solution" className="hover:text-neutral-200 transition-colors">CCTV & Access Control</Link>
                </div>
              </div>
            </div>

            {/* Column 2: Link Page & Social Media */}
            <div className="flex flex-col gap-4">
              <h6 className="text-lg font-bold text-neutral-100 border-b border-neutral-400 pb-2 w-fit">Links</h6>
              <div className="flex flex-col gap-2 text-sm text-neutral-400">
                <Link href="/aboutus" className="hover:text-neutral-200 transition-colors">About us</Link>
                <Link href="/solution" className="hover:text-neutral-200 transition-colors">Solution</Link>
                <Link href="/project" className="hover:text-neutral-200 transition-colors">Project</Link>
                <Link href="/contactus" className="hover:text-neutral-200 transition-colors">Contact us</Link>
                <Link href="/article" className="hover:text-neutral-200 transition-colors">Article</Link>
              </div>

              <div className="mt-4">
                <h6 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-2">Social Media</h6>
                <div className="flex gap-3">
                  <a 
                    href={process.env.NEXT_PUBLIC_CONTACT_FACEBOOK || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold rounded transition-colors"
                  >
                    Facebook
                  </a>
                  <a 
                    href={process.env.NEXT_PUBLIC_CONTACT_LINE || '#'} 
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-neutral-750 hover:bg-neutral-650 text-white text-xs font-bold rounded transition-colors"
                  >
                    Line
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3: Facebook Fan-Page */}
            <div className="flex flex-col gap-4">
              <h5 className="text-lg font-bold text-neutral-100 border-b border-neutral-400 pb-2 w-fit">Facebook Fan-Page</h5>
              <div className="overflow-hidden rounded border border-neutral-800 min-h-[300px] bg-neutral-900/50 flex items-center justify-center">
                {loadIframes ? (
                  <iframe
                    src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(process.env.NEXT_PUBLIC_CONTACT_FACEBOOK || '')}&tabs=timeline&width=340&height=331&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false&appId=1670230966608061`}
                    width="100%" 
                    height="300" 
                    style={{ border: 'none', overflow: 'hidden' }} 
                    scrolling="no"
                    frameBorder="0" 
                    allowFullScreen={true}
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-xs text-neutral-500">
                    <span className="animate-spin h-4 w-4 border-2 border-neutral-600 border-t-transparent rounded-full" />
                    <span>Loading feed...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Column 4: Map */}
            <div className="flex flex-col gap-4">
              <h5 className="text-lg font-bold text-neutral-100 border-b border-neutral-400 pb-2 w-fit">Map</h5>
              <div className="relative h-[250px] w-full overflow-hidden rounded border border-neutral-800 bg-neutral-900/50 flex items-center justify-center">
                {loadIframes ? (
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.67490950521!2d100.62902827508888!3d13.677521086706681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d5f5852115dad%3A0xb8e3b18f7bccd5d2!2sU%20FORTY%20FOUR%20TECHNOLOGY%20SOLUTIONS%20CO.%2C%20LTD.!5e0!3m2!1sen!2sth!4v1733292667037!5m2!1sen!2sth"
                    className="absolute inset-0 w-full h-full border-0" 
                    allowFullScreen={true} 
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-xs text-neutral-500">
                    <span className="animate-spin h-4 w-4 border-2 border-neutral-600 border-t-transparent rounded-full" />
                    <span>Loading map...</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-neutral-950 py-4 border-t border-neutral-900">
        <div className="container mx-auto px-4 max-w-[1600px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-neutral-500">
            <div>
              © 2024 U FORTY FOUR TECHNOLOGY SOLUTIONS CO., LTD.
            </div>
            <div>
               <a 
                 href={process.env.NEXT_PUBLIC_CONTACT_FACEBOOK || '#'} 
                 target="_blank" 
                 rel="noreferrer"
                 className="text-neutral-400 hover:text-neutral-200 transition-colors"
               >
                 Facebook
               </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
