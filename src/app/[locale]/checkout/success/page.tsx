import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { ClearCart } from "@/components/site/cart/ClearCart";

export const metadata: Metadata = { robots: { index: false } };

export default async function CheckoutSuccess({ params }: PageProps<"/[locale]/checkout/success">) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <div className="container-site flex flex-col items-center py-32 text-center">
      <ClearCart />
      <h1 className="text-3xl font-semibold">{t.cart.successTitle}</h1>
      <p className="mt-3 max-w-md text-muted">{t.cart.successText}</p>
      <Link href={`/${locale}/products`} className="btn-primary mt-8">
        {t.cart.continue}
      </Link>
    </div>
  );
}
