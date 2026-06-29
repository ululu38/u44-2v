"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (!localUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(localUser);
      if (user.role === "admin") {
        router.push("/admin/users");
      } else {
        router.push("/admin/posts");
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-slate-500 font-medium">Redirecting...</div>
    </div>
  );
}
