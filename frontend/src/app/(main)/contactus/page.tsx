'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CachedImage } from '@/app/components/CachedImage';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function ContactUsPage() {
  const [showMap, setShowMap] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    document.title = 'U44 Technology Solutions | Contact Us';
    const timer = setTimeout(() => setShowMap(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('loading');
    setErrorMsg('');

    const form = e.currentTarget;
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement)?.value?.trim() ?? '';

    const data = {
      name:    get('name'),
      email:   get('email'),
      phone:   get('phone'),
      subject: get('subject'),
      message: get('message'),
    };

    if (!data.name || !data.email || !data.phone || !data.subject || !data.message) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      setFormState('error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setErrorMsg('กรุณากรอกอีเมลให้ถูกต้อง');
      setFormState('error');
      return;
    }

    // Phone validation (only digits, 9-10 digits)
    const phoneRegex = /^[0-9]{9,10}$/;
    if (!phoneRegex.test(data.phone)) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (ตัวเลข 9-10 หลัก)');
      setFormState('error');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        setErrorMsg(result?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        setFormState('error');
        return;
      }
      setFormState('success');
      formRef.current?.reset();
    } catch {
      setErrorMsg('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่ภายหลัง');
      setFormState('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">

      {/* Hero */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <CachedImage
            src='/images/contatcuswallpaper.webp'
            alt="Contact Us Background"
            className="w-full h-full object-cover brightness-50"
            priority={true}
          />
        </div>
        <h1 className="relative z-10 text-6xl md:text-8xl font-black tracking-tight text-white drop-shadow-[0_0_40px_rgba(37,99,235,0.4)]">
          Contact us.
        </h1>
      </section>

      <div className="container mx-auto px-6 max-w-6xl mt-16 pb-24">

        {/* Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-4">
            <CachedImage src='/images/Map-No-BG-768x458.webp' alt="U44 Office Illustration" className="w-full h-full object-contain" />
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-grow space-y-5 text-sm md:text-base text-neutral-400">
              <h2 className="text-xl font-black text-neutral-100 mb-6 border-b-2 border-blue-600 w-fit pb-1.5 uppercase tracking-wide">Contact Info</h2>
              <p><span className="font-bold text-neutral-300 inline-block w-20">Tel:</span><a href={`tel:${process.env.NEXT_PUBLIC_CONTACT_TEL?.replace(/-/g, '')}`} className="hover:text-blue-400 transition-colors">{process.env.NEXT_PUBLIC_CONTACT_TEL}</a></p>
              <p><span className="font-bold text-neutral-300 inline-block w-20">Mobile:</span><a href={`tel:${process.env.NEXT_PUBLIC_CONTACT_MOBILE?.replace(/-/g, '')}`} className="hover:text-blue-400 transition-colors">{process.env.NEXT_PUBLIC_CONTACT_MOBILE}</a></p>
              <p><span className="font-bold text-neutral-300 inline-block w-20">E-mail:</span><a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="hover:text-blue-400 transition-colors">{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</a></p>
              <p><span className="font-bold text-neutral-300 inline-block w-20">Website:</span><a href={`https://${process.env.NEXT_PUBLIC_CONTACT_WEBSITE}`} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">{process.env.NEXT_PUBLIC_CONTACT_WEBSITE}</a></p>
              <p><span className="font-bold text-neutral-300 inline-block w-20">Facebook:</span><a href={process.env.NEXT_PUBLIC_CONTACT_FACEBOOK} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">{process.env.NEXT_PUBLIC_CONTACT_FACEBOOK_LABEL}</a></p>
              <p><span className="font-bold text-neutral-300 inline-block w-20">Line OA:</span><a href={process.env.NEXT_PUBLIC_CONTACT_LINE} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">{process.env.NEXT_PUBLIC_CONTACT_LINE_LABEL}</a></p>
              <p className="group cursor-pointer flex items-start" onClick={() => { navigator.clipboard.writeText(process.env.NEXT_PUBLIC_CONTACT_ADDRESS || ''); alert('ที่อยู่ถูกคัดลอกแล้ว!'); }}>
                <span className="font-bold text-neutral-300 inline-block w-20 shrink-0">Address:</span>
                <span>
                  <span className="group-hover:text-blue-400 transition-colors block leading-relaxed">{process.env.NEXT_PUBLIC_CONTACT_ADDRESS}</span>
                  <span className="text-[11px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity block mt-1">(Click to copy)</span>
                </span>
              </p>
            </div>
            <div className="flex flex-row md:flex-col gap-4">
              <div className="bg-[#111] p-2.5 rounded-xl w-28 h-28 border border-neutral-800 shadow-md">
                <CachedImage src={'/images/U-FORTY-FOUR-qr-code-line-1024x1024.webp'} alt="Line QR" className="w-full h-full object-cover opacity-90 rounded-md" />
              </div>
              <div className="bg-[#111] p-2.5 rounded-xl w-28 h-28 border border-neutral-800 shadow-md">
                <CachedImage src={'/images/qr-code-facebook-u44tech-1024x1024.webp'} alt="Facebook QR" className="w-full h-full object-cover opacity-90 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Form & Map */}
        <div className="bg-[#111] p-8 md:p-12 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-neutral-800 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

          <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter text-neutral-200">
            Get in <span className="text-blue-500">Touch</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            {/* Form */}
            {formState === 'success' ? (
              <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <span className="material-icons text-green-400 text-3xl">check_circle</span>
                </div>
                <h3 className="text-xl font-black text-neutral-100">ส่งข้อความเรียบร้อยแล้ว!</h3>
                <p className="text-neutral-400 text-sm max-w-xs">เราได้รับข้อความของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด</p>
                <button
                  onClick={() => setFormState('idle')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all"
                >
                  ส่งข้อความใหม่
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  type="text"
                  placeholder="Name"
                  required
                  className="w-full bg-[#0a0a0a] border border-neutral-800 p-4 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-neutral-200 placeholder:text-neutral-600 font-medium"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full bg-[#0a0a0a] border border-neutral-800 p-4 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-neutral-200 placeholder:text-neutral-600 font-medium"
                />
                <input
                  name="phone"
                  type="text"
                  placeholder="Phone"
                  required
                  className="w-full bg-[#0a0a0a] border border-neutral-800 p-4 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-neutral-200 placeholder:text-neutral-600 font-medium"
                />
                <input
                  name="subject"
                  type="text"
                  placeholder="Subject"
                  required
                  className="w-full bg-[#0a0a0a] border border-neutral-800 p-4 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-neutral-200 placeholder:text-neutral-600 font-medium"
                />
                <textarea
                  name="message"
                  placeholder="Write message here"
                  rows={4}
                  required
                  className="w-full bg-[#0a0a0a] border border-neutral-800 p-4 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none text-neutral-200 placeholder:text-neutral-600 font-medium"
                />

                {formState === 'error' && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={formState === 'loading'}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-black py-4 mt-2 transition-all duration-300 uppercase tracking-widest rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {formState === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : 'SEND MESSAGE'}
                </button>
              </form>
            )}

            {/* Map */}
            <div className="rounded-2xl overflow-hidden h-full min-h-[400px] border border-neutral-800 bg-[#0a0a0a] relative">
              {!showMap && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/30 animate-pulse">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-icons-outlined text-neutral-600 text-3xl animate-bounce">location_on</span>
                    <span className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Loading Map...</span>
                  </div>
                </div>
              )}
              {showMap && (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.67490950521!2d100.62902827508888!3d13.677521086706681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d5f5852115dad%3A0xb8e3b18f7bccd5d2!2sU%20FORTY%20FOUR%20TECHNOLOGY%20SOLUTIONS%20CO.%2C%20LTD.!5e0!3m2!1sen!2sth!4v1733292667037!5m2!1sen!2sth"
                  className="w-full h-full filter invert-[90%] hue-rotate-180 contrast-125 saturate-50 absolute inset-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer Contacts */}
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 mt-20 text-sm text-neutral-400">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-blue-900/20 border border-blue-900/30 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <span className="material-icons-outlined text-[18px]">phone</span>
            </div>
            <div>
              <p className="text-neutral-300 font-bold uppercase tracking-wider text-xs mb-0.5">Tel.</p>
              <p className="text-neutral-500 m-0">02-211-1122</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-green-900/20 border border-green-900/30 flex items-center justify-center text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all">
              <span className="material-icons-outlined text-[18px]">chat</span>
            </div>
            <div>
              <p className="text-neutral-300 font-bold uppercase tracking-wider text-xs mb-0.5">LINE</p>
              <p className="text-neutral-500 m-0">@u44tech</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-purple-900/20 border border-purple-900/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <span className="material-icons-outlined text-[18px]">email</span>
            </div>
            <div>
              <p className="text-neutral-300 font-bold uppercase tracking-wider text-xs mb-0.5">EMAIL</p>
              <p className="text-neutral-500 m-0">info@u44tech.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
