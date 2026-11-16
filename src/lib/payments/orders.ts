import "server-only";
import { createServiceClient } from "../supabase/service";
import type { OrderItem } from "../types";

/**
 * FASE 2 – Registra un ordine pagato e scala le scorte.
 * Idempotente: se il provider rimanda la stessa notifica, l'ordine non viene duplicato.
 */
export async function recordPaidOrder(input: {
  provider: "stripe" | "paypal";
  providerRef: string;
  email: string | null;
  customerName: string | null;
  shipping: Record<string, unknown> | null;
  items: OrderItem[];
  totalCents: number;
  currency: string;
}) {
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("provider", input.provider)
    .eq("provider_ref", input.providerRef)
    .maybeSingle();
  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      provider: input.provider,
      provider_ref: input.providerRef,
      status: "paid",
      email: input.email,
      customer_name: input.customerName,
      shipping: input.shipping,
      items: input.items,
      total_cents: input.totalCents,
      currency: input.currency.toUpperCase(),
    })
    .select("id")
    .single();
  if (error) {
    // Violazione di unicità = notifica duplicata arrivata in parallelo
    if (error.code === "23505") return null;
    throw new Error(error.message);
  }

  for (const item of input.items) {
    await supabase.rpc("decrement_stock", { p_product_id: item.product_id, p_qty: item.qty });
  }
  return data.id as string;
}

/** Codifica compatta degli articoli per i metadati del provider (limite 500 caratteri). */
export function encodeItems(items: OrderItem[]): string {
  return items.map((i) => `${i.product_id}:${i.qty}:${i.unit_cents}`).join(",");
}

export function decodeItems(encoded: string, names: Record<string, string> = {}): OrderItem[] {
  if (!encoded) return [];
  return encoded.split(",").map((part) => {
    const [product_id, qty, unit] = part.split(":");
    return { product_id, qty: Number(qty), unit_cents: Number(unit), name: names[product_id] ?? "" };
  });
}
