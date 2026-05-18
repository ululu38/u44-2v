"use client";

import Image from "next/image";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-0">
      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden mt-16">

        <Image
          src="/images/contatcuswallpaper.png"
          alt="Contact Us Background"
          fill
          className="object-cover brightness-75"
          priority
        />
        <h1 className="relative z-10 text-6xl md:text-8xl font-bold tracking-tight drop-shadow-xl text-white hero-text">
          Contact us.
        </h1>
      </section>



      <div className="container mx-auto px-4 max-w-6xl mt-16">

        {/* Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src="/images/Map-No-BG-768x458.png"
              alt="U44 Office Illustration"
              fill
              className="object-contain"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-grow space-y-4 text-sm md:text-base text-foreground/70">
              <h2 className="text-xl font-bold text-foreground mb-4 border-b-2 border-secondary w-fit pb-1">Contact Info</h2>
              <p>
                <span className="font-bold text-foreground">Tel:</span>{" "}
                <a href="tel:022111122" className="hover:text-accent transition-colors">02-211-1122</a>
              </p>
              <p>
                <span className="font-bold text-foreground">Mobile:</span>{" "}
                <a href="tel:0856661111" className="hover:text-accent transition-colors">085-666-1111</a>
              </p>
              <p>
                <span className="font-bold text-foreground">E-mail:</span>{" "}
                <a href="mailto:info@u44tech.com" className="hover:text-accent transition-colors">info@u44tech.com</a>
              </p>
              <p>
                <span className="font-bold text-foreground">Website:</span>{" "}
                <a href="https://u44tech.com" target="_blank" className="hover:text-accent transition-colors">u44tech.com</a>
              </p>
              <p>
                <span className="font-bold text-foreground">Facebook:</span>{" "}
                <a href="https://www.facebook.com/profile.php?id=61555566792786" target="_blank" className="hover:text-accent transition-colors">U44 Technology Solutions</a>
              </p>
              <p>
                <span className="font-bold text-foreground">Line OA:</span>{" "}
                <a href="https://line.me/R/ti/p/@u44tech" target="_blank" className="hover:text-accent transition-colors">@u44tech</a>
              </p>
              <p className="group cursor-pointer" onClick={() => {
                navigator.clipboard.writeText("8 Udomsuk 44 Bangna-Neua, Bangna, Bangkok 10260");
                alert("ที่อยู่ถูกคัดลอกแล้ว!");
              }}>
                <span className="font-bold text-foreground">Address:</span>{" "}
                <span className="group-hover:text-secondary transition-colors">8 Udomsuk 44 Bangna-Neua, Bangna, Bangkok 10260</span>
                <span className="ml-2 text-xs text-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">(Click to copy)</span>
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-surface-card p-2 rounded-lg w-32 h-32 border border-border">
                <Image src="/images/U-FORTY-FOUR-qr-code-line-1024x1024.png" alt="Line QR" width={128} height={128} className="opacity-90" />
              </div>
              <div className="bg-surface-card p-2 rounded-lg w-32 h-32 border border-border">
                <Image src="/images/qr-code-facebook-u44tech-1024x1024.png" alt="Facebook QR" width={128} height={128} className="opacity-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Form & Map Section */}
        <div className="bg-surface-card p-8 md:p-12 rounded-3xl shadow-xl border border-border">
          <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter">Get in <span className="text-secondary">Touch</span></h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <form className="space-y-4">
              <input 
                type="text" 
                placeholder="Name" 
                className="w-full bg-background border border-border p-4 rounded-xl focus:outline-none focus:border-secondary transition-colors mb-4 text-foreground"
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full bg-background border border-border p-4 rounded-xl focus:outline-none focus:border-secondary transition-colors mb-4 text-foreground"
              />
              <input 
                type="text" 
                placeholder="Phone" 
                className="w-full bg-background border border-border p-4 rounded-xl focus:outline-none focus:border-secondary transition-colors mb-4 text-foreground"
              />
              <input 
                type="text" 
                placeholder="Subject" 
                className="w-full bg-background border border-border p-4 rounded-xl focus:outline-none focus:border-secondary transition-colors mb-4 text-foreground"
              />
              <textarea 
                placeholder="Write message here" 
                rows={4}
                className="w-full bg-background border border-border p-4 rounded-xl focus:outline-none focus:border-secondary transition-colors resize-none mb-4 text-foreground"
              ></textarea>
              <button className="w-full bg-[#ffd700] hover:bg-[#ffea00] text-white font-bold py-4 transition-all duration-300 uppercase tracking-widest rounded-xl shadow-lg hover:shadow-yellow-500/20 border border-white/30">
                SEND MESSAGE
              </button>


            </form>

            <div className="rounded-3xl overflow-hidden h-[400px] border border-border shadow-inner">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.67490950521!2d100.62902827508888!3d13.677521086706681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d5f5852115dad%3A0xb8e3b18f7bccd5d2!2sU%20FORTY%20FOUR%20TECHNOLOGY%20SOLUTIONS%20CO.%2C%20LTD.!5e0!3m2!1sen!2sth!4v1733292667037!5m2!1sen!2sth"
                className="w-full h-full"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Footer Contacts */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 text-sm text-foreground/50">
           <div className="flex items-center gap-3">
              <span className="material-icons text-secondary">phone</span>
              <div>
                <p className="text-foreground font-bold uppercase tracking-wider text-xs">Tel.</p>
                <p className="text-foreground/70">02-211-1122</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <span className="material-icons text-secondary">chat</span>
              <div>
                <p className="text-foreground font-bold uppercase tracking-wider text-xs">LINE</p>
                <p className="text-foreground/70">@u44tech</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <span className="material-icons text-secondary">email</span>
              <div>
                <p className="text-foreground font-bold uppercase tracking-wider text-xs">EMAIL</p>
                <p className="text-foreground/70">info@u44tech.com</p>
              </div>
           </div>
        </div>
      </div>

      <style jsx>{`
        .hero-text {

          text-shadow: 0 0 10px rgba(255, 215, 0, 0.6), 
                       0 0 20px rgba(255, 215, 0, 0.4), 
                       0 0 30px rgba(255, 215, 0, 0.2);
        }
      `}</style>

    </div>
  );
}
