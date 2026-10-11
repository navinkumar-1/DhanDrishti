"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { useSession } from "@/store/session-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false } },
      }),
  );

  useEffect(() => {
    const finish = () => useSession.getState().setHydrated();
    if (useSession.persist.hasHydrated()) finish();
    return useSession.persist.onFinishHydration(finish);
  }, []);

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
