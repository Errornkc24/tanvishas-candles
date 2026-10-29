import { supabase } from "@/lib/supabase";

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function accessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Please sign in to continue.");
  return session.access_token;
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = await accessToken();
  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error ?? "The request could not be completed.");
  return payload as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const token = await accessToken();

  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error ?? "The request could not be completed.");
  return payload;
}
