import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client con la SERVICE ROLE KEY: bypassa la RLS.
 * Usato SOLO lato server dai webhook di pagamento (Fase 2) per registrare gli ordini.
 * La chiave non deve mai arrivare al browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY non configurata");
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
