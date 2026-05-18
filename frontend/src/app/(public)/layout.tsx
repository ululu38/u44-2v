"use client";

import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-[80px]">
        {children}
      </main>
      <Footer />
    </>
  );
}
