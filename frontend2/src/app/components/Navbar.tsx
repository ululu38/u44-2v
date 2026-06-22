"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const SearchBar = dynamic(() => import("./SearchBar").then((mod) => mod.SearchBar), {
  ssr: false,
  loading: () => (
    <div className="relative w-28 sm:w-48 md:w-64">
      <input
        type="text"
        placeholder="Search..."
        disabled
        className="w-full pl-4 pr-10 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-400 text-sm rounded-full opacity-80 cursor-wait"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 flex items-center justify-center">
        <span className="material-icons text-base">search</span>
      </div>
    </div>
  ),
});

const menuItems = [
  { id: 'PRODUCT', icon: 'developer_mode', label: 'SOLUTION', link: '/solution' },
  { id: 'PROJECT', icon: 'share', label: 'PROJECT', link: '/project' },
 // { id: 'CONTACT', icon: 'email', label: 'CONTACT US', link: '/contactus' },
  { id: 'ARTICLE', icon: 'article', label: 'ARTICLE', link: '/article' },
  { id: 'ABOUT', icon: 'info', label: 'ABOUT US', link: '/aboutus' }
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-3 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 transition-all duration-300">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="block">
            <img 
              src="/images/U44-icon-133x123.png" 
              alt="U FORTY FOUR" 
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation Menu */}
        <ul className="hidden lg:flex items-center justify-center space-x-1 flex-grow max-w-2xlg mx-auto">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link href={item.link} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-200 hover:text-white transition-colors">
                <span className="material-icons text-lg">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Desktop Search Bar */}
          <SearchBar className="w-28 sm:w-48 md:w-64" placeholder="Search..." />
          
          <Link href="/contactus" className="px-5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-950 font-bold text-sm rounded-lg transition-colors border border-neutral-300/30">
            Contact us
          </Link>

          {/* Hamburger Button for Mobile */}
          <button 
            className="lg:hidden text-neutral-100 hover:text-white transition-colors focus:outline-none" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            suppressHydrationWarning
          >
            <span className="material-icons text-3xl">menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed top-16 right-4 z-50 w-64 bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-2xl transition-all duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
        <ul className="flex flex-col gap-3">
          {/* Mobile Search */}
          <li>
            <SearchBar className="w-full" placeholder="Search..." />
          </li>
          <li>
            <Link href="/contactus" className="block text-center w-full px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-950 font-bold text-sm rounded-lg transition-colors">
              Contact us
            </Link>
          </li>
          <hr className="border-neutral-800 my-1" />
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link href={item.link} className="flex items-center gap-2 py-2 px-3 text-neutral-200 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-all text-sm font-semibold">
                <span className="material-icons text-lg">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

