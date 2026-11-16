"use client";

import Link from "next/link";
import { useTransition } from "react";
import { setProductStatus, toggleProductFlag } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import { PRODUCT_STATUSES, type ProductStatus } from "@/lib/types";
import { ProductPhoto } from "@/components/site/ProductPhoto";
import { STATUS_LABELS } from "@/lib/labels";

export interface ProductRowData {
  id: string;
  name: string;
  price_cents: number;
  status: ProductStatus;
  stock: number;
  featured: boolean;
  published: boolean;
  is_demo: boolean;
  category: string | null;
  cover: string | null;
}

/** Riga prodotto con modifiche rapide (stato, evidenza, pubblicazione). */
export function ProductRow({ product: p }: { product: ProductRowData }) {
  const [pending, start] = useTransition();

  return (
    <li className={`card flex items-center gap-3 p-3 ${pending ? "opacity-60" : ""}`}>
      <Link href={`/admin/products/${p.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
        <ProductPhoto src={p.cover} alt="" sizes="64px" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/admin/products/${p.id}`} className="block truncate font-medium hover:underline">
          {p.name}
        </Link>
        <p className="truncate text-xs text-muted">
          {formatPrice(p.price_cents)} · scorta {p.stock}
          {p.category ? ` · ${p.category}` : ""}
          {p.is_demo ? " · DEMO" : ""}
          {!p.published ? " · nascosto" : ""}
        </p>
        <select
          aria-label="Stato"
          className="mt-1.5 rounded-lg border border-line bg-paper px-2 py-1 text-xs"
          value={p.status}
          disabled={pending}
          onChange={(e) => start(() => setProductStatus(p.id, e.target.value as ProductStatus))}
        >
          {PRODUCT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => toggleProductFlag(p.id, "featured", !p.featured))}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${p.featured ? "text-warn" : "text-line hover:text-muted"}`}
          title={p.featured ? "Togli da in evidenza" : "Metti in evidenza"}
          aria-pressed={p.featured}
          aria-label="In evidenza"
        >
          ★
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => toggleProductFlag(p.id, "published", !p.published))}
          className={`rounded-full px-3 py-1.5 text-xs ${p.published ? "bg-ok/10 text-ok" : "bg-cream-dark text-muted"}`}
          aria-pressed={p.published}
        >
          {p.published ? "Online" : "Nascosto"}
        </button>
      </div>
    </li>
  );
}
