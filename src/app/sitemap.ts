import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config";
import { getProducts } from "@/lib/data";
import { LOCALES } from "@/lib/i18n";

export const revalidate = 3600;

/** Sitemap automatica: pagine statiche + tutti i prodotti pubblicati, in entrambe le lingue. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const staticPaths = ["", "/products", "/about", "/contact", "/faq", "/privacy", "/cookies"];
  const products = await getProducts();

  const alt = (path: string) => ({
    languages: Object.fromEntries(LOCALES.map((l) => [l, `${site}/${l}${path}`])),
  });

  return [
    ...staticPaths.flatMap((path) =>
      LOCALES.map((l) => ({
        url: `${site}/${l}${path}`,
        changeFrequency: "weekly" as const,
        priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.5,
        alternates: alt(path),
      })),
    ),
    ...products.flatMap((p) =>
      LOCALES.map((l) => ({
        url: `${site}/${l}/products/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: alt(`/products/${p.slug}`),
      })),
    ),
  ];
}
