import "server-only";
import { getPublicClient } from "../supabase/public";
import { getShippingCents } from "../config";
import { isLocale, localized, type Locale } from "../i18n";
import type { OrderItem, Product } from "../types";

/**
 * FASE 2 – Validazione del carrello lato server.
 * Il browser invia solo id e quantità: prezzi e disponibilità vengono letti
 * dal database, quindi nessuno può modificare i prezzi dal browser.
 */

export interface CheckoutRequest {
  locale: Locale;
  items: { id: string; qty: number }[];
}

export interface ValidatedCart {
  locale: Locale;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseCheckoutRequest(body: unknown): CheckoutRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as { locale?: unknown; items?: unknown };
  if (!Array.isArray(b.items) || b.items.length === 0 || b.items.length > 10) return null;
  const items: { id: string; qty: number }[] = [];
  for (const raw of b.items) {
    const it = raw as { id?: unknown; qty?: unknown };
    if (typeof it.id !== "string" || !UUID.test(it.id)) return null;
    const qty = Number(it.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return null;
    items.push({ id: it.id, qty });
  }
  return { locale: isLocale(b.locale as string) ? (b.locale as Locale) : "it", items };
}

export async function validateCart(req: CheckoutRequest): Promise<ValidatedCart | null> {
  const supabase = getPublicClient();
  if (!supabase) return null;
  const ids = [...new Set(req.items.map((i) => i.id))];
  const { data, error } = await supabase
    .from("products")
    .select("id, name_it, name_en, price_cents, status, stock, published")
    .in("id", ids);
  if (error || !data) return null;

  const products = new Map((data as Pick<Product, "id" | "name_it" | "name_en" | "price_cents" | "status" | "stock" | "published">[]).map((p) => [p.id, p]));
  const items: OrderItem[] = [];
  for (const { id, qty } of req.items) {
    const p = products.get(id);
    if (!p || !p.published || p.status === "out_of_stock") return null;
    // Se il prodotto è "disponibile" non si può comprare più della scorta
    if (p.status === "available" && p.stock > 0 && qty > p.stock) return null;
    items.push({ product_id: id, name: localized(p, "name", req.locale), qty, unit_cents: p.price_cents });
  }
  const subtotalCents = items.reduce((s, i) => s + i.unit_cents * i.qty, 0);
  const shippingCents = getShippingCents();
  return { locale: req.locale, items, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}
