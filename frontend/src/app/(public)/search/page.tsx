"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostsSearchUI from "@/components/PostsSearchUI";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  return (
    <PostsSearchUI 
      initialCategoryId={null} 
      initialKeyword={q}
      title="ผลการค้นหา (Search Results)"
      description={q ? `กำลังแสดงผลการค้นหาสำหรับ "${q}"` : "พิมพ์ค้นหาข่าวสาร บทความ หรือโครงการได้ที่นี่"}
    />
  );
}

export default function SearchPage() {
  return (
    <div className="bg-black min-h-screen pt-[80px]">
      <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-gray-400">กำลังโหลด...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
