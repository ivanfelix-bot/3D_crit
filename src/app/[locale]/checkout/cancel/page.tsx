import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { robots: { index: false } };

export default async function CheckoutCancel({ params }: PageProps<"/[locale]/checkout/cancel">) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <div className="container-site flex flex-col items-center py-32 text-center">
      <h1 className="text-3xl font-semibold">{t.cart.cancelTitle}</h1>
      <p className="mt-3 max-w-md text-muted">{t.cart.cancelText}</p>
      <Link href={`/${locale}/cart`} className="btn-primary mt-8">
        {t.cart.backToCart}
      </Link>
    </div>
  );
}
