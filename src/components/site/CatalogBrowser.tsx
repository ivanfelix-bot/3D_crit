"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { localized, type Dictionary, type Locale } from "@/lib/i18n";
import type { Category, ProductWithImages } from "@/lib/types";
import { ProductCard } from "./ProductCard";

/**
 * Catalogo con filtro per categoria e ricerca istantanea (lato client).
 * I filtri sono salvati nell'URL (?cat=…&q=…) così si possono condividere.
 */
export function CatalogBrowser({
  products,
  categories,
  locale,
  t,
}: {
  products: ProductWithImages[];
  categories: Category[];
  locale: Locale;
  t: Dictionary;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [cat, setCat] = useState(params.get("cat") ?? "");
  const [q, setQ] = useState(params.get("q") ?? "");

  function updateUrl(nextCat: string, nextQ: string) {
    const sp = new URLSearchParams();
    if (nextCat) sp.set("cat", nextCat);
    if (nextQ.trim()) sp.set("q", nextQ.trim());
    const qs = sp.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }

  const usedCategories = categories.filter((c) => products.some((p) => p.category_id === c.id));

  const filtered = useMemo(() => {
    const needle = q
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    return products.filter((p) => {
      if (cat && p.categories?.slug !== cat) return false;
      if (!needle) return true;
      const haystack = [p.name_it, p.name_en, p.description_it, p.description_en, p.material]
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
      return haystack.includes(needle);
    });
  }, [products, cat, q]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ slug: "", label: t.catalog.all }, ...usedCategories.map((c) => ({ slug: c.slug, label: localized(c, "name", locale) }))].map(
            (c) => (
              <button
                key={c.slug || "all"}
                type="button"
                onClick={() => {
                  setCat(c.slug);
                  updateUrl(c.slug, q);
                }}
                aria-pressed={cat === c.slug}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                  cat === c.slug ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink"
                }`}
              >
                {c.label}
              </button>
            ),
          )}
        </div>
        <form
          role="search"
          className="sm:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            updateUrl(cat, q);
          }}
        >
          <label className="sr-only" htmlFor="catalog-search">
            {t.catalog.search}
          </label>
          <input
            id="catalog-search"
            type="search"
            className="input"
            placeholder={t.catalog.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => updateUrl(cat, q)}
          />
        </form>
      </div>

      <p className="mt-6 text-sm text-muted">{filtered.length === 1 ? t.catalog.resultOne : t.catalog.resultsMany.replace("{n}", String(filtered.length))}</p>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted">{t.catalog.noResults}</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} locale={locale} t={t} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
