import type { Metadata } from "next";
import { BRAND_NAME, getSiteUrl } from "./config";
import { LOCALES, type Locale } from "./i18n";

/**
 * Metadati SEO comuni: titolo, descrizione, URL canonico, versioni linguistiche
 * (hreflang) e Open Graph.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
}: {
  locale: Locale;
  path: string; // percorso senza lingua, es. "/products"
  title?: string;
  description: string;
  image?: string;
}): Metadata {
  const site = getSiteUrl();
  const url = `${site}/${locale}${path}`;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `${site}/${l}${path}`;
  languages["x-default"] = `${site}/it${path}`;

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      url,
      siteName: BRAND_NAME,
      title: title ? `${title} | ${BRAND_NAME}` : BRAND_NAME,
      description,
      locale: locale === "it" ? "it_IT" : "en_US",
      ...(image ? { images: [{ url: image, width: 1200, height: 1200 }] } : {}),
    },
    twitter: { card: "summary_large_image" },
  };
}

/** Rende assoluto un URL immagine (le immagini demo sono percorsi locali). */
export function absoluteUrl(src: string): string {
  return src.startsWith("http") ? src : `${getSiteUrl()}${src}`;
}
