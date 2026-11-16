import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getShippingCents } from "@/lib/config";
import { getPaymentsState } from "@/lib/payments/config";
import { PageHeader } from "@/components/site/PageHeader";
import { CartView } from "@/components/site/cart/CartView";

export const metadata: Metadata = { robots: { index: false } };

/** FASE 2 – Carrello. Finché i pagamenti sono spenti la pagina non esiste (404). */
export default async function CartPage({ params }: PageProps<"/[locale]/cart">) {
  const { locale } = await params;
  const payments = await getPaymentsState();
  if (!payments.enabled) notFound();
  const t = getDictionary(locale);
  return (
    <div className="container-site">
      <PageHeader title={t.cart.title} />
      <CartView locale={locale as Locale} t={t} shippingCents={getShippingCents()} stripe={payments.stripe} paypal={payments.paypal} />
    </div>
  );
}
