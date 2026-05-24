import React from "react";
import PostsSearchUI from "@/components/PostsSearchUI";

export const metadata = {
  title: "ค้นหา | U44Tech",
  description: "ผลการค้นหาข้อมูลจาก U44Tech",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const keyword = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

  return (
    <div className="bg-black min-h-screen">
      <PostsSearchUI 
        initialKeyword={keyword}
        title=""
        description=""
        hideControls={true}
      />
    </div>
  );
}
