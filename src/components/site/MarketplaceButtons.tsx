"use client";

import { MARKETPLACES, MARKETPLACE_LABELS, type Marketplace } from "@/lib/config";
import { sendTrack } from "./track";

/** Bottoni "Compra su …": mostra solo i marketplace con un link inserito e registra i click. */
export function MarketplaceButtons({
  productId,
  links,
  label,
}: {
  productId: string;
  links: Partial<Record<Marketplace, string | null>>;
  label: string;
}) {
  const available = MARKETPLACES.filter((m) => links[m]);
  if (available.length === 0) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {available.map((m, i) => (
        <a
          key={m}
          href={links[m]!}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={() => sendTrack({ type: "click", productId, marketplace: m })}
          className={i === 0 ? "btn-primary w-full" : "btn-outline w-full"}
        >
          {label} {MARKETPLACE_LABELS[m]}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      ))}
    </div>
  );
}
