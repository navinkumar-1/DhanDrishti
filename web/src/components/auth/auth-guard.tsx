"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) {
      const next = pathname && pathname.startsWith("/") ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [pathname, ready, router, user]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-canvas p-8">
        <div className="skeleton mx-auto h-16 max-w-3xl rounded-[14px]" />
        <div className="skeleton mx-auto mt-4 h-64 max-w-3xl rounded-[14px]" />
      </div>
    );
  }

  return children;
}
