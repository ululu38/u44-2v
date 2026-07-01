import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingBanner from "../../components/FloatingBanner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: "U FORTY FOUR Technology Solutions",
  description: "บริษัท ยู โฟร์ตี้โฟร์ เทคโนโลยี โซลูชั่นส์ จำกัด ให้บริการจัดจำหน่าย ออกแบบ ติดตั้ง และดูแลระบบเทคโนโลยี IT ทั้งฮาร์ดแวร์และซอฟต์แวร์",
  openGraph: {
    images: ['/images/U44-icon-133x123.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/U44-icon-133x123.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <head>
        {/* Preconnect to Google Fonts servers to eliminate DNS lookup time */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Icons — display=swap prevents FOIT (invisible text flash) */}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-100 min-h-screen flex flex-col font-sans`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 w-full pt-[80px]">
            {children}
          </main>
          <Footer />
          <FloatingBanner />
        </Providers>
      </body>
    </html>
  );
}
