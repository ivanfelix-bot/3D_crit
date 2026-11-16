import { it } from "./it";
import { en } from "./en";

/** Lingue supportate. La prima è quella predefinita. */
export const LOCALES = ["it", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "it";

export type Dictionary = typeof it;

const dictionaries: Record<Locale, Dictionary> = { it, en };

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** Restituisce i testi per la lingua richiesta (italiano se sconosciuta). */
export function getDictionary(locale: string): Dictionary {
  return dictionaries[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

/** Sceglie il campo nella lingua giusta, con fallback all'italiano se vuoto. */
export function localized(obj: object, field: string, locale: Locale): string {
  const record = obj as Record<string, unknown>;
  const value = record[`${field}_${locale}`];
  if (typeof value === "string" && value.trim()) return value;
  const fallback = record[`${field}_it`];
  return typeof fallback === "string" ? fallback : "";
}
