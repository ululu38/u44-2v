import React from "react";
import PostsSearchUI from "@/components/PostsSearchUI";

export const metadata = {
  title: "ความเคลื่อนไหว | U44Tech",
  description: "ความเคลื่อนไหวและกิจกรรมต่างๆ ของ U44Tech",
};

export default function MovementPage() {
  return (
    <div className="bg-black min-h-screen">
      <PostsSearchUI 
        initialCategoryId={6} 
        title="Movement & Activities"
        description="ติดตามความเคลื่อนไหว กิจกรรม และโครงการต่างๆ ของเรา"
      />
    </div>
  );
}
