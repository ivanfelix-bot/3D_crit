import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CartLink } from "./cart/CartLink";

export function Header({ locale, t, showCart }: { locale: Locale; t: Dictionary; showCart: boolean }) {
  const links = [
    { href: `/${locale}/products`, label: t.nav.catalog },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/faq`, label: t.nav.faq },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/90 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Logo href={`/${locale}`} />

        <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Principale">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher current={locale} label={t.nav.language} />
          {showCart && <CartLink href={`/${locale}/cart`} label={t.nav.cart} />}

          {/* Menu mobile senza JavaScript */}
          <details className="group relative md:hidden">
            <summary
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full hover:bg-cream-dark [&::-webkit-details-marker]:hidden"
              aria-label={t.nav.menu}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </summary>
            <nav className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-paper p-2 shadow-lg" aria-label={t.nav.menu}>
              <Link href={`/${locale}`} className="block rounded-xl px-4 py-3 text-sm hover:bg-cream">
                {t.nav.home}
              </Link>
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="block rounded-xl px-4 py-3 text-sm hover:bg-cream">
                  {l.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
