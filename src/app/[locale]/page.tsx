import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { getDictionary, localized, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ProductCard } from "@/components/site/ProductCard";
import { BRAND_NAME } from "@/lib/config";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return pageMetadata({ locale: locale as Locale, path: "", description: t.meta.description });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const t = getDictionary(locale);

  const [featured, latest, categories] = await Promise.all([
    getProducts({ featuredOnly: true, limit: 8 }),
    getProducts({ limit: 8 }),
    getCategories(),
  ]);
  const showcase = featured.length > 0 ? featured : latest;

  return (
    <>
      {/* HERO */}
      <section className="container-site pb-16 pt-14 sm:pb-24 sm:pt-24">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">{t.home.eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          {t.home.heroTitle}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t.home.heroText}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href={`/${locale}/products`} className="btn-primary px-7">
            {t.home.heroCta}
          </Link>
          <Link href={`/${locale}/about`} className="btn-outline px-7">
            {t.home.heroSecondary}
          </Link>
        </div>
      </section>

      {/* PRODOTTI IN EVIDENZA */}
      <section className="container-site" aria-labelledby="featured-title">
        <div className="mb-6 flex items-end justify-between">
          <h2 id="featured-title" className="text-2xl font-semibold tracking-tight">
            {t.home.featured}
          </h2>
          <Link href={`/${locale}/products`} className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            {t.home.viewAll} →
          </Link>
        </div>
        {showcase.length === 0 ? (
          <p className="card p-10 text-center text-muted">{t.home.empty}</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {showcase.map((p, i) => (
              <ProductCard key={p.id} product={p} locale={locale} t={t} priority={i < 2} />
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIE */}
      {categories.length > 0 && (
        <section className="container-site mt-24" aria-labelledby="categories-title">
          <h2 id="categories-title" className="mb-6 text-2xl font-semibold tracking-tight">
            {t.home.categories}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/products?cat=${c.slug}`}
                className="card flex min-h-24 items-end justify-between p-5 transition-colors hover:border-ink"
              >
                <span className="font-medium">{localized(c, "name", locale)}</span>
                <span aria-hidden className="text-muted">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CHI SIAMO */}
      <section className="container-site mt-24">
        <div className="rounded-3xl bg-paper p-8 sm:p-14">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">{BRAND_NAME}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{t.home.aboutTitle}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">{t.home.aboutText}</p>
          <Link href={`/${locale}/about`} className="btn-outline mt-8">
            {t.home.aboutCta}
          </Link>
        </div>
      </section>
    </>
  );
}
