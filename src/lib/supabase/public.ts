import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase "pubblico" (chiave anon, senza cookie).
 * Usato dalle pagine pubbliche: permette a Next.js di metterle in cache (ISR),
 * quindi il sito resta velocissimo. I permessi sono garantiti dalla RLS.
 */
let client: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
