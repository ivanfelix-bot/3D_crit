"use client";

import Link from "next/link";
import { useCart } from "./store";

export function CartLink({ href, label }: { href: string; label: string }) {
  const items = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  return (
    <Link href={href} className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-cream-dark" aria-label={`${label} (${count})`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M6 7h12l-1 13H7L6 7Z M9 7a3 3 0 0 1 6 0" strokeLinejoin="round" />
      </svg>
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-navy px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
