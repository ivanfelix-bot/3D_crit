import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { localized, type Dictionary, type Locale } from "@/lib/i18n";
import type { ProductWithImages } from "@/lib/types";
import { ProductPhoto } from "./ProductPhoto";
import { StatusBadge } from "./StatusBadge";

export function ProductCard({
  product,
  locale,
  t,
  priority = false,
}: {
  product: ProductWithImages;
  locale: Locale;
  t: Dictionary;
  priority?: boolean;
}) {
  const name = localized(product, "name", locale);
  const cover = product.product_images[0];

  return (
    <Link href={`/${locale}/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-paper">
        <ProductPhoto
          src={cover?.url}
          alt={cover?.alt || name}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.status !== "available" && (
          <div className="absolute left-3 top-3">
            <StatusBadge status={product.status} label={t.product.status[product.status]} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-snug text-ink">{name}</h3>
        <p className="shrink-0 text-sm text-muted">{formatPrice(product.price_cents, locale)}</p>
      </div>
    </Link>
  );
}
