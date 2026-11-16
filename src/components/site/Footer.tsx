import Link from "next/link";
import { BRAND_NAME } from "@/lib/config";
import type { Dictionary, Locale } from "@/lib/i18n";
import { Logo } from "./Logo";

export function Footer({
  locale,
  t,
  email,
  tiktok,
}: {
  locale: Locale;
  t: Dictionary;
  email?: string;
  tiktok?: string;
}) {
  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <Logo href={`/${locale}`} />
          <p className="mt-3 max-w-xs text-sm text-muted">{t.footer.tagline}</p>
          <div className="mt-4 flex flex-col gap-1 text-sm">
            {email && (
              <a href={`mailto:${email}`} className="text-muted hover:text-ink">
                {email}
              </a>
            )}
            {tiktok && (
              <a href={tiktok} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink">
                TikTok
              </a>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold">{t.footer.links}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href={`/${locale}/products`}>{t.nav.catalog}</Link></li>
            <li><Link className="hover:text-ink" href={`/${locale}/about`}>{t.nav.about}</Link></li>
            <li><Link className="hover:text-ink" href={`/${locale}/contact`}>{t.nav.contact}</Link></li>
            <li><Link className="hover:text-ink" href={`/${locale}/faq`}>{t.nav.faq}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">{t.footer.legal}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href={`/${locale}/privacy`}>{t.footer.privacy}</Link></li>
            <li><Link className="hover:text-ink" href={`/${locale}/cookies`}>{t.footer.cookies}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-site py-5 text-xs text-muted">
          © {new Date().getFullYear()} {BRAND_NAME}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
