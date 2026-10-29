import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
if (!url || !anonKey)
  throw new Error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.local.");

/** Send database REST/RPC requests through Express while Auth and realtime use Supabase directly. */
const apiFetch: typeof fetch = async (input, init) => {
  const requestUrl = new URL(input instanceof Request ? input.url : String(input), url);
  if (!requestUrl.pathname.startsWith("/rest/v1/")) return fetch(input, init);
  const restPath = requestUrl.pathname.slice("/rest/v1".length);
  return fetch(
    `${apiBase}/api/database/rest/v1${restPath}${requestUrl.search}`,
    init ?? (input instanceof Request ? input : undefined),
  );
};

export const supabase = createClient<Database>(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  global: { fetch: apiFetch },
});
