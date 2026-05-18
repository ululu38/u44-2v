"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const menuItems = [
  { id: 'PRODUCT', icon: 'developer_mode', label: 'SOLUTION', link: '/solution' },
  { id: 'PROJECT', icon: 'share', label: 'PROJECT', link: '/project' },
  { id: 'CONTACT', icon: 'email', label: 'CONTACT US', link: '/contactus' },
  { id: 'ARTICLE', icon: 'article', label: 'ARTICLE', link: '/article' },
  { id: 'ABOUT', icon: 'info', label: 'ABOUT US', link: '/aboutus' }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`nav44 d-flex align-items-center justify-content-between px-4 fixed-top ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <Link href="/">
            <Image 
              src="/images/U44-icon-133x123.png" 
              alt="U FORTY FOUR TECHNOLOGY SOLUTIONS CO., LTD." 
              width={70} 
              height={70}
              priority
            />
          </Link>
        </div>
        
        <ul className="nav justify-content-center flex-grow-1 d-none d-lg-flex">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <Link href={item.link} className="nav-link">
                <span className="material-icons">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="d-flex align-items-center">
          <div className="search-container me-3 d-none d-lg-block">
            <input className="form-control" type="text" placeholder="Search..." id="searchInput" />
            <span className="icon material-icons-outlined">search</span>
          </div>
          <Link href="/contactus" className="btn btn-gold">Contact us</Link>
        </div>

        <button 
          className="hamburger d-lg-none" 
          id="hamburgerBtn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-icons">menu</span>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu d-lg-none ${isMobileMenuOpen ? 'active' : ''}`} id="mobileMenu">
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link href="/contactus" className="btn btn-gold w-100">Contact us</Link>
          </li>
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <Link href={item.link} className="nav-link">
                <span className="material-icons">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <style jsx global>{`
        .nav44 {
            position: fixed;
            top: 0;
            background: var(--nav-gradient);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            width: 100%;
            z-index: 1000;
            transition: all 0.4s ease;
        }

        .nav44.scrolled {
            background: var(--nav-scrolled);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .nav44 .logo img {
            height: 70px;
            padding: 5px;
            width: auto;
        }

        .nav44 .nav .nav-item .nav-link {
            color: white;
            display: flex;
            align-items: center;
            font-weight: 600;
            padding: 12px 18px;
            gap: 8px;
        }

        .nav44 .nav .nav-item .nav-link:hover {
            color: var(--accent);
            transform: scale(1.05);
        }

        .search-container {
            display: flex;
            align-items: center;
            position: relative;
        }

        .search-container input {
            padding-right: 35px;
            border-radius: 20px;
            background-color: #2a2a2c;
            border: 1px solid #444;
            color: white;
        }

        .search-container .icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #666;
        }

        .btn-gold {
            background-color: #ffd700 !important;
            color: #ffffff !important;
            font-weight: bold;
            padding: 8px 15px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            text-decoration: none;
            transition: all 0.3s ease;
        }


        .btn-gold:hover {
            background-color: var(--accent-hover);
        }

        .hamburger {
            color: white;
            background: none;
            border: none;
            cursor: pointer;
        }

        .mobile-menu {
            position: fixed;
            top: 80px;
            right: 15px;
            background: #fff;
            width: 200px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 15px;
            border-radius: 8px;
            z-index: 1000;
            transform: translateX(120%);
            transition: all 0.3s ease-in-out;
            visibility: hidden;
            opacity: 0;
        }

        .mobile-menu.active {
            transform: translateX(0);
            visibility: visible;
            opacity: 1;
        }

        .mobile-menu .nav-link {
            color: #0d6efd !important;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 0;
        }
      `}</style>
    </>
  );
}
