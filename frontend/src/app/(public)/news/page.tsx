import React from "react";
import PostsSearchUI from "@/components/PostsSearchUI";

export const metadata = {
  title: "ข่าวสาร | U44Tech",
  description: "ติดตามข่าวสารใหม่ๆ ของ U44Tech",
};

export default function NewsPage() {
  return (
    <div className="bg-black min-h-screen">
      {/* 
        initialCategoryId={1} indicates this page will default to News (Category ID 1) 
        You can adjust this ID based on your database configuration.
      */}
      <PostsSearchUI 
        initialTag="News" 
        title="News & Updates"
        description="ติดตามข่าวสาร กิจกรรม และความเคลื่อนไหวล่าสุดจากพวกเรา"
      />
    </div>
  );
}
