"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { firebaseAuth, initAnalytics } from "@/lib/firebase/client";
import { useSession } from "@/store/session-store";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, ready: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void initAnalytics();
    return onAuthStateChanged(firebaseAuth(), (next) => {
      setUser(next);
      setReady(true);
      if (!next) return;
      const session = useSession.getState();
      if (session.ownerUid && session.ownerUid !== next.uid) session.clear();
      useSession.getState().bindOwner(next.uid);
    });
  }, []);

  const value = useMemo(() => ({ user, ready }), [ready, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
