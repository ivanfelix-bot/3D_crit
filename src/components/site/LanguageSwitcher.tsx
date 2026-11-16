"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n";

/** Selettore lingua: mantiene la pagina corrente e ricorda la scelta in un cookie tecnico. */
export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() || `/${current}`;
  const rest = pathname.replace(/^\/(it|en)(?=\/|$)/, "");

  return (
    <div className="flex items-center gap-1 text-sm" role="group" aria-label={label}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          hrefLang={l}
          onClick={() => {
            document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
          }}
          aria-current={l === current ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            l === current ? "bg-ink text-white" : "text-muted hover:text-ink"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
