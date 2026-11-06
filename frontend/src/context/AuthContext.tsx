import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

type AuthCtx = { user: User | null; session: Session | null; loading: boolean };
const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true });

export function AuthProvider({
  children,
  onChange,
}: {
  children: ReactNode;
  onChange?: (e: string) => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setLoading(false);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED")
        onChange?.(event);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const accessToken = session?.access_token;
    if (!accessToken) return;

    let active = true;
    let timeout: number | undefined;
    const checkSession = async () => {
      try {
        const response = await fetch(`${apiBase}/api/auth/session`, {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        if (!active) return;
        if (response.status === 401) {
          void supabase.auth.signOut({ scope: "local" });
          return;
        }
        if (!response.ok) {
          timeout = window.setTimeout(() => void checkSession(), 30_000);
          return;
        }

        const result = (await response.json()) as { expiresAt: string };
        const remaining = Date.parse(result.expiresAt) - Date.now();
        if (!Number.isFinite(remaining) || remaining <= 0) {
          void supabase.auth.signOut({ scope: "local" });
          return;
        }
        timeout = window.setTimeout(() => {
          void supabase.auth.signOut({ scope: "local" });
        }, remaining);
      } catch {
        if (active) timeout = window.setTimeout(() => void checkSession(), 30_000);
      }
    };

    void checkSession();
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [session?.access_token]);

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
