import type { Locale } from "./i18n";

/** Formatta un prezzo in centesimi come valuta EUR nella lingua indicata. */
export function formatPrice(cents: number, locale: Locale = "it"): string {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** Converte un testo in slug URL (es. "Porta Spezie!" -> "porta-spezie"). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
