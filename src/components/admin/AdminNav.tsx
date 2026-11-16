"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-18v6h8V3h-8Z" },
  { href: "/admin/products", label: "Prodotti", icon: "M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 10L3 7m9 5 9-5m-9 5v10" },
  { href: "/admin/categories", label: "Categorie", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/admin/orders", label: "Ordini", icon: "M6 7h12l-1 13H7L6 7Zm3 0a3 3 0 0 1 6 0" },
  { href: "/admin/settings", label: "Impostazioni", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.2-1.3L14.4 3h-4l-.4 2.5a7.5 7.5 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.2 1.3l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3Z" },
];

export function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  if (mobile) {
    return (
      <nav className="grid grid-cols-5" aria-label="Admin">
        {ITEMS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${isActive(i.href) ? "text-navy" : "text-muted"}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
              <path d={i.icon} />
            </svg>
            {i.label}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav className="flex gap-1" aria-label="Admin">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`rounded-full px-3 py-1.5 text-sm ${isActive(i.href) ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
