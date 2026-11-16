/**
 * Configurazione centrale del sito.
 * Tutti i valori sensibili arrivano dalle variabili d'ambiente (mai nel codice).
 */

/** Nome del brand: cambiarlo qui lo aggiorna in tutto il sito. */
export const BRAND_NAME = "3D Crit";

/** URL pubblico del sito (dominio personalizzato o .vercel.app). */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** true se le variabili pubbliche di Supabase sono impostate. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Marketplace supportati, nell'ordine in cui appaiono i bottoni. */
export const MARKETPLACES = ["vinted", "ebay", "amazon", "wallapop"] as const;
export type Marketplace = (typeof MARKETPLACES)[number];

export const MARKETPLACE_LABELS: Record<Marketplace, string> = {
  vinted: "Vinted",
  ebay: "eBay",
  amazon: "Amazon",
  wallapop: "Wallapop",
};

/** Bucket di Supabase Storage per le foto prodotto. */
export const IMAGES_BUCKET = "product-images";

/** Costo di spedizione fisso per il checkout (Fase 2), in centesimi. */
export function getShippingCents(): number {
  const v = Number(process.env.SHIPPING_FLAT_CENTS ?? "0");
  return Number.isFinite(v) && v >= 0 ? Math.round(v) : 0;
}
