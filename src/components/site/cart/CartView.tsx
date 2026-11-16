"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Dictionary, Locale } from "@/lib/i18n";
import { ProductPhoto } from "../ProductPhoto";
import { cart, useCart } from "./store";

/** FASE 2 – Pagina carrello con avvio del pagamento Stripe o PayPal. */
export function CartView({
  locale,
  t,
  shippingCents,
  stripe,
  paypal,
}: {
  locale: Locale;
  t: Dictionary;
  shippingCents: number;
  stripe: boolean;
  paypal: boolean;
}) {
  const items = useCart();
  const [loading, setLoading] = useState<null | "stripe" | "paypal">(null);
  const [error, setError] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price_cents * i.qty, 0);

  async function checkout(provider: "stripe" | "paypal") {
    setLoading(provider);
    setError(false);
    try {
      const res = await fetch(`/api/checkout/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, items: items.map((i) => ({ id: i.id, qty: i.qty })) }),
      });
      const data = (await res.json()) as { url?: string };
      if (!res.ok || !data.url) throw new Error("checkout");
      window.location.href = data.url;
    } catch {
      setError(true);
      setLoading(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-muted">{t.cart.empty}</p>
        <Link href={`/${locale}/products`} className="btn-outline mt-6">
          {t.cart.continue}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-line card">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 p-4">
            <Link href={`/${locale}/products/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
              <ProductPhoto src={item.image} alt={item.name} sizes="80px" />
            </Link>
            <div className="flex flex-1 flex-col justify-between gap-2">
              <div className="flex justify-between gap-3">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-sm">{formatPrice(item.price_cents * item.qty, locale)}</p>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted">
                  {t.cart.quantity}
                  <select
                    className="rounded-lg border border-line bg-paper px-2 py-1 text-ink"
                    value={item.qty}
                    onChange={(e) => cart.setQty(item.id, Number(e.target.value))}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className="text-sm text-muted underline hover:text-ink" onClick={() => cart.remove(item.id)}>
                  {t.cart.remove}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="card h-fit space-y-3 p-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted">{t.cart.subtotal}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">{t.cart.shipping}</span>
          <span>{formatPrice(shippingCents, locale)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-3 font-semibold">
          <span>{t.cart.total}</span>
          <span>{formatPrice(subtotal + shippingCents, locale)}</span>
        </div>
        <div className="space-y-2 pt-3">
          {stripe && (
            <button type="button" className="btn-primary w-full" disabled={loading !== null} onClick={() => checkout("stripe")}>
              {loading === "stripe" ? t.cart.processing : t.cart.payCard}
            </button>
          )}
          {paypal && (
            <button type="button" className="btn-outline w-full" disabled={loading !== null} onClick={() => checkout("paypal")}>
              {loading === "paypal" ? t.cart.processing : t.cart.payPaypal}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-bad">{t.cart.error}</p>}
      </aside>
    </div>
  );
}
