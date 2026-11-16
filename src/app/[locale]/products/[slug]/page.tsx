import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getProducts, getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { getDictionary, localized, LOCALES, type Locale } from "@/lib/i18n";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { getPaymentsState } from "@/lib/payments/config";
import { BRAND_NAME, getSiteUrl } from "@/lib/config";
import { Gallery } from "@/components/site/Gallery";
import { StatusBadge } from "@/components/site/StatusBadge";
import { MarketplaceButtons } from "@/components/site/MarketplaceButtons";
import { TrackView } from "@/components/site/TrackView";
import { ProductCard } from "@/components/site/ProductCard";
import { AddToCartButton } from "@/components/site/cart/AddToCartButton";

// I nuovi prodotti vengono generati al primo accesso e poi messi in cache.
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts();
  return LOCALES.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = localized(product, "name", locale);
  const description = localized(product, "description", locale).slice(0, 160) || getDictionary(locale).meta.description;
  const cover = product.product_images[0]?.url;
  return pageMetadata({
    locale,
    path: `/products/${product.slug}`,
    title: name,
    description,
    image: cover ? absoluteUrl(cover) : undefined,
  });
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [payments, settings, sameCategory] = await Promise.all([
    getPaymentsState(),
    getSettings(),
    product.category_id ? getProducts({ categorySlug: product.categories?.slug, limit: 5 }) : Promise.resolve([]),
  ]);
  const related = sameCategory.filter((p) => p.id !== product.id).slice(0, 4);

  const name = localized(product, "name", locale);
  const description = localized(product, "description", locale);
  const links = {
    vinted: product.vinted_url,
    ebay: product.ebay_url,
    amazon: product.amazon_url,
    wallapop: product.wallapop_url,
  };
  const hasLinks = Object.values(links).some(Boolean);
  const canBuyHere = payments.enabled && product.status !== "out_of_stock";

  // Dati strutturati per Google (solo dati reali: nessuna recensione o valutazione)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: product.product_images.map((i) => absoluteUrl(i.url)),
    brand: { "@type": "Brand", name: BRAND_NAME },
    material: product.material || undefined,
    offers: {
      "@type": "Offer",
      price: (product.price_cents / 100).toFixed(2),
      priceCurrency: "EUR",
      url: `${getSiteUrl()}/${locale}/products/${product.slug}`,
      availability:
        product.status === "available"
          ? "https://schema.org/InStock"
          : product.status === "made_to_order"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-site pt-8">
      <TrackView productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <Link href={`/${locale}/products`} className="text-sm text-muted hover:text-ink">
        ← {t.product.back}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Gallery images={product.product_images.map((i) => ({ url: i.url, alt: i.alt || name }))} alt={name} />

        <div className="lg:pt-4">
          {product.is_demo && (
            <p className="mb-4 inline-block rounded-full bg-cream-dark px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted">
              {t.product.demo}
            </p>
          )}
          {product.categories && (
            <p className="text-sm text-muted">{localized(product.categories, "name", locale)}</p>
          )}
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-2xl">{formatPrice(product.price_cents, locale)}</p>
            <StatusBadge status={product.status} label={t.product.status[product.status]} />
          </div>

          {description && (
            <div className="mt-6 whitespace-pre-line leading-relaxed text-muted">{description}</div>
          )}

          <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
            {product.material && (
              <div className="flex justify-between py-3">
                <dt className="text-muted">{t.product.material}</dt>
                <dd>{product.material}</dd>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between py-3">
                <dt className="text-muted">{t.product.dimensions}</dt>
                <dd>{product.dimensions}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 space-y-3">
            {canBuyHere && (
              <AddToCartButton
                item={{
                  id: product.id,
                  slug: product.slug,
                  name,
                  price_cents: product.price_cents,
                  image: product.product_images[0]?.url,
                }}
                label={t.product.addToCart}
                addedLabel={t.product.added}
              />
            )}
            {hasLinks ? (
              <MarketplaceButtons productId={product.id} links={links} label={t.product.buyOn} />
            ) : (
              !canBuyHere && (
                <div className="card p-5 text-sm text-muted">
                  <p>{t.product.noLinks}</p>
                  <Link href={`/${locale}/contact`} className="btn-outline mt-4">
                    {t.product.contactUs}
                  </Link>
                </div>
              )
            )}
            {settings?.contact_email && hasLinks && (
              <p className="pt-2 text-xs text-muted">
                <a className="underline" href={`mailto:${settings.contact_email}?subject=${encodeURIComponent(name)}`}>
                  {t.product.contactUs}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">{t.product.related}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} t={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
